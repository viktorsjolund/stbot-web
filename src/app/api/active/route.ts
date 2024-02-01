import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma'
import { ActiveUser, User } from '@prisma/client'

export async function GET(req: NextRequest) {
  let activeUsers: (ActiveUser & { user: User })[]

  try {
    activeUsers = await prisma.activeUser.findMany({
      include: {
        user: true
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }

  const usernames = activeUsers.map((u) => u.user.name)

  return NextResponse.json({ users: usernames })
}

export const dynamic = 'force-dynamic'
