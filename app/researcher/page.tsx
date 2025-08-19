"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PermissionRequestModal } from "@/components/researcher/permission-request-modal"
import { AddSpeciesForm } from "@/components/admin/add-species-form"
import { LocalSpeciesManager } from "@/components/admin/local-species-manager"
import { SpeciesSearch } from "@/components/admin/species-search"
import { usePermissions, AVAILABLE_PERMISSIONS, getPermissionById } from "@/lib/permissions"
import { Search, Lock, Plus, Database, FileDown, Edit, Trash2, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { RouteGuard } from "@/components/auth/route-guard"

function ResearcherPageContent() {
  const { currentUser, hasPermission } = usePermissions()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null)
  const [activeFunction, setActiveFunction] = useState<string | null>(null)
  const [functionDialogOpen, setFunctionDialogOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('current-user')
    router.push('/login')
  }

  const handleRequestPermission = (permissionId: string) => {
    setSelectedPermission(permissionId)
    setModalOpen(true)
  }

  const handleAccessFunction = (permissionId: string) => {
    setActiveFunction(permissionId)
    setFunctionDialogOpen(true)
  }

  // Agregar estado para resultados de búsqueda
  const [searchResults, setSearchResults] = useState<any[]>([])
  
  // Función para manejar resultados de búsqueda
  const handleSearchResults = (results: any[]) => {
    setSearchResults(results)
  }

  const renderFunctionContent = () => {
    switch (activeFunction) {
      case 'add-species':
        return (
          <div className="h-full overflow-y-auto">
            <AddSpeciesForm />
          </div>
        )
      case 'local-search':
        return (
          <div className="h-full overflow-y-auto">
            <SpeciesSearch onSearchResults={handleSearchResults} />
          </div>
        )
      case 'edit-species':
      case 'delete-species':
        return (
          <div className="h-full overflow-y-auto">
            <LocalSpeciesManager />
          </div>
        )
      case 'export-data':
        return (
          <div className="h-full flex flex-col justify-center items-center text-center">
            <p className="mb-6 text-xl">Funcionalidad de exportación de datos</p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => {
                try {
                  const data = localStorage.getItem('galapagos-species') || '[]'
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'especies-data.json'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                } catch (error) {
                  console.error('Error al exportar datos:', error)
                }
              }}
            >
              <FileDown className="h-6 w-6 mr-3" />
              Descargar Datos
            </Button>
          </div>
        )
      default:
        return <div className="h-full flex items-center justify-center text-lg">Funcionalidad no disponible</div>
    }
  }

  const getFunctionTitle = () => {
    switch (activeFunction) {
      case 'add-species': return 'Añadir Especies'
      case 'local-search': return 'Búsqueda Local'
      case 'edit-species': return 'Editar Especies'
      case 'delete-species': return 'Eliminar Especies'
      case 'export-data': return 'Exportar Datos'
      default: return 'Función'
    }
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Encabezado personalizado para investigador */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg text-foreground">Galápagos DataLens - Investigador</span>
            </Link>

            {/* Navegación de investigador */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/especies" className="text-muted-foreground hover:text-foreground transition-colors">
                Especies
              </Link>
            </nav>

            {/* Acciones de investigador */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground hidden sm:block">
                Investigador: {currentUser.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Panel de Investigación</h1>
          <p className="text-muted-foreground">
            Accede a las herramientas de investigación y gestión de especies.
          </p>
        </div>

        {/* Información del Usuario */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Panel del Investigador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Nombre:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Permisos activos:</strong> {currentUser.permissions?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Buscador de Especies Darwin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda de Especies Darwin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Acceso completo al buscador de especies de Darwin. Esta funcionalidad está siempre disponible.
            </p>
            <iframe
              src="https://finaldataa.onrender.com/species_search.html"
              className="w-full h-[600px] border rounded-lg"
              title="Buscador de Especies Darwin"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </CardContent>
        </Card>

        {/* Funciones Adicionales */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Funciones Adicionales</h2>
          <p className="text-muted-foreground mb-6">
            Las siguientes funciones requieren permisos especiales. Puedes solicitar acceso haciendo clic en "Solicitar Acceso".
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PermissionCard
              title="Añadir Especies"
              description="Agregar nuevas especies al sistema local"
              icon={Plus}
              permissionId="add-species"
              hasPermission={hasPermission('add-species')}
              onRequestPermission={handleRequestPermission}
              onAccessFunction={handleAccessFunction}
            />
            
            <PermissionCard
              title="Editar Especies"
              description="Modificar especies existentes"
              icon={Edit}
              permissionId="edit-species"
              hasPermission={hasPermission('edit-species')}
              onRequestPermission={handleRequestPermission}
              onAccessFunction={handleAccessFunction}
            />
            
            <PermissionCard
              title="Búsqueda Local"
              description="Buscar en base de datos local"
              icon={Database}
              permissionId="local-search"
              hasPermission={hasPermission('local-search')}
              onRequestPermission={handleRequestPermission}
              onAccessFunction={handleAccessFunction}
            />
            
            <PermissionCard
              title="Exportar Datos"
              description="Exportar datos del sistema"
              icon={FileDown}
              permissionId="export-data"
              hasPermission={hasPermission('export-data')}
              onRequestPermission={handleRequestPermission}
              onAccessFunction={handleAccessFunction}
            />
            
            <PermissionCard
              title="Eliminar Especies"
              description="Eliminar especies del sistema"
              icon={Trash2}
              permissionId="delete-species"
              hasPermission={hasPermission('delete-species')}
              onRequestPermission={handleRequestPermission}
              onAccessFunction={handleAccessFunction}
            />
          </div>
        </div>
      </div>

      <PermissionRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        permissionId={selectedPermission}
      />

      {/* Dialog para funciones */}
      <Dialog open={functionDialogOpen} onOpenChange={setFunctionDialogOpen}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-[100vw] h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">{getFunctionTitle()}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-[calc(100%-4rem)] overflow-y-auto">
            {renderFunctionContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface PermissionCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  permissionId: string
  hasPermission: boolean
  onRequestPermission: (permissionId: string) => void
  onAccessFunction: (permissionId: string) => void
}

function PermissionCard({ 
  title, 
  description, 
  icon: Icon, 
  permissionId, 
  hasPermission, 
  onRequestPermission,
  onAccessFunction
}: PermissionCardProps) {
  return (
    <Card className={hasPermission ? 'border-green-500' : 'border-muted'}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {hasPermission ? (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => onAccessFunction(permissionId)}
            className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            Acceder
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onRequestPermission(permissionId)}
            className="flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Solicitar Acceso
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function ResearcherPage() {
  return (
    <RouteGuard requiredRole="researcher">
      <ResearcherPageContent />
    </RouteGuard>
  )
}