import axios from 'axios'

export const getSpotifyAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const result = await axios('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      data: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }
    })

    return result.data.access_token as string
  } catch (e) {
    return null
  }
}

export const getCurrentSong = async (accessToken: string): Promise<{ status: number, data: Object } | null> => {
  try {
    const result = await axios('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    return {
      data: result.data,
      status: result.status
    }
  } catch (e) {
    return null
  }
}

export const dynamic = 'force-dynamic'
