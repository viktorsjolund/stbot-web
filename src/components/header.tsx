import { authOptions } from '@/app/auth'
import { getServerSession } from 'next-auth'
import { LoggedIn } from './loggedIn'
import { LoggedOut } from './loggedOut'
import Link from 'next/link'

export const Header = async () => {
  const session = await getServerSession(authOptions)

  return (
    <div className='h-14 bg-slate-900 flex items-center fixed w-full shadow-md'>
      <div className='flex items-center space-x-4'>
        <Link href='/'>
          <div className='ml-6 cursor-pointer pt-1 pb-1 pr-2 pl-2 rounded hover:bg-slate-800 transition-colors'>
            <span className='tracking-widest text-xl font-extrabold'>
              <span className='text-green-600'>S</span>
              <span className='text-purple-600'>T</span>
              <span>BOT</span>
            </span>
          </div>
        </Link>
        <Link href='/about'>
          <span className='font-bold tracking-wider text-slate-300 hover:text-slate-200 transition-colors'>ABOUT</span>
        </Link>
      </div>
      <div className='ml-auto pr-12'>
        {session?.user ? <LoggedIn user={session.user} /> : <LoggedOut />}
      </div>
    </div>
  )
}
