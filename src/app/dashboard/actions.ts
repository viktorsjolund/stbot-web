'use server'

import { Session, getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import { prisma } from '@/prisma'
import { getSpotifyAccessToken } from '@/util/spotify'
import axios, { AxiosError } from 'axios'
import {
  getBroadcasterId,
  getTwitchAccessToken,
  getTwitchAppAccessToken,
  removeWebhook,
} from '@/util/twitch'
import { Account, SongRedemptionUser, User } from '@prisma/client'
import { sendJoinToQueue, sendPartToQueue } from '@/util/messageBroker'

export async function isUserConnected(session: Session) {
  const user = await prisma.user.findUnique({
    where: {
      name: session.user.name!,
    },
  })

  if (!user) return false
  if (!user.spotifyRefreshToken) return false

  const result = await getSpotifyAccessToken(user.spotifyRefreshToken)
  if (!result) {
    return false
  }

  return true
}

export async function isActiveUser(session: Session) {
  try {
    const result = await prisma.activeUser.findFirst({
      where: {
        user_id: session.user.id,
      },
    })
    if (result) {
      return true
    }
  } catch (e) {
    return false
  }

  return false
}

export async function isSongRedeemEnabled(session: Session) {
  try {
    const result = await prisma.songRedemptionUser.findUnique({
      where: {
        user_id: session.user.id,
      },
    })
    if (result) {
      return true
    } else {
      return false
    }
  } catch (e) {
    return false
  }
}

export async function addActiveUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  try {
    const broadcasterId = await getBroadcasterId(session.user.id)
    const accessToken = await getTwitchAppAccessToken()

    const streamOnlineRes = await axios.post(
      'https://api.twitch.tv/helix/eventsub/subscriptions',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
        },
        data: {
          type: 'stream.online',
          version: '1',
          condition: {
            broadcaster_user_id: broadcasterId,
          },
          transport: {
            method: 'webhook',
            callback: `${process.env.PUBLIC_URL}/api/webhook/stream/online`,
            secret: process.env.TWITCH_WEBHOOK_CALLBACK_SECRET,
          },
        },
      },
    )

    if (streamOnlineRes.status !== 202) {
      throw new Error('Failed to create stream online webhook subscription')
    }

    const streamOfflineRes = await axios.post(
      'https://api.twitch.tv/helix/eventsub/subscriptions',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
        },
        data: {
          type: 'stream.offline',
          version: '1',
          condition: {
            broadcaster_user_id: broadcasterId,
          },
          transport: {
            method: 'webhook',
            callback: `${process.env.PUBLIC_URL}/api/webhook/stream/offline`,
            secret: process.env.TWITCH_WEBHOOK_CALLBACK_SECRET,
          },
        },
      },
    )

    if (streamOfflineRes.status !== 202) {
      throw new Error('Failed to create stream offline webhook subscription')
    }

    await prisma.activeUser.create({
      data: {
        user_id: session.user.id,
        online_webhook_id: streamOnlineRes.data.data[0].id,
        offline_webhook_id: streamOfflineRes.data.data[0].id,
      },
    })
  } catch (e) {
    throw e
  }

  try {
    await sendJoinToQueue(session.user.name!)
  } catch (e) {
    throw e
  }
}

export async function removeActiveUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  try {
    const user = await prisma.activeUser.findFirstOrThrow({
      where: {
        user_id: session.user.id,
      },
    })

    await removeWebhook(user.online_webhook_id)
    await removeWebhook(user.offline_webhook_id)

    await prisma.activeUser.delete({
      where: {
        user_id: session.user.id,
      },
    })
  } catch (e) {
    throw e
  }

  try {
    await sendPartToQueue(session.user.name!)
  } catch (e) {
    throw e
  }
}

export async function enableSongRequests() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  let user: (User & { accounts: Account[] }) | null
  try {
    user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        accounts: true,
      },
    })
  } catch (e) {
    throw e
  }

  const acc = user?.accounts.filter((acc) => acc.provider === 'twitch')[0]
  const broadcasterId = acc?.providerAccountId!
  if (!acc?.refresh_token) {
    throw new Error('Could not get twitch refresh token')
  }

  const accessToken = await getTwitchAccessToken(acc?.refresh_token)
  if (!accessToken) {
    throw new Error('Could not get twitch access token')
  }

  let result
  try {
    result = await axios(
      'https://api.twitch.tv/helix/channel_points/custom_rewards',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
          'Content-Type': 'application/json',
        },
        params: {
          broadcaster_id: broadcasterId,
        },
        data: {
          title: 'Queue a song - STBOT',
          prompt: 'Enter a Spotify song link below or do "ARTIST - SONG NAME"',
          cost: 50000,
          is_user_input_required: true,
        },
      },
    )
  } catch (e) {
    throw e
  }

  const rewardId = result.data.data[0].id
  const appAccessToken = await getTwitchAppAccessToken()

  try {
    await axios('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Content-Type': 'application/json',
      },
      data: {
        type: 'channel.channel_points_custom_reward_redemption.add',
        version: '1',
        condition: {
          broadcaster_user_id: broadcasterId,
          reward_id: rewardId,
        },
        transport: {
          method: 'webhook',
          callback: `${process.env.PUBLIC_URL}/api/webhook/song-redeem`,
          secret: process.env.TWITCH_WEBHOOK_CALLBACK_SECRET,
        },
      },
    })
  } catch (e) {
    await removeChannelPointReward(rewardId, broadcasterId, accessToken)
    throw e
  }

  try {
    await prisma.songRedemptionUser.create({
      data: {
        user_id: user?.id!,
        reward_id: rewardId,
      },
    })
  } catch (e) {
    throw e
  }
}

export async function disableSongRequests() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  let user:
    | (User & {
        accounts: Account[]
        songRedemptionUser: SongRedemptionUser | null
      })
    | null
  try {
    user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        accounts: true,
        songRedemptionUser: true,
      },
    })
  } catch (e) {
    throw e
  }

  if (!user?.songRedemptionUser?.reward_id) {
    throw new Error('Song redemptions not enabled')
  }

  const acc = user?.accounts.filter((acc) => acc.provider === 'twitch')[0]
  const broadcasterId = acc?.providerAccountId
  if (!acc?.refresh_token) {
    throw new Error('Could not get twitch refresh token')
  }

  const accessToken = await getTwitchAccessToken(acc.refresh_token)

  try {
    await removeChannelPointReward(
      user.songRedemptionUser.reward_id,
      broadcasterId,
      accessToken,
    )
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.status !== 404) {
        throw e
      }
    } else {
      throw e
    }
  }

  try {
    await prisma.songRedemptionUser.delete({
      where: {
        user_id: user.id,
      },
    })
  } catch (e) {
    throw e
  }
}

async function removeChannelPointReward(
  rewardId: string,
  broadcasterId: string,
  accessToken: string,
) {
  try {
    await axios('https://api.twitch.tv/helix/channel_points/custom_rewards', {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
      },
      params: {
        broadcaster_id: broadcasterId,
        id: rewardId,
      },
    })
  } catch (e) {
    throw e
  }
}

export async function disconnectSpotify() {
  const session = await getServerSession(authOptions)
  if (!session?.user.id) {
    throw Error('Unauthorized')
  }

  try {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        spotifyRefreshToken: null,
      },
    })
  } catch (e) {
    throw e
  }
}
