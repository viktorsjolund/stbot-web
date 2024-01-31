import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma'
import { ActiveUser, User } from '@prisma/client'
import { getCurrentSong, getSpotifyAccessToken } from '@/util/spotify'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')
  if (!username) {
    return NextResponse.json({ error: 'No username provided.' }, { status: 400 })
  }

  let user: (User & { activeUser: ActiveUser | null }) | null
  try {
    user = await prisma.user.findUnique({
      where: {
        name: username
      },
      include: {
        activeUser: true
      }
    })

    if (!user?.activeUser) {
      return NextResponse.json({ error: 'User does not have the bot enabled.' }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Username not found.' }, { status: 404 })
  }

  if (!user.spotifyRefreshToken) {
    return NextResponse.json({ error: 'User not connected to spotify.' }, { status: 400 })
  }

  const accessToken = await getSpotifyAccessToken(user.spotifyRefreshToken)
  if (!accessToken) {
    return NextResponse.json({ error: 'Invalid refresh token.' }, { status: 400 })
  }

  const song = await getCurrentSong(accessToken)
  if (!song) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ song })
}
