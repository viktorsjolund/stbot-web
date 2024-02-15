import type { AuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { Adapter } from 'next-auth/adapters'
import TwitchProvider from 'next-auth/providers/twitch'
import { prisma } from '@/prisma'

export const authOptions: AuthOptions = {
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid user:read:email channel:manage:redemptions'
        }
      }
    })
  ],
  adapter: PrismaAdapter(prisma) as Adapter,
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id
      }
    })
  },
  pages: {
    newUser: '/dashboard',
    signIn: '/',
    signOut: '/'
  }
}
