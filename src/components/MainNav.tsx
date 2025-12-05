import Link from "next/link"
import { Button } from "@/components/ui/button"

export function MainNav() {
  return (
    <nav className="border-b border-gray-700 bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">FA Helper</span>
          </Link>
          <div className="hidden space-x-6 md:flex">
            <NavLink href="/">Accueil</NavLink>
            <NavLink href="/teams">Équipes</NavLink>
            <NavLink href="/scrims">Scrims</NavLink>
            <NavLink href="/profiles">Profils</NavLink>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/create-profile">
            <Button className="bg-red-600 text-white hover:bg-red-700">
              Créer un profil
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
    >
      {children}
    </Link>
  )
}
