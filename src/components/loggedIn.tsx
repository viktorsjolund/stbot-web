'use client'

import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { CiLogout } from 'react-icons/ci'
import { RxDashboard } from 'react-icons/rx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { Separator } from './ui/separator'

type TLoggedInProps = {
  user: Session['user']
}

export const LoggedIn = (props: TLoggedInProps) => {
  const { user } = props

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Image
            src={user?.image!}
            alt={user?.name!}
            width={38}
            height={38}
            className='rounded-full cursor-pointer'
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className='p-3'>
          <DropdownMenuLabel className='flex items-center space-x-2'>
            <Image
              src={user?.image!}
              alt={user?.name!}
              width={42}
              height={42}
              className='rounded-full'
            />
            <span>{user.name!}</span>
          </DropdownMenuLabel>
          <Separator className='mt-2 mb-2' />
          <Link href='/dashboard'>
            <DropdownMenuItem className='cursor-pointer flex items-center w-full'>
              <div className='mr-2'>
                <RxDashboard size={22} />
              </div>
              <span>Dashboard</span>
            </DropdownMenuItem>
          </Link>
          <Separator className='mt-2 mb-2' />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/' })}
            className='cursor-pointer flex items-center w-full'
          >
            <div className='mr-2'>
              <CiLogout size={22} />
            </div>
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
