import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function CreateProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-blue-300/80">
              Profil joueur / staff
            </p>
            <h1 className="text-2xl font-semibold">Créer mon profil</h1>
            <p className="mt-1 text-xs text-slate-300">
              Connecte ton compte Riot pour automatiser les stats et remplir ton profil en quelques secondes.
            </p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-sm text-slate-200">
              Retour au dashboard
            </Button>
          </Link>
        </header>

        <main className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
          <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-blue-500/10">
            <h2 className="text-lg font-semibold">Connexion Riot Games</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="bg-red-600 text-white hover:bg-red-500"
                size="lg"
              >
                <Link href="/api/riot/authorize">Se connecter avec Riot Games</Link>
              </Button>
              <p className="text-xs text-slate-400">
                Aucun mot de passe n&apos;est stocké. Tu peux révoquer l&apos;accès à tout moment depuis ton compte Riot.
              </p>
            </div>
          </section>

          <aside className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h3 className="text-sm font-semibold text-slate-100">Ce que ton profil va contenir</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Stats soloQ & flex mises à jour automatiquement</li>
              <li>• Rôles principaux et secondaires</li>
              <li>• Objectifs compétitifs (ligue / ERL / scrims)</li>
              <li>• Liens VOD, highlights, références coach</li>
            </ul>
          </aside>
        </main>
      </div>
    </div>
  )
}


