import axios from 'axios'
import { prisma } from '@/prisma'

export const getTwitchAccessToken = async (refreshToken: string) => {
  try {
    const result = await axios('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
      },
    })

    return result.data.access_token
  } catch (e) {
    return null
  }
}

export const getTwitchAppAccessToken = async () => {
  try {
    const result = await axios('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: {
        grant_type: 'client_credentials',
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        client_id: process.env.TWITCH_CLIENT_ID,
      },
    })

    return result.data.access_token
  } catch (e) {
    return null
  }
}

export const getBroadcasterId = async (userId: string) => {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        id: userId,
      },
    })

    return accounts.filter((a) => a.provider === 'twitch')[0].providerAccountId
  } catch (e) {
    throw e
  }
}

export const removeWebhook = async (id: string) => {
  const accessToken = getTwitchAppAccessToken()

  try {
    await axios('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
      },
      params: {
        id,
      },
    })
  } catch (e) {
    throw e
  }
}

export const refundChannelPoints = async (
  redemptionId: string,
  rewardId: string,
  broadcasterId: string,
  accessToken: string,
) => {
  try {
    await axios(
      'https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
        },
        data: {
          status: 'CANCELED',
        },
        params: {
          id: redemptionId,
          broadcaster_id: broadcasterId,
          reward_id: rewardId,
        },
      },
    )
  } catch (e) {
    throw e
  }
}
