"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import teamsData from "@/data/teams.json"

type Team = (typeof teamsData)[number]

const desiredRoleOrder = ["Top", "Jungle", "Mid", "ADC", "Support"]
const rawRoleOptions = Array.from(new Set(teamsData.flatMap((team) => team.needs)))

const sortedCoreRoles = desiredRoleOrder.filter((role) => rawRoleOptions.includes(role))
const remainingRoles = rawRoleOptions.filter(
  (role) => role !== "Analyste" && !desiredRoleOrder.includes(role)
)

const roleOptions = [
  ...sortedCoreRoles,
  ...remainingRoles.sort((a, b) => a.localeCompare(b)),
  ...(rawRoleOptions.includes("Analyste") ? ["Analyste"] : []),
]
const tierOptions = Array.from(new Set(teamsData.map((team) => team.tier)))

export default function TeamsPage() {
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const filteredTeams = useMemo(() => {
    return teamsData.filter((team) => {
      const matchRole = roleFilter === "all" || team.needs.includes(roleFilter)
      const matchTier = tierFilter === "all" || team.tier === tierFilter
      const normalizedSearch = search.trim().toLowerCase()
      const matchSearch =
        normalizedSearch.length === 0 ||
        [
          team.name,
          team.league,
          team.projectFocus.join(" "),
          team.region,
          team.needs.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)

      return matchRole && matchTier && matchSearch
    })
  }, [roleFilter, tierFilter, search])

  const summary = useMemo(() => {
    const totalSpots = teamsData.reduce((acc, team) => acc + team.needs.length, 0)
    const urgentTeams = teamsData.filter((team) => team.urgency.toLowerCase().includes("immédiate")).length
    const trialWindows = teamsData.filter((team) => team.trialWindow.toLowerCase().includes("déc")).length

    return { totalSpots, urgentTeams, trialWindows }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold text-blue-300/80">Trouver une équipe</p>
          <h1 className="text-3xl font-semibold">Trouver une équipe</h1>
          <p className="text-sm text-slate-300">
            Filtre les équipes par rôle, élo et disponibilités. Cette page servira à explorer les
            rosters ouverts et à postuler directement.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs font-semibold text-slate-400">Role cible</label>
              <select
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">Tous les roles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs font-semibold text-slate-400">Tier</label>
              <select
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                value={tierFilter}
                onChange={(event) => setTierFilter(event.target.value)}
              >
                <option value="all">Tous les niveaux</option>
                {tierOptions.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs font-semibold text-slate-400">Rechercher</label>
              <Input
                className="mt-2 rounded-2xl border border-white/10 bg-slate-950/70 text-sm text-white placeholder:text-slate-500"
                placeholder="Nom, ligue, focus..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <div className="mt-6 grid gap-4 text-sm text-slate-300 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs font-semibold text-blue-200/80">Spots ouverts</p>
              <p className="mt-2 text-2xl font-semibold text-white">{summary.totalSpots}</p>
              <p className="text-xs text-slate-400">Postes à pourvoir immédiats</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs font-semibold text-amber-200/80">Urgence</p>
              <p className="mt-2 text-2xl font-semibold text-white">{summary.urgentTeams}</p>
              <p className="text-xs text-slate-400">Equipes à staffed ASAP</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs font-semibold text-emerald-200/80">Tryouts en cours</p>
              <p className="mt-2 text-2xl font-semibold text-white">{summary.trialWindows}</p>
              <p className="text-xs text-slate-400">Sessions actives ce mois</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Rosters ouverts</p>
              <h2 className="text-2xl font-semibold">Equipes disponibles</h2>
            </div>
            <p className="text-sm text-slate-400 hidden md:block">
              Les données sont fictives pour l'instant.
            </p>
          </div>

          <div className="grid gap-5">
            {filteredTeams.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-10 text-center text-slate-400">
                Aucune équipe ne match tes filtres. Tente un autre rôle ou élargis la recherche.
              </div>
            ) : (
              filteredTeams.map((team) => <TeamCard key={team.id} team={team} />)
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function TeamCard({ team }: { team: Team }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-inner shadow-blue-500/5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-200/80">{team.league}</p>
          <h3 className="text-2xl font-semibold text-white">{team.name}</h3>
          <p className="text-sm text-slate-300">{team.projectFocus.join(" • ")}</p>
        </div>
        <div className="text-right text-sm text-slate-400">
          <p className="font-semibold text-white">{team.tier}</p>
          <p>{team.level}</p>
          <p className="text-xs text-slate-500">Maj {team.lastUpdated}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoBlock label="Besoin immédiat">
          <div className="flex flex-wrap gap-2">
            {team.needs.map((role) => (
              <span key={role} className="rounded-full border border-blue-400/40 px-3 py-1 text-xs text-blue-100">
                {role}
              </span>
            ))}
          </div>
        </InfoBlock>
        <InfoBlock label="Cadence & dispo">
          <p className="text-sm text-slate-200">{team.availability}</p>
          <p className="text-xs text-slate-500">{team.practiceSchedule.join(" • ")}</p>
        </InfoBlock>
        <InfoBlock label="Staff & format">
          <p className="text-sm text-slate-200">{team.staffNotes}</p>
          <p className="text-xs text-slate-500">{team.format}</p>
        </InfoBlock>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full border border-amber-300/40 px-3 py-1 text-amber-200">
          Scrims {team.trialWindow}
        </span>
        <span className="rounded-full border border-emerald-300/40 px-3 py-1 text-emerald-200">
          {team.urgency}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-slate-200">
          Langues : {team.languages.join(" / ")}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-slate-200">
          Région : {team.region}
        </span>
      </div>

      <p className="mt-6 text-sm text-slate-400">Contact: {team.contact.email}</p>
    </article>
  )
}

function InfoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  )
}


