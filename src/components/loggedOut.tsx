'use client'

import { signIn } from 'next-auth/react'
import { FaTwitch } from 'react-icons/fa'

export const LoggedOut = () => {
  return (
    <button
      onClick={() => signIn('twitch')}
      className='flex justify-center items-center rounded from-purple-800 to-purple-700 hover:from-purple-700 hover:to-purple-600 bg-gradient-to-r pt-1 pb-1 pr-4 pl-4'
    >
      <div className='mr-2'>
        <FaTwitch size={18} />
      </div>
      <span className='font-semibold text-lg'>Sign in</span>
    </button>
  )
}
