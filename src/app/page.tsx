import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup } from "@/components/ui/input-group"

const quickActions = [
  {
    title: "Trouver une equipe",
    description: "Filtre par role, elo et disponibilites.",
    href: "/teams",
    badge: "",
  },
  {
    title: "Publier mon profil",
    description: "Stats, roles joues, refs coach et VOD.",
    href: "/create-profile",
    badge: "",
  },
  {
    title: "Organiser un scrim",
    description: "Scrims publics avec calendrier intégré.",
    href: "/scrims",
    badge: "",
  },
]

const spotlightTips = [
  "Publie tes stats OP.GG a jour avec roles secondaires.",
  "Ajoute une video highlight courte avec comms claires.",
  "Indique objectifs ligue, langues et disponibilites.",
]

const featuredPlayers = [
  {
    pseudo: "NoxianEdge",
    role: "Top",
    rank: "Grandmaster 580 LP",
    style: "Weakside anchor",
    looking: "ERL mixte",
  },
  {
    pseudo: "BlueTempo",
    role: "Jungle",
    rank: "Master 350 LP",
    style: "Tempo / invade early",
    looking: "LFL Div2",
  },
  {
    pseudo: "Lumen",
    role: "Mid",
    rank: "Challenger 720 LP",
    style: "Control mage shotcaller",
    looking: "ERL academie",
  },
]

const trendingTeams = [
  {
    name: "Hextech Horizon",
    tier: "ERL",
    needs: ["Jungle", "Support"],
    tags: ["Scrim 5x semaine", "Coach LEC exp"],
  },
  {
    name: "Blue Rift Academy",
    tier: "LFL Div2",
    needs: ["ADC"],
    tags: ["Programme physique", "Analyste data"],
  },
  {
    name: "Project Nexus",
    tier: "Mixte Master+",
    needs: ["Top", "Mid"],
    tags: ["Tryouts ouverts", "Bootcamp Berlin"],
  },
]

const roles = ["Top", "Jungle", "Mid", "ADC", "Support", "Staff"]
const ranks = ["Diamant", "Master", "Grandmaster", "Challenger"]

function HeroSearch() {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/30 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-200/80">
            League of Legends Talent Network
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white">
            Le LinkedIn des joueurs et staffs LoL ambitieux
          </h1>
          <p className="text-base text-slate-200">
            Centralise profils, equipes et tryouts. Trouve ta prochaine line-up ou recrute le joueur parfait
            avec stats live et disponibilites partagees.
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Matchs et tryouts programmes</p>
          <p className="text-3xl font-semibold text-white">32</p>
          <p className="text-xs text-slate-500">Dont 8 ouverts communautaires</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-inner shadow-blue-500/10 md:flex-row md:items-center md:gap-6">
        <InputGroup className="flex-1 flex-row gap-3 rounded-xl border border-white/5 bg-transparent p-3">
          <Input
            placeholder="Pseudo, equipe ou mot cle..."
            className="flex-1 border-none bg-transparent text-base text-white placeholder:text-slate-500"
          />
    </InputGroup> 
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <select className="min-w-[160px] rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none">
            <option value="">Role</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select className="min-w-[160px] rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none">
            <option value="">Elo</option>
            {ranks.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>
        <Button className="w-full md:w-auto">Lancer la recherche</Button>
      </div>
      <p className="mt-3 text-xs text-slate-400">
      </p>
    </section>
  )
}

function QuickActions() {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {quickActions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="group min-h-[190px] rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-950 to-slate-900/70 p-7 transition hover:-translate-y-1 hover:border-blue-400/60 hover:bg-slate-900/90"
        >
          <div className="flex items-center justify-between">
            {action.badge && (
              <span className="text-xs font-medium uppercase tracking-wider text-blue-300/80">
                {action.badge}
              </span>
            )}
            <span className="text-slate-500 transition group-hover:text-blue-200">
              →
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-white">{action.title}</h3>
          <p className="mt-2 text-base text-slate-300">{action.description}</p>
        </Link>
      ))}
    </section>
  )
}

function CommunitySpotlight() {
  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 via-slate-900 to-slate-950 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-violet-200/80">Talents</p>
          <h2 className="text-2xl font-semibold text-white">Profils mis en avant</h2>
        </div>
        <Button variant="outline" className="border-white/20 bg-white/5 text-white">
          Voir le flux
        </Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {featuredPlayers.map((player) => (
          <div key={player.pseudo} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">{player.role}</p>
                <h3 className="text-xl font-semibold text-white">{player.pseudo}</h3>
              </div>
              <span className="text-xs rounded-full border border-white/20 px-3 py-1 text-slate-200">
                {player.rank}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{player.style}</p>
            <p className="mt-1 text-xs text-slate-500">Recherche : {player.looking}</p>
            <Button variant="ghost" className="mt-4 text-blue-300 hover:bg-white/5">
              Voir le profil
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}

function Checklist() {
  return (
    <section
      id="checklist"
      className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/10 via-emerald-200/5 to-transparent p-6 text-emerald-100"
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
            Checklist
          </p>
          <h3 className="text-2xl font-semibold">Profil pret pour tryout</h3>
        </div>
        <ul className="space-y-3">
          {spotlightTips.map((tip) => (
            <li key={tip} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <span className="mt-1 text-base text-emerald-300">✔</span>
              <p className="text-sm text-white/90">{tip}</p>
            </li>
          ))}
        </ul>
        <Button variant="secondary" className="self-start bg-white/10 text-white">
          Exporter en PDF
        </Button>
    </div>
    </section>
  )
}

function SidePanel() {
  return (
    <aside className="sticky top-6 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl shadow-blue-500/10 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-blue-200/70">Briefing</p>
        <h2 className="text-3xl font-semibold">Matchmaking</h2>
        <p className="text-sm text-slate-300">12 nouvelles equipes compatibles</p>
      </div>
      <div className="space-y-3">
        {[
          { label: "Demandes recues", value: 4, tone: "text-green-300" },
          { label: "Invitations scrim", value: 2, tone: "text-blue-200" },
          { label: "Scrims planifies", value: 1, tone: "text-amber-200" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm"
          >
            <span>{item.label}</span>
            <span className={item.tone}>{item.value}</span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-100">
          Besoin d'une review VOD ? Coachs LFL dispo sous 24h.
        </p>
        <Button className="mt-3 w-full bg-blue-500 hover:bg-blue-400">Préparer un scrim</Button>
      </div>
    </aside>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-300/80">Dashboard</p>
            <h1 className="text-2xl font-semibold">FA_helper</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/create-profile">
              <Button className="bg-blue-500 text-white hover:bg-blue-400">Nouveau profil</Button>
            </Link>
          </div>
        </header>

        <div className="space-y-8">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

