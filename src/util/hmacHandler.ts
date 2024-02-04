import crypto from 'crypto'
import { NextRequest } from 'next/server'

export class HmacHandler {
  getHmacMessage(req: NextRequest, body: Buffer) {
    if (
      !req.headers.get('twitch-eventsub-message-id') ||
      !req.headers.get('twitch-eventsub-message-timestamp')
    ) {
      return ''
    }

    return (
      req.headers.get('twitch-eventsub-message-id')! +
      req.headers.get('twitch-eventsub-message-timestamp')! +
      body
    )
  }

  getHmac(message: string) {
    return crypto
      .createHmac('sha256', process.env.TWITCH_WEBHOOK_CALLBACK_SECRET!)
      .update(message)
      .digest('hex')
  }

  verifyMessage(hmac: string, verifySignature: string) {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature))
  }
}
