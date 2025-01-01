'use client'

import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { FaClipboardCheck } from 'react-icons/fa'
const MOD_COMMAND = `/mod ${process.env.NEXT_PUBLIC_BOT_USERNAME}`

export default function About() {
  const { toast } = useToast()

  const handleClipboardCopy = async () => {
    await navigator.clipboard.writeText(MOD_COMMAND)
    toast({
      description: (
        <div className='flex items-center space-x-2'>
          <div>
            <FaClipboardCheck size={20} />
          </div>
          <span className='font-semibold'>Copied to clipboard!</span>
        </div>
      ),
      variant: 'success',
    })
  }

  return (
    <div className='flex items-center h-full justify-center'>
      <div className='flex space-x-10 text-slate-300'>
        <div className='max-w-96'>
          <span className='text-2xl font-bold text-white'>Getting Started</span>
          <Separator />
          <div className='pr-2 pl-2 pt-4 pb-4'>
            <p>
              Get started by enabling the bot in the{' '}
              <Link
                href='/dashboard'
                className='underline hover:text-white transition-colors'
              >
                dashboard
              </Link>
              .
            </p>
            <br />
            <p>
              Then you need to mod the bot in your channel by typing
              <code
                className='bg-slate-800 rounded pr-1 pl-1 cursor-pointer mr-1 ml-1 text-white'
                onClick={handleClipboardCopy}
              >
                {MOD_COMMAND}
              </code>
              in your chat.
            </p>
          </div>
        </div>
        <div className='max-w-72'>
          <span className='text-2xl font-bold text-white'>Features</span>
          <Separator />
          <ul className='flex flex-col space-y-3 pr-2 pl-2 pt-4 pb-4 list-disc'>
            <li>
              <p>Chat commands for getting currently playing Spotify tracks.</p>
            </li>
            <li>
              <p>
                Optional: Channel point reward which can be used by viewers to
                queue songs using their channel points.
              </p>
            </li>
          </ul>
        </div>
        <div className='max-w-72'>
          <span className='text-2xl font-bold text-white'>Commands</span>
          <Separator />
          <ul className='flex flex-col space-y-3 pr-2 pl-2 pt-4 pb-4 list-disc'>
            <li>
              <p>
                <code className='pr-1 pl-1 bg-slate-800 rounded cursor-default mr-1 text-white'>
                  ?song
                </code>
                replies with the song name that is currently playing.
              </p>
            </li>
            <li>
              <p>
                <code className='pr-1 pl-1 bg-slate-800 rounded cursor-default mr-1 text-white'>
                  ?slink
                </code>
                replies with the song link that is currently playing.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
