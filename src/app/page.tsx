import Link from 'next/link'

export default function Home() {
  return (
    <div className='flex justify-center items-center h-full'>
      <Link href='/dashboard'>
        <button className='rounded pt-2 pb-2 pr-4 pl-4 bg-slate-950 text-xl shadow-lg'>Go To Dashboard</button>
      </Link>
    </div>
  )
}
