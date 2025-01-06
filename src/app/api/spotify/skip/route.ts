import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma'
import { ActiveUser, User } from '@prisma/client'
import { getSpotifyAccessToken, skipCurrentSong } from '@/util/spotify'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export async function POST(req: NextRequest) {
  const channelName = req.nextUrl.searchParams.get('channel_name')
  if (!channelName) {
    return NextResponse.json(
      { error: 'No username provided.' },
      { status: 400 },
    )
  }

  let user: (User & { activeUser: ActiveUser | null }) | null
  try {
    user = await prisma.user.findFirst({
      where: {
        name: {
          equals: channelName,
          mode: 'insensitive',
        },
      },
      include: {
        activeUser: true,
      },
    })

    if (!user?.activeUser) {
      return NextResponse.json(
        { error: 'User does not have the bot enabled.' },
        { status: 403 },
      )
    }
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      // No records found from where clause: https://www.prisma.io/docs/orm/reference/error-reference#p2001
      if (e.code === 'P2001') {
        return NextResponse.json(
          { error: 'Username not found.' },
          { status: 404 },
        )
      }
    }
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 },
    )
  }

  if (!user.spotifyRefreshToken) {
    return NextResponse.json(
      { error: 'User not connected to spotify.' },
      { status: 403 },
    )
  }

  const accessToken = await getSpotifyAccessToken(user.spotifyRefreshToken)
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Invalid refresh token.' },
      { status: 400 },
    )
  }

  const result = await skipCurrentSong(accessToken)

  if (result.status !== 200) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    )
  }

  return new Response(null, { status: 204 })
}

export const dynamic = 'force-dynamic'
