"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Eye, EyeOff, User, Shield, AlertCircle, Info } from "lucide-react"
import { User as UserType } from "@/lib/permissions"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginMessage, setLoginMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  })
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay un mensaje de navegación
    const message = localStorage.getItem('login-message')
    if (message) {
      setLoginMessage(message)
      localStorage.removeItem('login-message')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Verificar credenciales de administrador hardcodeadas
      if (formData.email === "admin@galapagos.com" && 
          formData.password === "admin123" && 
          formData.role === "administrador") {
        
        toast.success("¡Bienvenido, Administrador!")
        
        // Usar 'current-user' en lugar de 'user'
        localStorage.setItem("current-user", JSON.stringify({
          id: "admin",
          email: formData.email,
          name: "Administrador",
          role: "admin",
          permissions: [],
          status: "active",
          isAuthenticated: true
        }))
        
        router.push("/admin")
        return
      }

      // Verificar credenciales de investigadores registrados
      if (formData.role === "investigador") {
        // Obtener usuarios registrados
        const users: UserType[] = JSON.parse(localStorage.getItem('users') || '[]')
        const credentials = JSON.parse(localStorage.getItem('credentials') || '{}')
        
        // Buscar usuario por email
        const user = users.find(u => u.email === formData.email && u.role === 'researcher')
        
        if (!user) {
          setError("No se encontró una cuenta de investigador con este correo electrónico.")
          setIsLoading(false)
          return
        }

        // Verificar contraseña
        const userCredentials = credentials[formData.email]
        if (!userCredentials || userCredentials.password !== formData.password) {
          setError("Contraseña incorrecta.")
          setIsLoading(false)
          return
        }

        // Verificar estado del usuario
        if (user.status === 'suspended') {
          setError("Tu cuenta ha sido suspendida. Contacta al administrador.")
          setIsLoading(false)
          return
        }

        if (user.status === 'pending') {
          setError("Tu cuenta está pendiente de aprobación por el administrador.")
          setIsLoading(false)
          return
        }

        // Login exitoso para investigador - usar 'current-user'
        toast.success(`¡Bienvenido, ${user.name}!`)
        
        localStorage.setItem("current-user", JSON.stringify({
          ...user,
          isAuthenticated: true
        }))
        
        router.push("/researcher")
        return
      }

      // Si llegamos aquí, las credenciales son incorrectas
      setError("Credenciales incorrectas. Verifica tu email, contraseña y rol.")
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      setError("Error al iniciar sesión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {loginMessage && (
        <Alert className="border-blue-500">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-blue-700">
            {loginMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert className="border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Tipo de Usuario</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value) => setFormData({ ...formData, role: value })}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="investigador">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Investigador
              </div>
            </SelectItem>
            <SelectItem value="administrador">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Administrador
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>
    </form>
  )
}

