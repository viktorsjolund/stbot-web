import axios from 'axios'
import { getSpotifyAccessToken } from '@/util/spotify'
import { HmacHandler } from '@/util/hmacHandler'
import { NextRequest, NextResponse } from 'next/server'
import { NextApiResponse } from 'next'
import { prisma } from '@/prisma'
import { User } from '@prisma/client'
const messageIds = new Set<string>()

async function handler(req: NextRequest, res: NextApiResponse) {
  const hmh = new HmacHandler()
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

  const message = hmh.getHmacMessage(req, rawBody)
  const hmac = 'sha256=' + hmh.getHmac(message)

  if (!hmh.verifyMessage(hmac, req.headers.get('twitch-eventsub-message-signature')!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const messageId = req.headers.get('twitch-eventsub-message-id')![0]

  if (messageIds.has(messageId)) {
    return NextResponse.json('OK', { status: 200 })
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
    return NextResponse.json('OK', { status: 200 })
  }
  let trackId = ''

  if (input.includes('open.spotify.com/track/')) {
    const tokens = input.split('/')
    trackId = tokens[tokens.length - 1].split('?')[0]
  } else {
    const tokens = input.split('-')

    if (tokens.length !== 2) {
      return NextResponse.json('OK', { status: 200 })
    }

    const artist = tokens[0].trim()
    const song = tokens[tokens.length - 1].trim()

    try {
      const result = await axios('https://api.spotify.com/v1/search', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          q: `remaster%20track:${song}%20artist:${artist}`,
          type: 'track',
          limit: 1,
          offset: 0
        }
      })

      trackId = result.data.tracks.items[0].uri.split(':')[2]
    } catch (e) {
      return NextResponse.json('OK', { status: 200 })
    }
  }

  try {
    await axios('https://api.spotify.com/v1/me/player/queue', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: { uri: `spotify:track:${trackId}` }
    })
  } catch (e) {
    return NextResponse.json('OK', { status: 200 })
  }

  return NextResponse.json('OK', { status: 200 })
}

export { handler as GET, handler as POST }
