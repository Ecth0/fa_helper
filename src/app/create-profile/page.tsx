export default function CreateProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="grid grid-cols-3 items-center p-4 border-b">
        <div></div>
        <h1 className="text-xl font-semibold justify-self-center">Create Profile</h1>
        <div></div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col items-center gap-6">
            <p className="text-center text-gray-600">Connect your Riot Games account to continue.</p>
            <a
              href="/api/riot/authorize"
              className="inline-flex items-center justify-center rounded-md bg-red-600 text-white px-6 py-3 text-base font-semibold shadow hover:bg-red-700 transition-colors"
            >
              Log in with Riot Games
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}


