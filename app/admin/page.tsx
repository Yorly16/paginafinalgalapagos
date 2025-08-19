"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminStats } from "@/components/admin/admin-stats"
import { AddSpeciesForm } from "@/components/admin/add-species-form"
import { SpeciesTable } from "@/components/admin/species-table"
import { LocalSpeciesManager } from "@/components/admin/local-species-manager"
import { PermissionManager } from "@/components/admin/permission-manager"
import { UserManager } from "@/components/admin/user-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Plus, Database, Settings, Search, LogOut, Users } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { RouteGuard } from "@/components/auth/route-guard"

function AdminPageContent() {
  const handleLogout = () => {
    // Limpiar localStorage y redirigir al login
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const handleNavigateToResearcher = () => {
    // Cerrar sesión actual y redirigir al login con mensaje
    localStorage.removeItem('user')
    localStorage.setItem('login-message', 'Para acceder al Panel de Investigador, inicia sesión como investigador')
    window.location.href = '/login'
  }

  return (
    <>
      {/* Encabezado personalizado para administrador */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg text-foreground">Galápagos DataLens - Admin</span>
            </Link>

            {/* Navegación de administrador */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/especies" className="text-muted-foreground hover:text-foreground transition-colors">
                Especies
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleNavigateToResearcher}
                className="text-muted-foreground hover:text-foreground transition-colors p-0 h-auto font-normal"
              >
                Panel Investigador
              </Button>
            </nav>

            {/* Acciones de administrador */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground hidden sm:block">
                Administrador
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
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona especies, usuarios y permisos del sistema.
          </p>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Añadir Especie
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Especie
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Base Local
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Permisos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="add">
            <AddSpeciesForm />
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Buscador de Especies Darwin</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  src="https://finaldataa.onrender.com/species_search.html"
                  className="w-full h-[600px] border rounded-lg"
                  title="Buscador de Especies Darwin"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="local">
            <LocalSpeciesManager />
          </TabsContent>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionManager />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default function AdminPage() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminPageContent />
    </RouteGuard>
  )
}