'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import { prisma } from '@/prisma'
import amqp from 'amqplib/callback_api'
import { getSpotifyAccessToken } from '@/util/spotify'

export async function isUserConnected() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.name) {
    return false
  }
  const user = await prisma.user.findUnique({
    where: {
      name: session?.user?.name
    }
  })

  if (!user) return false
  if (!user.spotifyRefreshToken) return false

  const result = await getSpotifyAccessToken(user.spotifyRefreshToken)
  if (!result) {
    return false
  }

  return true
}

export async function isActiveUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return false
  }

  try {
    const result = await prisma.activeUser.findFirst({
      where: {
        user_id: session.user.id
      }
    })
    if (result) {
      return true
    }
  } catch (e) {
    return false
  }

  return false
}

export async function addActiveUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.activeUser.create({
      data: {
        user_id: session.user.id
      }
    })
  } catch (e) {
    throw e
  }

  amqp.connect(process.env.AMQP_URL!, (err, connection) => {
    if (err) {
      throw err
    }

    connection.createChannel((err1, channel) => {
      if (err1) {
        throw err1
      }

      const queue = 'send'
      const msg = 'JOIN #' + session.user.name!

      channel.assertQueue(queue, {
        durable: false
      })

      channel.sendToQueue(queue, Buffer.from(msg))
      console.log(`[x] Sent ${msg}`)
    })

    setTimeout(() => {
      connection.close()
    }, 500)
  })
}

export async function removeActiveUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.activeUser.delete({
      where: {
        user_id: session.user.id
      }
    })
  } catch (e) {
    throw e
  }

  amqp.connect(process.env.AMQP_URL!, (err, connection) => {
    if (err) {
      throw err
    }

    connection.createChannel((err1, channel) => {
      if (err1) {
        throw err1
      }

      const queue = 'send'
      const msg = 'PART #' + session.user.name!

      channel.assertQueue(queue, {
        durable: false
      })

      channel.sendToQueue(queue, Buffer.from(msg))
      console.log(`[x] Sent ${msg}`)
    })

    setTimeout(() => {
      connection.close()
    }, 500)
  })
}
