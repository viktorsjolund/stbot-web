import { getSpotifyAccessToken, getTrack, getTrackIdFromSearch, queueSong } from '@/util/spotify'
import { getHmac, getHmacMessage, verifyMessage } from '@/util/hmacHandler'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma'
import { User } from '@prisma/client'
import { sendMessageToQueue } from '@/util/messageBroker'
import { refundChannelPoints } from '@/util/twitch'
const messageIds = new Set<string>()

async function handler(req: NextRequest) {
  const rawBody = Buffer.from(await req.arrayBuffer())
  const body = JSON.parse(rawBody.toString())

  if (req.headers.get('twitch-eventsub-message-type') === 'webhook_callback_verification') {
    return new Response(body.challenge, { status: 200 })
  }

  if (req.headers.get('twitch-eventsub-message-type') !== 'notification') {
    return NextResponse.json({ error: 'Invalid message type' }, { status: 400 })
  }

  if (!req.headers.get('twitch-eventsub-message-signature')) {
    return NextResponse.json({ error: 'Invalid headers' }, { status: 400 })
  }

  const message = getHmacMessage(req, rawBody)
  const hmac = 'sha256=' + getHmac(message)

  if (!verifyMessage(hmac, req.headers.get('twitch-eventsub-message-signature')!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const messageId = req.headers.get('twitch-eventsub-message-id')![0]

  if (messageIds.has(messageId)) {
    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } else {
    messageIds.add(messageId)
    setTimeout(() => messageIds.delete(messageId), 1000 * 60 * 5)
  }

  if (!body.event) {
    return NextResponse.json({ error: 'No event' }, { status: 400 })
  }

  const input = body.event.user_input
  if (!input) {
    return NextResponse.json({ error: 'No input' }, { status: 400 })
  }

  let user: User | null
  try {
    user = await prisma.user.findUnique({
      where: {
        name: body.event.broadcaster_user_name
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong...' }, { status: 500 })
  }

  if (!user?.spotifyRefreshToken) {
    return NextResponse.json({ error: 'No spotify refresh token' }, { status: 400 })
  }

  const accessToken = await getSpotifyAccessToken(user.spotifyRefreshToken)
  if (!accessToken) {
    return NextResponse.json({ error: 'Could not get access token.' }, { status: 500 })
  }

  let trackId = ''
  const broadcasterId = body.event.broadcaster_user_id
  const redemptionId = body.event.id
  const rewardId = body.event.reward.id

  if (input.includes('open.spotify.com')) {
    const tokens = input.split('/')
    trackId = tokens[tokens.length - 1].split('?')[0]
  } else {
    const tokens = input.split('-')

    if (tokens.length !== 2) {
      await sendMessageToQueue(
        user.name!,
        "Could not queue. Don't use dashes in the artist/song name"
      )
      await refundChannelPoints(redemptionId, rewardId, broadcasterId, accessToken)
      return NextResponse.json({ error: 'Bad input' }, { status: 400 })
    }

    const artist = tokens[0].trim()
    const song = tokens[tokens.length - 1].trim()

    try {
      trackId = await getTrackIdFromSearch(song, artist, accessToken)
    } catch (e) {
      await refundChannelPoints(redemptionId, rewardId, broadcasterId, accessToken)
      return NextResponse.json({ error: 'Something went wrong...' }, { status: 500 })
    }
  }

  let track
  try {
    track = await getTrack(trackId, accessToken)
  } catch (e) {
    await sendMessageToQueue(user.name!, 'Could not find song.')
    await refundChannelPoints(redemptionId, rewardId, broadcasterId, accessToken)
    return NextResponse.json({ error: `Could not find song with id: ${trackId}` }, { status: 400 })
  }

  try {
    await queueSong(trackId, accessToken)
    await sendMessageToQueue(user.name!, `> ${track.artists[0].name} - ${track.name}`)
  } catch (e) {
    await sendMessageToQueue(user.name!, 'Could not queue song.')
    await refundChannelPoints(redemptionId, rewardId, broadcasterId, accessToken)
    return NextResponse.json({ error: 'Could not queue song' }, { status: 400 })
  }

  return NextResponse.json({ message: 'OK' }, { status: 200 })
}

export { handler as GET, handler as POST }
