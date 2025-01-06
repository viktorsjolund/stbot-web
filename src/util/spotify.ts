import axios, { AxiosError } from 'axios'

export async function getSpotifyAccessToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const result = await axios('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString('base64')}`,
      },
      data: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
    })

    return result.data.access_token as string
  } catch (e) {
    return null
  }
}

export async function skipCurrentSong(
  accessToken: string,
): Promise<{ status: number; message?: string }> {
  try {
    await axios('https://api.spotify.com/v1/me/player/next', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return {
      status: 200,
    }
  } catch (e) {
    if (e instanceof AxiosError) {
      return {
        status: e.status || 400,
        message: e.message,
      }
    }

    return {
      status: 500,
    }
  }
}

export async function getCurrentSong(
  accessToken: string,
): Promise<{ status: number; data: Object } | null> {
  try {
    const result = await axios(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return {
      data: result.data,
      status: result.status,
    }
  } catch (e) {
    return null
  }
}

export async function getTrackIdFromSearch(input: string, accessToken: string) {
  try {
    const result = await axios('https://api.spotify.com/v1/search', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: encodeURIComponent(input),
        type: 'track',
        limit: 1,
        offset: 0,
      },
    })

    return result.data.tracks.items[0].uri.split(':')[2] as string
  } catch (e) {
    throw e
  }
}

export async function getTrack(trackId: string, accessToken: string) {
  try {
    const result = await axios(`https://api.spotify.com/v1/tracks/${trackId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return result.data
  } catch (e) {
    throw e
  }
}

export async function queueSong(trackId: string, accessToken: string) {
  try {
    await axios('https://api.spotify.com/v1/me/player/queue', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: { uri: `spotify:track:${trackId}` },
    })
  } catch (e) {
    throw e
  }
}
