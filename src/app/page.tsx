'use client'

import { Button } from '@/components/ui/button'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { FaGithub, FaTwitch } from 'react-icons/fa'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className='flex justify-center items-center h-full'>
      <div className='flex flex-col items-center'>
        <span className='text-6xl tracking-widest font-extrabold mb-2'>
          <span className='text-green-600'>S</span>
          <span className='text-purple-600'>T</span>BOT
        </span>
        <span className='mb-5 text-muted-foreground'>
          A Twitch bot made for getting Spotify songs.
        </span>
        {session ? (
          <Link href='/dashboard'>
            <Button className='bg-secondary-foreground'>Go To Dashboard</Button>
          </Link>
        ) : (
          <button
            onClick={() => signIn('twitch')}
            className='flex justify-center items-center rounded from-purple-800 to-purple-700 hover:from-purple-700 hover:to-purple-600 bg-gradient-to-r pt-2 pb-2 pr-4 pl-4'
          >
            <div className='mr-4'>
              <FaTwitch size={18} />
            </div>
            <span className='font-'>Sign in with Twitch</span>
          </button>
        )}
        <a
          href='https://github.com/ViktorSjolund/rust-ttv-song-bot'
          target='_blank'
        >
          <Button
            variant='ghost'
            className='mt-6 p-2'
          >
            <FaGithub size={32} />
          </Button>
        </a>
      </div>
    </div>
  )
}
