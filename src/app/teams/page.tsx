"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import Link from "next/link"

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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 pb-4 border-b border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-red-400">Trouver une équipe</p>
              <h1 className="text-3xl font-bold text-white">Trouver une équipe</h1>
              <p className="text-gray-400">
                Filtre les équipes par rôle, élo et disponibilités...
              </p>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-sm hover:bg-yellow-900/30">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </header>

        <section className="border border-gray-700 bg-gray-800 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-slate-400">Rôle cible</label>
              <select
                className="w-full border border-gray-700 bg-gray-700 p-2 text-white outline-none"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">Tous les rôles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Tier</label>
              <select
                className="w-full border border-gray-700 bg-gray-700 p-2 text-white outline-none"
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
            <div>
              <label className="text-sm font-medium text-slate-400">Rechercher</label>
              <Input
                className="w-full border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-400"
                placeholder="Nom, ligue, focus..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-700 bg-gray-800 p-4">
              <p className="text-sm font-medium text-yellow-400">Spots ouverts</p>
              <p className="text-2xl font-semibold text-yellow-400">{summary.totalSpots}</p>
              <p className="text-xs text-gray-400">Postes à pourvoir</p>
            </div>
            <div className="border border-gray-700 bg-gray-800 p-4">
              <p className="text-sm font-medium text-yellow-400">Urgence</p>
              <p className="text-2xl font-semibold">{summary.urgentTeams}</p>
              <p className="text-xs text-gray-400">Équipes à staffer</p>
            </div>
            <div className="border border-gray-700 bg-gray-800 p-4">
              <p className="text-sm font-medium text-green-400">Scrims en cours</p>
              <p className="text-2xl font-semibold">{summary.trialWindows}</p>
              <p className="text-xs text-gray-400">Sessions actives</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-yellow-400">ROSTERS OUVERTS</p>
              <h2 className="text-xl font-semibold">Équipes disponibles</h2>
            </div>
            <p className="text-sm text-gray-400">
              Les données sont fictives pour l'instant.
            </p>
          </div>

          <div className="space-y-4">
            {filteredTeams.length === 0 ? (
              <div className="border border-gray-700 bg-gray-800 p-8 text-center text-gray-300">
                Aucune équipe ne correspond à tes filtres. Essaie un autre rôle ou élargis ta recherche.
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
    <article className="border border-gray-700 bg-gray-800 p-5 hover:border-yellow-500">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-yellow-500">{team.league}</p>
          <h3 className="text-xl font-semibold text-white">{team.name}</h3>
          <p className="text-gray-300">{team.projectFocus.join(" • ")}</p>
        </div>
        <div className="md:text-right">
          <div className="inline-block border border-yellow-500/50 bg-yellow-900/20 p-2 text-center">
            <p className="font-semibold text-white">{team.tier}</p>
            <p className="text-sm">{team.level}</p>
            <p className="text-xs text-gray-500">Maj {team.lastUpdated}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <InfoBlock label="BESOIN IMMÉDIAT">
          <div className="flex flex-wrap gap-2">
            {team.needs.map((role) => (
              <span key={role} className="border border-yellow-500/40 bg-yellow-900/20 px-3 py-1 text-xs">
                {role}
              </span>
            ))}
          </div>
        </InfoBlock>
        <InfoBlock label="Cadence & dispo">
          <p className="text-sm text-gray-200">{team.availability}</p>
          <p className="text-xs text-gray-500">{team.practiceSchedule.join(" • ")}</p>
        </InfoBlock>
        <InfoBlock label="Staff & format">
          <p className="text-sm text-gray-200">{team.staffNotes}</p>
          <p className="text-xs text-gray-500">{team.format}</p>
        </InfoBlock>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-300">
        <span className="rounded-full border border-yellow-400/40 bg-yellow-900/20 px-3 py-1 text-yellow-200">
          Scrims {team.trialWindow}
        </span>
        <span className="rounded-full border border-emerald-300/40 px-3 py-1 text-emerald-200">
          {team.urgency}
        </span>
        <span className="rounded-full border border-red-900/40 bg-gray-700/50 px-3 py-1 text-gray-200">
          Langues : {team.languages.join(" / ")}
        </span>
        <span className="rounded-full border border-red-900/40 bg-gray-700/50 px-3 py-1 text-gray-200">
          Région : {team.region}
        </span>
      </div>

      <p className="mt-6 text-sm text-slate-400">Contact: {team.contact.email}</p>
    </article>
  )
}

function InfoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-400">{label}</p>
      <div className="text-sm">
        {children}
      </div>
    </div>
  )
}
