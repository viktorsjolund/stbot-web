import Link from 'next/link'
import { FaSpotify } from 'react-icons/fa'

export default async function Dashboard() {
  return (
    <div className='h-full pt-14'>
      <Link
        href={`https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&scope=user-read-currently-playing+user-read-playback-state&redirect_uri=${process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI}&state=${crypto.randomUUID()}`}
      >
        <div>
          <FaSpotify />
        </div>
      </Link>
    </div>
  )
}
