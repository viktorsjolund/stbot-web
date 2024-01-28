'use client'

import { signOut } from 'next-auth/react'

export const LoggedIn = () => {
  return <button onClick={() => signOut()}>Sign out</button>
}
