import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma'
import { Account, ActiveUser, User } from '@prisma/client'
import { getTwitchAppAccessToken } from '@/util/twitch'
import axios from 'axios'

export async function GET(req: NextRequest) {
  let activeUsers: (ActiveUser & { user: User & { accounts: Account[] } })[]

  try {
    activeUsers = await prisma.activeUser.findMany({
      include: {
        user: {
          include: {
            accounts: true,
          },
        },
      },
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }

  const accessToken = await getTwitchAppAccessToken()
  const broadcasterIds = activeUsers.map(
    (u) =>
      u.user.accounts.filter((a) => a.provider === 'twitch')[0]
        .providerAccountId,
  )

  if (broadcasterIds.length === 0) {
    return NextResponse.json({ users: [] })
  }

  try {
    const liveStreams = await axios.get('https://api.twitch.tv/helix/streams', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
      },
      params: {
        user_id: broadcasterIds,
        type: 'live',
      },
    })
    return NextResponse.json({ users: liveStreams.data.data })
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
