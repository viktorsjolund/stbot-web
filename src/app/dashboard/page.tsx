'use client'

import Link from 'next/link'
import { FaSpotify } from 'react-icons/fa'
import { Switch } from '@/components/ui/switch'
import { FormEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { addActiveUser, isActiveUser, isUserConnected, removeActiveUser } from './actions'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { MdOutlineLinkOff } from 'react-icons/md'
import { useToast } from '@/components/ui/use-toast'
import { IoIosCheckmarkCircleOutline } from 'react-icons/io'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [initialChecked, setInitialChecked] = useState<boolean>()
  const [isChecked, setIsChecked] = useState<boolean>()
  const [isConnected, setIsConnected] = useState<boolean>()
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => router.push('/')
  })
  const { toast } = useToast()

  useEffect(() => {
    ;(async () => {
      const connected = await isUserConnected()
      const activeUser = await isActiveUser()
      setIsConnected(connected)
      setIsChecked(activeUser)
      setInitialChecked(activeUser)
    })()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setInitialChecked(isChecked)
    if (isChecked) {
      try {
        await addActiveUser()
        setInitialChecked(isChecked)
        toast({
          description: (
            <div className='flex justify-center items-center space-x-2'>
              <div>
                <IoIosCheckmarkCircleOutline size={20} />
              </div>
              <span className='text-base'>Saved!</span>
            </div>
          ),
          variant: 'success'
        })
      } catch (e) {
        toast({
          description: (
            <div className='flex justify-center items-center space-x-2'>
              <span className='text-base'>Could not save. Please try again.</span>
            </div>
          ),
          variant: 'destructive'
        })
      }
    } else {
      try {
        await removeActiveUser()
        setInitialChecked(isChecked)
        toast({
          description: (
            <div className='flex justify-center items-center space-x-2'>
              <div>
                <IoIosCheckmarkCircleOutline size={20} />
              </div>
              <span className='text-base'>Saved!</span>
            </div>
          ),
          variant: 'success'
        })
      } catch (e) {
        toast({
          description: (
            <div className='flex justify-center items-center space-x-2'>
              <span className='text-base'>Could not save. Please try again.</span>
            </div>
          ),
          variant: 'destructive'
        })
      }
    }
    setIsSaving(false)
  }

  if (
    typeof isChecked === 'undefined' ||
    typeof isConnected === 'undefined' ||
    status === 'loading'
  ) {
    return (
      <div className='flex justify-center items-center h-full'>
        <Loader2 className='animate-spin' size={34} />
      </div>
    )
  }

  return (
    <div className='h-full'>
      <div className='p-6 flex justify-center items-center h-full'>
        {isConnected ? (
          <div className='flex flex-col space-y-4 w-60'>
            <span className='text-3xl font-semibold'>Settings</span>
            <Separator />
            <div className='flex items-center space-x-2'>
              <div>
                <FaSpotify
                  size={26}
                  fill='#1DB954'
                />
              </div>
              <span>Connected</span>
            </div>
            <Button
              className='w-fit flex space-x-2'
              variant='destructive'
            >
              <div>
                <MdOutlineLinkOff size={20} />
              </div>
              <span>Disconnect Spotify</span>
            </Button>
            <form
              onSubmit={handleSubmit}
              className='flex flex-col space-y-4'
            >
              <div className='flex items-center space-x-2'>
                <Switch
                  checked={isChecked}
                  id='enabled'
                  onCheckedChange={() => setIsChecked((s) => !s)}
                />
                <Label htmlFor='enabled'>Enable Bot</Label>
              </div>
              <Separator />
              <Button
                className='w-fit'
                type='submit'
                variant='outline'
                onClick={() => {}}
                disabled={initialChecked === isChecked || isSaving}
              >
                {isSaving ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Save'}
              </Button>
            </form>
          </div>
        ) : (
          <div className='flex flex-col space-y-4 items-center'>
            <span className='text-2xl font-bold text-muted-foreground'>
              Connect your Spotify to get started.
            </span>
            <Link
              href={`https://accounts.spotify.com/authorize?response_type=code&client_id=${
                process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
              }&scope=user-read-currently-playing+user-read-playback-state&redirect_uri=${
                process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
              }&state=${crypto.randomUUID()}`}
              className='inline-block'
            >
              <button className='bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 flex justify-center items-center rounded p-2 w-fit'>
                <div className='mr-2'>
                  <FaSpotify />
                </div>
                <span>Connect your Spotify</span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
