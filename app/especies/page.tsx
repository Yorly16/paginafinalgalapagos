"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, MapPin, Search, Filter } from "lucide-react"
import Link from "next/link"

interface Species {
  id: string
  commonName: string
  scientificName: string
  category: string
  status: string
  location: string
  description: string
  habitat: string
  diet: string
  threats: string
  image?: string
  tags: string[]
}

export default function EspeciesPage() {
  const [allSpecies, setAllSpecies] = useState<Species[]>([])
  const [filteredSpecies, setFilteredSpecies] = useState<Species[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Cargar especies del localStorage
  useEffect(() => {
    const loadSpecies = () => {
      try {
        const savedSpecies = localStorage.getItem('galapagos-species')
        if (savedSpecies) {
          const species = JSON.parse(savedSpecies)
          setAllSpecies(species)
          setFilteredSpecies(species)
        }
      } catch (error) {
        console.error('Error loading species:', error)
      }
    }
    
    loadSpecies()
  }, [])

  // Filtrar especies
  useEffect(() => {
    let results = [...allSpecies]

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      results = results.filter(species => 
        species.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        species.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        species.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por categoría
    if (selectedCategory && selectedCategory !== "all") {
      results = results.filter(species => 
        species.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filtrar por estado de conservación
    if (selectedStatus && selectedStatus !== "all") {
      results = results.filter(species => 
        species.status.toLowerCase() === selectedStatus.toLowerCase()
      )
    }

    setFilteredSpecies(results)
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedStatus, allSpecies])

  // Paginación
  const totalPages = Math.ceil(filteredSpecies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSpecies = filteredSpecies.slice(startIndex, endIndex)

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'estable':
        return 'default'
      case 'vulnerable':
        return 'secondary'
      case 'en-peligro':
      case 'en peligro':
        return 'destructive'
      case 'critico':
      case 'crítico':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Catálogo de Especies
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explora todas las especies registradas en nuestro catálogo local de las Islas Galápagos
          </p>
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
                    placeholder="Nombre común, científico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por categoría */}
              <div>
                <label className="text-sm font-medium mb-2 block">Categoría</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="mamifero">Mamífero</SelectItem>
                    <SelectItem value="ave">Ave</SelectItem>
                    <SelectItem value="reptil">Reptil</SelectItem>
                    <SelectItem value="pez">Pez</SelectItem>
                    <SelectItem value="invertebrado">Invertebrado</SelectItem>
                    <SelectItem value="planta">Planta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por estado */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estado de Conservación</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="estable">Estable</SelectItem>
                    <SelectItem value="vulnerable">Vulnerable</SelectItem>
                    <SelectItem value="en-peligro">En Peligro</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                    <SelectItem value="extinto">Extinto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Mostrando {currentSpecies.length} de {filteredSpecies.length} especies
            {filteredSpecies.length !== allSpecies.length && ` (${allSpecies.length} total)`}
          </p>
        </div>

        {/* Grid de especies */}
        {currentSpecies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentSpecies.map((species) => (
              <Card key={species.id} className="group hover:shadow-lg transition-all duration-300 border-border">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={species.image || "/placeholder.jpg"}
                    alt={species.commonName}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-background/90 text-foreground" variant="secondary">
                    {species.category}
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground">{species.commonName}</CardTitle>
                  <p className="text-sm italic text-muted-foreground">{species.scientificName}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {species.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {species.location}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={getStatusVariant(species.status)} className="text-xs">
                      {species.status}
                    </Badge>

                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/especies/${species.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver más
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-lg text-muted-foreground mb-4">
                {allSpecies.length === 0 
                  ? "No hay especies registradas aún" 
                  : "No se encontraron especies con los filtros aplicados"
                }
              </p>
              {allSpecies.length === 0 && (
                <Button asChild>
                  <Link href="/admin">
                    Ir al Panel de Administración
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}