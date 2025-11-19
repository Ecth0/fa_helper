export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-300/80">
            Trouver une equipe
          </p>
          <h1 className="text-3xl font-semibold">Trouver une équipe</h1>
          <p className="text-sm text-slate-300">
            Filtre les équipes par rôle, élo et disponibilités. Cette page servira à explorer les
            rosters ouverts et à postuler directement.
          </p>
        </header>

        <main className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <p className="text-sm text-slate-300">
            La recherche avancée d&apos;équipes arrive bientôt. Tu pourras bientôt :
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Filtrer par ligue, niveau et objectifs.</li>
            <li>Voir les besoins précis de chaque roster.</li>
            <li>Envoyer ton profil ou demander un tryout en un clic.</li>
          </ul>
        </main>
      </div>
    </div>
  )
}


