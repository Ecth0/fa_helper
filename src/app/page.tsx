import Link from "next/link"
import { Input } from "@/components/ui/input"
import { InputGroup } from "@/components/ui/input-group"

export function ButtonGroupInput() {
  return (
    <InputGroup className="w-full max-w-2xl h-12 mx-auto">
      <Input placeholder="Profile name" className="text-base" />
    </InputGroup> 
  )
}

export function BuildRequest() {
  return (
    <div className="-full max-w-2xl h-12 mx-auto">
      <aside className="mb-2 text-center text-sm text-gray-600">
        <Link href="/create-profile" className="w-full h-full bg-blue-400 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center">
          Create Profile
        </Link>
      </aside>
    </div>
  )
}


export default function Home() {
  return (
    <>
      <div className="flex min-h-screen">
        <aside className="w-64 min-h-screen border-r p-4">
        </aside>
        <main className="flex-1 flex flex-col">
          <header className="grid grid-cols-3 items-center p-4">
            <div></div>
            <h1 className="text-xl font-semibold justify-self-center">Fa_helper</h1>
            <Link
              href="/create-profile"
              className="justify-self-end bg-blue-600 text-white font-semibold rounded-md shadow px-2 py-2 text-base md:text-lg hover:bg-blue-700 transition-colors"
            >
              Create Profile
            </Link>
          </header>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full flex flex-col gap-4">
              <ButtonGroupInput />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

