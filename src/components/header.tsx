import { authOptions } from '@/app/auth'
import { getServerSession } from 'next-auth'
import { LoggedIn } from './loggedIn'
import { LoggedOut } from './loggedOut'

export const Header = async () => {
  const session = await getServerSession(authOptions)
  return (
    <div className='h-14 bg-slate-900 flex items-center fixed w-full shadow-md'>
      <div className='ml-auto mr-3'>{session?.user ? <LoggedIn /> : <LoggedOut />}</div>
    </div>
  )
}
