import { NextRequest, NextResponse } from 'next/server'
import { getHmac, getHmacMessage, verifyMessage } from '@/util/hmacHandler'
import { sendJoinToQueue } from '@/util/messageBroker'
const messageIds = new Set<string>()

async function handler(req: NextRequest) {
  const rawBody = Buffer.from(await req.arrayBuffer())
  const body = JSON.parse(rawBody.toString())

  if (
    req.headers.get('twitch-eventsub-message-type') ===
    'webhook_callback_verification'
  ) {
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

  if (
    !verifyMessage(hmac, req.headers.get('twitch-eventsub-message-signature')!)
  ) {
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

  try {
    await sendJoinToQueue(body.event.broadcaster_user_name)
  } catch (e) {
    return NextResponse.json(
      { error: 'Could not send message to queue.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ message: 'OK' }, { status: 200 })
}

export { handler as GET, handler as POST }
