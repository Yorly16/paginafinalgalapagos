"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, MapPin, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

interface Species {
  id: string
  commonName: string
  scientificName: string
  category: string
  status: string
  location: string
  description: string
  imageUrl?: string
  isEndemic?: boolean
}

export function AdminStats() {
  const [stats, setStats] = useState({
    totalSpecies: 0,
    endemicSpecies: 0,
    endangeredSpecies: 0,
    researchers: 0
  })

  useEffect(() => {
    const loadStats = () => {
      try {
        // Cargar especies
        const storedSpecies = localStorage.getItem('galapagos-species')
        const species: Species[] = storedSpecies ? JSON.parse(storedSpecies) : []
        
        const totalSpecies = species.length
        const endemicSpecies = species.filter(s => s.isEndemic || s.category === 'Endémica').length
        
        const endangeredSpecies = species.filter(s => 
          s.status === 'critico' || 
          s.status === 'en-peligro' ||
          s.status === 'vulnerable'
        ).length
        
        // Cargar investigadores reales desde localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const researchers = users.filter((user: any) => user.role === 'researcher').length
        
        setStats({
          totalSpecies,
          endemicSpecies,
          endangeredSpecies,
          researchers
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    loadStats()
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadStats()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Escuchar eventos personalizados para cambios locales
    window.addEventListener('speciesUpdated', handleStorageChange)
    window.addEventListener('usersUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('speciesUpdated', handleStorageChange)
      window.removeEventListener('usersUpdated', handleStorageChange)
    }
  }, [])

  const statsData = [
    {
      title: "Total de Especies",
      value: stats.totalSpecies.toString(),
      change: stats.totalSpecies > 0 ? "Especies registradas" : "Sin especies aún",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Especies Endémicas",
      value: stats.endemicSpecies.toString(),
      change: stats.totalSpecies > 0 ? `${Math.round((stats.endemicSpecies / stats.totalSpecies) * 100)}% del total` : "0% del total",
      icon: MapPin,
      color: "text-blue-600"
    },
    {
      title: "En Peligro",
      value: stats.endangeredSpecies.toString(),
      change: stats.endangeredSpecies > 0 ? "Requieren atención" : "Ninguna en peligro",
      icon: AlertTriangle,
      color: stats.endangeredSpecies > 0 ? "text-red-600" : "text-green-600"
    },
    {
      title: "Investigadores",
      value: stats.researchers.toString(),
      change: "Activos",
      icon: Users,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}