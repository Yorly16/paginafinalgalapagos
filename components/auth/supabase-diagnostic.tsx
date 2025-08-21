"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Wifi } from 'lucide-react'

export function SupabaseDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    envVars: false,
    connection: false,
    auth: false,
    database: false,
    session: null as any,
    error: null as string | null
  })
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const results = {
      envVars: false,
      connection: false,
      auth: false,
      database: false,
      session: null as any,
      error: null as string | null
    }

    try {
      // 1. Verificar variables de entorno
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('Supabase URL:', supabaseUrl)
      console.log('Supabase Key exists:', !!supabaseKey)
      
      results.envVars = !!(supabaseUrl && supabaseKey)
      
      if (!results.envVars) {
        results.error = 'Variables de entorno faltantes'
        setDiagnostics(results)
        setIsRunning(false)
        return
      }

      // 2. Verificar conexión básica
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1)
        results.connection = !error
        results.database = !error
        if (error) {
          console.error('Error de conexión:', error)
          results.error = error.message
        }
      } catch (err: any) {
        console.error('Error de red:', err)
        results.error = 'Error de red: ' + err.message
      }

      // 3. Verificar estado de autenticación
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        results.auth = !error
        results.session = session
        if (error) {
          console.error('Error de auth:', error)
        }
      } catch (err: any) {
        console.error('Error de auth:', err)
        results.error = results.error || ('Error de auth: ' + err.message)
      }

    } catch (err: any) {
      console.error('Error general:', err)
      results.error = 'Error general: ' + err.message
    }

    setDiagnostics(results)
    setIsRunning(false)
  }

  const clearSession = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.clear()
      sessionStorage.clear()
      
      // Limpiar cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=")
        const name = eqPos > -1 ? c.substr(0, eqPos) : c
        if (name.trim().includes('supabase') || name.trim().includes('sb-')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
        }
      })
      
      alert('Sesión limpiada. Recargando página...')
      window.location.reload()
    } catch (error) {
      console.error('Error al limpiar:', error)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const DiagnosticItem = ({ label, status, details }: { label: string, status: boolean | null, details?: string }) => (
    <div className="flex items-center space-x-2 p-2 border rounded">
      {status === true ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : status === false ? (
        <XCircle className="h-5 w-5 text-red-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-yellow-500" />
      )}
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {details && <div className="text-sm text-gray-600">{details}</div>}
      </div>
    </div>
  )

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center space-x-2">
        <Wifi className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Diagnóstico de Supabase</h3>
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          size="sm"
          variant="outline"
        >
          {isRunning ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
        </Button>
      </div>

      <div className="space-y-2">
        <DiagnosticItem 
          label="Variables de Entorno" 
          status={diagnostics.envVars}
          details={diagnostics.envVars ? 'URL y Key configuradas' : 'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY'}
        />
        
        <DiagnosticItem 
          label="Conexión a Base de Datos" 
          status={diagnostics.connection}
          details={diagnostics.connection ? 'Conexión exitosa' : 'No se puede conectar'}
        />
        
        <DiagnosticItem 
          label="Servicio de Autenticación" 
          status={diagnostics.auth}
          details={diagnostics.auth ? 'Auth disponible' : 'Error en auth'}
        />
        
        <DiagnosticItem 
          label="Sesión Actual" 
          status={diagnostics.session ? true : false}
          details={diagnostics.session ? `Usuario: ${diagnostics.session.user?.email}` : 'Sin sesión activa'}
        />
      </div>

      {diagnostics.error && (
        <Alert className="border-red-500">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            <strong>Error:</strong> {diagnostics.error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-2">
        <Button onClick={clearSession} variant="destructive">
          Limpiar Sesión Completamente
        </Button>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Recargar Página
        </Button>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <div>Revisa la consola del navegador (F12) para más detalles</div>
        <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NO CONFIGURADA'}</div>
        <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'CONFIGURADA' : 'NO CONFIGURADA'}</div>
      </div>
    </div>
  )
}