import Link from 'next/link'
import Navbar from './Navbar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-4 motion-safe:animate-fade-in">{children}</main>
    </div>
  )
}
