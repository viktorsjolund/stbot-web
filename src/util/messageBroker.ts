import amqp from 'amqplib'
let connection: amqp.Connection

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
  if (!connection) {
    try {
      if (process.env.NODE_ENV === 'development') {
        connection = await amqp.connect(process.env.AMQP_URL!)
      } else {
        connection = await amqp.connect({
          heartbeat: 60,
          frameMax: 0,
          password: process.env.AMQP_PASSWORD,
          username: process.env.AMQP_USERNAME,
          hostname: process.env.AMQP_HOSTNAME,
          port: 5671,
          vhost: process.env.AMQP_USERNAME,
          protocol: 'amqps',
        })
      }
    } catch (e) {
      throw e
    }
  }

  try {
    const ch = await connection.createChannel()
    const queue = 'send'
    await ch.assertQueue(queue, { durable: false })
    ch.sendToQueue(queue, Buffer.from(message))
    console.log(`[x] Sent ${message}`)
    await ch.close()
  } catch (e) {
    throw e
  }
}
