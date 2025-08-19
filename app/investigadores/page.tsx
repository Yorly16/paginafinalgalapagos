"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, Users, MapPin, Mail, ExternalLink } from "lucide-react"
import { InvestigatorCard } from "@/components/investigator-card"

interface Investigator {
  id: string
  name: string
  email: string
  institution: string
  specialization: string
  biography?: string  // Cambiar 'bio' por 'biography' y hacerlo opcional
  orcid?: string      // Hacerlo opcional
  documentType: string
  documentNumber: string
  role: string
  status: string
  registrationDate: string  // Cambiar 'createdAt' por 'registrationDate'
}

export default function InvestigatorsPage() {
  const [investigators, setInvestigators] = useState<Investigator[]>([])
  const [filteredInvestigators, setFilteredInvestigators] = useState<Investigator[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [specializationFilter, setSpecializationFilter] = useState("all")
  const [institutionFilter, setInstitutionFilter] = useState("all")

  // Cargar investigadores desde localStorage
  useEffect(() => {
    const loadInvestigators = () => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const researchers = users.filter((user: any) => user.role === 'researcher' && user.status === 'active')
        setInvestigators(researchers)
        setFilteredInvestigators(researchers)
      } catch (error) {
        console.error('Error loading investigators:', error)
      }
    }

    loadInvestigators()
  }, [])

  // Filtrar investigadores
  useEffect(() => {
    let filtered = investigators

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(inv => 
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por especialización
    if (specializationFilter !== "all") {
      filtered = filtered.filter(inv => 
        inv.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
      )
    }

    // Filtro por institución
    if (institutionFilter !== "all") {
      filtered = filtered.filter(inv => 
        inv.institution.toLowerCase().includes(institutionFilter.toLowerCase())
      )
    }

    setFilteredInvestigators(filtered)
  }, [investigators, searchTerm, specializationFilter, institutionFilter])

  // Obtener especializations únicas
  const uniqueSpecializations = Array.from(new Set(investigators.map(inv => inv.specialization)))
  const uniqueInstitutions = Array.from(new Set(investigators.map(inv => inv.institution)))

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Investigadores
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Conoce a los investigadores que forman parte de nuestra comunidad científica dedicada al estudio de las Islas Galápagos
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investigadores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investigators.length}</div>
              <p className="text-xs text-muted-foreground">Activos en la plataforma</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueSpecializations.length}</div>
              <p className="text-xs text-muted-foreground">Áreas de investigación</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instituciones</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueInstitutions.length}</div>
              <p className="text-xs text-muted-foreground">Organizaciones representadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda por texto */}
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nombre, institución, especialidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por especialización */}
              <div>
                <label className="text-sm font-medium mb-2 block">Especialización</label>
                <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las especialidades</SelectItem>
                    {uniqueSpecializations.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por institución */}
              <div>
                <label className="text-sm font-medium mb-2 block">Institución</label>
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las instituciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las instituciones</SelectItem>
                    {uniqueInstitutions.map(inst => (
                      <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botón para limpiar filtros */}
            {(searchTerm || specializationFilter !== "all" || institutionFilter !== "all") && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setSpecializationFilter("all")
                    setInstitutionFilter("all")
                  }}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Mostrando {filteredInvestigators.length} de {investigators.length} investigadores
          </p>
        </div>

        {/* Grid de Investigadores */}
        {filteredInvestigators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestigators.map(investigator => (
              <InvestigatorCard key={investigator.id} investigator={investigator} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron investigadores</h3>
              <p className="text-muted-foreground">
                {investigators.length === 0 
                  ? "Aún no hay investigadores registrados en la plataforma."
                  : "Intenta ajustar los filtros de búsqueda."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}