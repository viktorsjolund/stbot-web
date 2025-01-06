import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma'
import { User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export async function POST(req: NextRequest) {
  const channelName = req.nextUrl.searchParams.get('channel_name')
  if (!channelName) {
    return NextResponse.json(
      { error: 'No username provided.' },
      { status: 400 },
    )
  }

  let user: User | null
  try {
    user = await prisma.user.findFirst({
      where: {
        name: {
          equals: channelName,
          mode: 'insensitive',
        },
      },
    })
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      // No records found from where clause: https://www.prisma.io/docs/orm/reference/error-reference#p2001
      if (e.code === 'P2001') {
        return NextResponse.json(
          { error: 'Username not found.' },
          { status: 404 },
        )
      }
    }
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 },
    )
  }

  try {
    await prisma.skipUser.create({ data: { user_id: user!.id } })
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      // Unique constraint failed: https://www.prisma.io/docs/orm/reference/error-reference#p2002
      if (e.code === 'P2002') {
        return new Response(null, { status: 204 })
      }
    }
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 },
    )
  }

  return new Response(null, { status: 201 })
}

export const dynamic = 'force-dynamic'
