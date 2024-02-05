import axios from 'axios'

export const getTwitchAccessToken = async (refreshToken: string) => {
  try {
    const result = await axios('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET
      }
    })

    return result.data.access_token
  } catch (e) {
    return null
  }
}

export const getTwitchAppAccessToken = async () => {
  try {
    const result = await axios('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: {
        grant_type: 'client_credentials',
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        client_id: process.env.TWITCH_CLIENT_ID
      }
    })

    return result.data.access_token
  } catch (e) {
    return null
  }
}