import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { prisma } from '@/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.redirect(new URL('/?error=unauthorized', req.url))
  }

  if (error) {
    return NextResponse.redirect(new URL(`/dashboard?error=${error}`, req.url))
  } else if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=invalid_code', req.url))
  }

  if (code) {
    let result

    try {
      result = await axios('https://accounts.spotify.com/api/token', {
        method: 'POST',
        data: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI
        },
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
            ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    } catch (e) {
      return NextResponse.redirect(new URL('/dashboard?error=internal_server_error', req.url))
    }

    try {
      await prisma.user.update({
        data: {
          spotifyRefreshToken: result.data.refresh_token
        },
        where: {
          name: session.user.name!
        }
      })
    } catch (e) {
      return NextResponse.redirect(new URL('/dashboard?error=internal_server_error', req.url))
    }
  }

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
