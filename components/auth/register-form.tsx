"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, CheckCircle, AlertCircle } from "lucide-react"
import { User as UserType } from "@/lib/permissions"

// Extender el tipo UserType para incluir campos adicionales
interface ExtendedUser extends UserType {
  institution?: string
  specialization?: string
  bio?: string
  orcid?: string
  documentType?: string
  documentNumber?: string
}

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "researcher", // Corregido: usar 'researcher' consistentemente
    institution: "",
    specialization: "",
    bio: "",
    orcid: "",
    documentType: "cedula",
    documentNumber: "",
  })

  // Función para validar ORCID mejorada
  const validateORCID = (orcid: string) => {
    // ORCID format: 0000-0000-0000-000X (donde X puede ser dígito o X)
    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/
    if (!orcidRegex.test(orcid)) return false
    
    // Validación adicional del checksum si es necesario
    return true
  }

  // Función para validar cédula ecuatoriana
  const validateCedula = (cedula: string) => {
    if (cedula.length !== 10) return false
    
    const digits = cedula.split('').map(Number)
    const province = parseInt(cedula.substring(0, 2))
    
    // Verificar que la provincia sea válida (01-24)
    if (province < 1 || province > 24) return false
    
    // Algoritmo de validación de cédula ecuatoriana
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    let sum = 0
    
    for (let i = 0; i < 9; i++) {
      let result = digits[i] * coefficients[i]
      if (result > 9) result -= 9
      sum += result
    }
    
    const checkDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10)
    return checkDigit === digits[9]
  }

  // Función para validar pasaporte
  const validatePassport = (passport: string) => {
    // Pasaporte debe tener entre 6-9 caracteres alfanuméricos
    const passportRegex = /^[A-Z0-9]{6,9}$/
    return passportRegex.test(passport.toUpperCase())
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setMessage({ type: 'error', text: 'El nombre es requerido' })
      return false
    }
    if (!formData.lastName.trim()) {
      setMessage({ type: 'error', text: 'El apellido es requerido' })
      return false
    }
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'El correo electrónico es requerido' })
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'El correo electrónico no es válido' })
      return false
    }
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return false
    }
    if (!formData.institution.trim()) {
      setMessage({ type: 'error', text: 'La institución es requerida' })
      return false
    }
    
    // Validación ORCID
    if (!formData.orcid.trim()) {
      setMessage({ type: 'error', text: 'El código ORCID es requerido' })
      return false
    }
    if (!validateORCID(formData.orcid)) {
      setMessage({ type: 'error', text: 'El código ORCID no es válido. Formato: 0000-0000-0000-000X' })
      return false
    }
    
    // Validación documento de identidad
    if (!formData.documentNumber.trim()) {
      setMessage({ type: 'error', text: 'El número de documento es requerido' })
      return false
    }
    
    if (formData.documentType === 'cedula') {
      if (!validateCedula(formData.documentNumber)) {
        setMessage({ type: 'error', text: 'La cédula de identidad no es válida' })
        return false
      }
    } else if (formData.documentType === 'pasaporte') {
      if (!validatePassport(formData.documentNumber)) {
        setMessage({ type: 'error', text: 'El número de pasaporte no es válido (6-9 caracteres alfanuméricos)' })
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Verificar si el email ya existe
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
      if (existingUsers.some((user: ExtendedUser) => user.email === formData.email)) {
        setMessage({ type: 'error', text: 'Ya existe una cuenta con este correo electrónico' })
        setIsLoading(false)
        return
      }

      // Verificar si el ORCID ya existe
      if (existingUsers.some((user: ExtendedUser) => user.orcid === formData.orcid)) {
        setMessage({ type: 'error', text: 'Ya existe una cuenta con este código ORCID' })
        setIsLoading(false)
        return
      }

      // Verificar si el documento ya existe
      if (existingUsers.some((user: ExtendedUser) => user.documentNumber === formData.documentNumber)) {
        setMessage({ type: 'error', text: 'Ya existe una cuenta con este número de documento' })
        setIsLoading(false)
        return
      }

      // Crear nuevo usuario investigador
      const newUser: ExtendedUser = {
        id: Date.now().toString(),
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        role: 'researcher', // Corregido: usar 'researcher' consistentemente
        permissions: [], // Los investigadores empiezan sin permisos adicionales
        status: 'active',
        createdAt: new Date().toISOString(),
        // Campos adicionales para investigadores
        institution: formData.institution,
        specialization: formData.specialization,
        bio: formData.bio,
        orcid: formData.orcid,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber
      }

      // Guardar usuario en localStorage
      const updatedUsers = [...existingUsers, newUser]
      localStorage.setItem('users', JSON.stringify(updatedUsers))

      // Guardar credenciales (en un sistema real esto sería manejado por el backend)
      const credentials = JSON.parse(localStorage.getItem('credentials') || '{}')
      credentials[formData.email] = {
        password: formData.password, // En producción esto debería estar hasheado
        userId: newUser.id
      }
      localStorage.setItem('credentials', JSON.stringify(credentials))

      setMessage({ 
        type: 'success', 
        text: '¡Cuenta creada exitosamente! Ya puedes iniciar sesión como investigador.' 
      })

      // Limpiar formulario
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "researcher", // Corregido
        institution: "",
        specialization: "",
        bio: "",
        orcid: "",
        documentType: "cedula",
        documentNumber: "",
      })

      // Redirigir al login después de 2 segundos usando Next.js router
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      console.error('Error al registrar usuario:', error)
      setMessage({ type: 'error', text: 'Error al crear la cuenta. Inténtalo de nuevo.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            placeholder="Juan"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            placeholder="Pérez"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
      </div>

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
            minLength={6}
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
        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="orcid">Código ORCID</Label>
        <Input
          id="orcid"
          placeholder="0000-0000-0000-000X"
          value={formData.orcid}
          onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
          required
          disabled={isLoading}
          maxLength={19}
        />
        <p className="text-sm text-muted-foreground">
          Formato: 0000-0000-0000-000X. Si no tienes ORCID, puedes obtenerlo en{" "}
          <a href="https://orcid.org/register" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            orcid.org
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="documentType">Tipo de Documento</Label>
        <Select 
          value={formData.documentType} 
          onValueChange={(value) => setFormData({ ...formData, documentType: value, documentNumber: "" })} 
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cedula">Cédula de Identidad</SelectItem>
            <SelectItem value="pasaporte">Pasaporte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="documentNumber">
          {formData.documentType === 'cedula' ? 'Número de Cédula' : 'Número de Pasaporte'}
        </Label>
        <Input
          id="documentNumber"
          placeholder={formData.documentType === 'cedula' ? '1234567890' : 'AB123456'}
          value={formData.documentNumber}
          onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
          required
          disabled={isLoading}
          maxLength={formData.documentType === 'cedula' ? 10 : 9}
        />
        <p className="text-sm text-muted-foreground">
          {formData.documentType === 'cedula' 
            ? 'Ingresa tu cédula de identidad ecuatoriana (10 dígitos)'
            : 'Ingresa tu número de pasaporte (6-9 caracteres alfanuméricos)'
          }
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Tipo de Usuario</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="researcher">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Investigador
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="institution">Institución</Label>
        <Input
          id="institution"
          placeholder="Universidad o centro de investigación"
          value={formData.institution}
          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialization">Especialización</Label>
        <Input
          id="specialization"
          placeholder="Ej: Biología Marina, Ornitología"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Biografía (Opcional)</Label>
        <Textarea
          id="bio"
          placeholder="Cuéntanos sobre tu experiencia en investigación..."
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>
    </form>
  )
}
