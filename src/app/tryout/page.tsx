export default function TryoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">
            Organiser un tryout
          </p>
          <h1 className="text-3xl font-semibold">Organiser un tryout</h1>
          <p className="text-sm text-slate-300">
            Planifie des scrims publics ou privés, partage les slots disponibles et centralise les
            candidatures joueurs.
          </p>
        </header>

        <main className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <p className="text-sm text-slate-300">
            Le module de gestion des tryouts arrive bientôt. Tu pourras bientôt :
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Créer un calendrier de créneaux de scrims.</li>
            <li>Inviter des joueurs ou ouvrir les inscriptions.</li>
            <li>Suivre les retours staff et les performances.</li>
          </ul>
        </main>
      </div>
    </div>
  )
}


