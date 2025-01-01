'use client'

import Link from 'next/link'
import { FaSpotify } from 'react-icons/fa'
import { Switch } from '@/components/ui/switch'
import { FormEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  addActiveUser,
  disableSongRequests,
  disconnectSpotify,
  enableSongRequests,
  isActiveUser,
  isSongRedeemEnabled,
  isUserConnected,
  removeActiveUser,
} from './actions'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { MdOutlineLinkOff } from 'react-icons/md'
import { useToast } from '@/components/ui/use-toast'
import { IoIosCheckmarkCircleOutline } from 'react-icons/io'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PiWarningCircle } from 'react-icons/pi'

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState<boolean>()
  const [settings, setSettings] = useState({
    botEnabled: false,
    songRedeemEnabled: false,
    isLoading: true,
  })
  const [prevSettings, setPrevSettings] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [isInitialFetch, setIsInitialFetch] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => router.push('/'),
  })
  const { toast } = useToast()

  useEffect(() => {
    if (isInitialFetch && session) {
      setIsInitialFetch(false)
      if (error) {
        setTimeout(() => {
          toast({
            description: (
              <div className='flex items-center space-x-2'>
                <div>
                  <PiWarningCircle size={20} />
                </div>
                <span>{error.toUpperCase()}</span>
              </div>
            ),
            variant: 'destructive',
          })
        }, 0)
      }
      if (settings.isLoading) {
        ;(async () => {
          const [connected, activeUser, songRedeemEnabled] = await Promise.all([
            isUserConnected(session),
            isActiveUser(session),
            isSongRedeemEnabled(session),
          ])
          setIsConnected(connected)
          setSettings({
            ...settings,
            botEnabled: activeUser,
            songRedeemEnabled,
            isLoading: false,
          })
          setPrevSettings({
            ...settings,
            botEnabled: activeUser,
            songRedeemEnabled,
            isLoading: false,
          })
        })()
      }
    }
  }, [settings, session, isInitialFetch, toast, error])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const currentSettings = { ...settings }

    if (settings.songRedeemEnabled && !prevSettings.songRedeemEnabled) {
      try {
        await enableSongRequests()
      } catch (e) {
        currentSettings.songRedeemEnabled = false
        toast({
          description: (
            <div className='flex justify-center items-center space-x-2'>
              <div>
                <PiWarningCircle size={20} />
              </div>
              <span className='text-base'>
                Could not save. Please try again.
              </span>
            </div>
          ),
          variant: 'destructive',
        })
      }
    } else if (!settings.songRedeemEnabled && prevSettings.songRedeemEnabled) {
      try {
        await disableSongRequests()
      } catch (e) {
        currentSettings.songRedeemEnabled = true
        toast({
          description: (
            <div className='flex justify-center items-center space-x-2'>
              <div>
                <PiWarningCircle size={20} />
              </div>
              <span className='text-base'>
                Could not save. Please try again.
              </span>
            </div>
          ),
          variant: 'destructive',
        })
      }
    }

    if (settings.botEnabled && !prevSettings.botEnabled) {
      try {
        await addActiveUser()
      } catch (e) {
        currentSettings.botEnabled = false
        toast({
          description: (
            <div className='flex justify-center items-center space-x-2'>
              <div>
                <PiWarningCircle size={20} />
              </div>
              <span className='text-base'>
                Could not save. Please try again.
              </span>
            </div>
          ),
          variant: 'destructive',
        })
      }
    } else if (!settings.botEnabled && prevSettings.botEnabled) {
      try {
        await removeActiveUser()
      } catch (e) {
        currentSettings.botEnabled = true
        toast({
          description: (
            <div className='flex justify-center items-center space-x-2'>
              <div>
                <PiWarningCircle size={20} />
              </div>
              <span className='text-base'>
                Could not save. Please try again.
              </span>
            </div>
          ),
          variant: 'destructive',
        })
      }
    }

    if (JSON.stringify(settings) === JSON.stringify(currentSettings)) {
      setPrevSettings({ ...settings })
      toast({
        description: (
          <div className='flex justify-center items-center space-x-2'>
            <div>
              <IoIosCheckmarkCircleOutline size={20} />
            </div>
            <span className='text-base'>Saved!</span>
          </div>
        ),
        variant: 'success',
      })
    } else {
      setPrevSettings({ ...currentSettings })
    }

    setIsSaving(false)
  }

  const handleDisconnectSpotify = async () => {
    try {
      await disconnectSpotify()
      setIsConnected(false)
    } catch (e) {
      toast({
        description: (
          <div className='flex justify-center items-center space-x-2'>
            <div>
              <PiWarningCircle size={20} />
            </div>
            <span className='text-base'>
              Could not disconnect Spotify. Please try again.
            </span>
          </div>
        ),
        variant: 'destructive',
      })
    }
  }

  if (
    settings.isLoading ||
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
          <div className='flex flex-col space-y-4 w-72'>
            <span className='text-3xl font-semibold'>Settings</span>
            <Separator />
            <div className='flex items-center space-x-2'>
              <div>
                <FaSpotify size={26} fill='#1DB954' />
              </div>
              <span>Connected</span>
            </div>
            <Button
              className='w-fit flex space-x-2'
              variant='destructive'
              onClick={handleDisconnectSpotify}
            >
              <div>
                <MdOutlineLinkOff size={20} />
              </div>
              <span>Disconnect Spotify</span>
            </Button>
            <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
              <div className='flex items-center space-x-2'>
                <Switch
                  checked={settings.botEnabled}
                  id='bot-enabled'
                  onCheckedChange={() =>
                    setSettings((s) => ({ ...s, botEnabled: !s.botEnabled }))
                  }
                />
                <Label htmlFor='bot-enabled'>Enable Bot</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type='button'>
                      <div className='rounded-full w-6 h-6 bg-slate-900 hover:bg-slate-800 text-sm text-center font-bold border-2 transition-colors'>
                        ?
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Adds the bot to your channel</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  checked={settings.songRedeemEnabled}
                  id='song-redeem'
                  onCheckedChange={() =>
                    setSettings((s) => ({
                      ...s,
                      songRedeemEnabled: !s.songRedeemEnabled,
                    }))
                  }
                />
                <Label htmlFor='song-redeem'>Enable Song Redemptions</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type='button'>
                      <div className='rounded-full w-6 h-6 bg-slate-900 hover:bg-slate-800 text-sm text-center font-bold border-2 transition-colors'>
                        ?
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='w-60 break-words'>
                        Adds the possibility to queue Spotify songs through a
                        channel point reward to your channel
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Separator />
              <Button
                className='w-16'
                type='submit'
                variant='outline'
                disabled={
                  JSON.stringify(prevSettings) === JSON.stringify(settings) ||
                  isSaving
                }
              >
                {isSaving ? <Loader2 className='h-4 animate-spin' /> : 'Save'}
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
              }&scope=user-read-currently-playing+user-read-playback-state+user-modify-playback-state&redirect_uri=${
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
