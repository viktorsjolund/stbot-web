import amqp from 'amqplib'

export async function sendMessageToQueue(channel: string, message: string) {
  try {
    const msg = `PRIVMSG #${channel} :${message}`
    await sendToQueue(msg)
  } catch (e) {
    throw e
  }
}

export async function sendPartToQueue(channel: string) {
  try {
    const msg = `PART #${channel}`
    await sendToQueue(msg)
  } catch (e) {
    throw e
  }
}
export async function sendJoinToQueue(channel: string) {
  try {
    const msg = `JOIN #${channel}`
    await sendToQueue(msg)
  } catch (e) {
    throw e
  }
}

async function sendToQueue(message: string) {
  try {
    const conn = await amqp.connect(process.env.AMQP_URL!)
    const ch = await conn.createChannel()
    const queue = 'send'
    await ch.assertQueue(queue, { durable: false })
    ch.sendToQueue(queue, Buffer.from(message))
    console.log(`[x] Sent ${message}`)
    await ch.close()
    await conn.close()
  } catch (e) {
    throw e
  }
}
