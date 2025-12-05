"use client"

import Link from "next/link"

import React, { useEffect, useState } from 'react'
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
    tags: ["Scrims ouverts", "Bootcamp Berlin"],
  },
]

const roles = ["Top", "Jungle", "Mid", "ADC", "Support", "Staff"]
const ranks = ["Diamant", "Master", "Grandmaster", "Challenger"]

function HeroSearch() {
  return (
    <section className="border border-gray-700 bg-gray-900 p-6 mb-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking text-red-400">
            League of Legends Talent Network
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Le LinkedIn des joueurs et staffs LoL ambitieux
          </h1>
          <p className="text-gray-300">
            Centralise profils, équipes et scrims. Trouve ta prochaine line-up ou recrute le joueur parfait
            avec stats live et disponibilités partagées.
          </p>
        </div>
        <div className="p-4 border border-gray-700 bg-gray-800">
          <p className="text-sm text-gray-300">Matchs et scrims programmés</p>
          <p className="text-2xl font-semibold text-red-500">12</p>
        </div>
      </div>
    </section>
  )
}

function QuickActions() {
  return (
    <section className="grid gap-4 md:grid-cols-3 mb-8">
      {quickActions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="p-5 border border-gray-700 bg-gray-800 text-white hover:border-red-500"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold">
              {action.title}
            </h3>
            <span className="text-red-500">→</span>
          </div>
          <p className="mt-2 text-gray-300">{action.description}</p>
        </Link>
      ))}
    </section>
  )
}

function CommunitySpotlight() {
  const [profiles, setProfiles] = useState<any[]>([])

  useEffect(() => {
    try {
      const list = localStorage.getItem('playerProfiles')
      if (list) {
        const parsed = JSON.parse(list)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProfiles(parsed)
          return
        }
      }

      // fallback to single playerProfile
      const single = localStorage.getItem('playerProfile')
      if (single) {
        const p = JSON.parse(single)
        setProfiles([p])
        return
      }

      // no real profiles found: keep profiles empty (don't show fictional examples)
      setProfiles([])
    } catch (e) {
      console.error('Erreur loading profiles for spotlight', e)
      setProfiles([])
    }
  }, [])

  return (
    <section className="border border-gray-700 bg-gray-900 p-6 mb-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking text-red-400-sm font-medium text-red-500 mb-1">TALENTS</p>
          <h2 className="text-2xl font-semibold text-white">Profils mis en avant</h2>
        </div>
        <Link href="/profiles/">
        <Button className="bg-red-600 text-white hover:bg-red-700 px-4">Voir les profils →</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(() => {
          // Build display list: first real profiles, then fill with examples (marked)
          const display: any[] = []
          display.push(...profiles.slice(0, 3))
          let idx = 0
          while (display.length < 3 && idx < featuredPlayers.length) {
            display.push({ ...featuredPlayers[idx], __example: true })
            idx++
          }

          if (display.length === 0) {
            return (
              <div className="p-6 border border-gray-700 bg-gray-800 col-span-3">
                <p className="text-gray-300 mb-2">Aucun profil publié pour le moment.</p>
                <Link href="/create-profile">
                  <Button className="bg-red-600 text-white hover:bg-red-700">Publier mon profil</Button>
                </Link>
              </div>
            )
          }

          const slugify = (s: string) =>
            s
              .toString()
              .normalize('NFKD')
              .replace(/\p{Diacritic}/gu, '')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')

          return display.map((player: any, i: number) => {
            const name = player.pseudo || player.name || `Player ${i + 1}`
            const role = player.role || (Array.isArray(player.roles) && player.roles[0]) || '---'
            const rank = player.rank || player.tier || ''
            const style = player.style || player.description || ''
            const isExample = Boolean(player.__example)

            return (
              <div key={`${name}-${i}`} className="p-4 border border-gray-700 bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-red-500">{role}</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{name}</h3>
                      {isExample && (
                        <span className="text-xs rounded-full border border-gray-600 bg-gray-700 px-2 py-0.5 text-gray-200">
                          Exemple
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs bg-gray-700 px-2 py-1">{rank}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{style}</p>
                <Link href={`/profiles/${slugify(name)}`} className="w-full">
                  <Button className="w-full bg-gray-700 hover:bg-gray-600">Voir le profil</Button>
                </Link>
              </div>
            )
          })
        })()}
      </div>
    </section>
  )
}


function SidePanel() {
  return (
    <aside className="sticky top-6 space-y-6 rounded-3xl border border-red-900/30 bg-gray-900 p-6 text-white shadow-[0_35px_80px_rgba(255,0,0,0.1)]">
      <div>
        <p className="text-xs uppercase tracking text-red-400">Statistiques</p>
        <h2 className="text-3xl font-semibold">Matchmaking</h2>
        <p className="text-sm text-gray-400">12 nouvelles équipes adaptées</  p>
      </div>
      <div className="space-y-3">
        {[
          { label: "Demandes reçues", value: 4, tone: "text-emerald-300" },
          { label: "Invitations scrim", value: 2, tone: "text-rose-200" },
          { label: "Scrims planifiés", value: 1, tone: "text-amber-200" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-red-900/30 bg-gray-800/80 px-4 py-3 text-sm hover:border-red-900/50 transition-colors"
          >
            <span>{item.label}</span>
            <span className={item.tone}>{item.value}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking text-red-400">Bienvenue sur</p>
          <h1 className="text-3xl font-bold text-white md:text-4xl">FA Helper</h1>
          <p className="mt-2 text-gray-300">
            La plateforme pour les joueurs et équipes compétitives de League of Legends
          </p>
        </div>
      </div>

        <div className="space-y-8">
          <HeroSearch />
          <QuickActions />
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <CommunitySpotlight />
            <SidePanel />
          </div>
        </div>
    </div>
  )
}

