import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TryoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase text-red-400">
              Organiser un scrim
            </p>
            <h1 className="text-3xl font-semibold text-white">Organiser un scrim</h1>
            <p className="text-sm text-slate-300">
              Planifie des scrims publics ou privés, partage les slots disponibles et centralise les
              candidatures joueurs.
            </p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-sm text-gray-200 hover:bg-red-900/30">
              Retour à la page principale
            </Button>
          </Link>
        </header>

        <main className="rounded-2xl border border-red-900/30 bg-gray-800/80 p-6 shadow-[0_4px_30px_rgba(255,0,0,0.1)]">
          <p className="text-sm text-slate-300">
            Le module de gestion des scrims arrive bientôt. Tu pourras bientôt :
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-300">
            <li className="text-gray-200">Créer un calendrier de créneaux de scrims.</li>
            <li className="text-gray-200">Inviter des joueurs ou ouvrir les inscriptions.</li>
            <li className="text-gray-200">Suivre les retours staff et les performances.</li>
          </ul>
        </main>
      </div>
    </div>
  )
}


