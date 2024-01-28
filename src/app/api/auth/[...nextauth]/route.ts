import NextAuth from 'next-auth'
import TwitchProvider from 'next-auth/providers/twitch'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { Adapter } from 'next-auth/adapters'

const prisma = new PrismaClient()

const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!
    })
  ],
})

export { handler as GET, handler as POST }
