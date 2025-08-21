"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Database, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { SpeciesService } from '@/lib/species-service'
import { toast } from 'sonner'

export function MigrationTool() {
  const [isLoading, setIsLoading] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: number
    errors: number
  } | null>(null)

  const handleMigration = async () => {
    setIsLoading(true)
    setMigrationResult(null)

    try {
      const result = await SpeciesService.migrateFromLocalStorage()
      setMigrationResult(result)
      
      if (result.success > 0) {
        toast.success(`Migración completada: ${result.success} especies migradas`)
      }
      
      if (result.errors > 0) {
        toast.error(`${result.errors} especies no pudieron ser migradas`)
      }
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('Error durante la migración')
    } finally {
      setIsLoading(false)
    }
  }

  const getLocalSpeciesCount = () => {
    try {
      const localData = localStorage.getItem('galapagos-species')
      return localData ? JSON.parse(localData).length : 0
    } catch {
      return 0
    }
  }

  const localCount = getLocalSpeciesCount()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Migración de Datos
        </CardTitle>
        <CardDescription>
          Migra los datos de especies desde localStorage a Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <p className="font-medium">Especies en localStorage</p>
            <p className="text-sm text-gray-600">{localCount} especies encontradas</p>
          </div>
          <div className="text-2xl font-bold text-blue-600">{localCount}</div>
        </div>

        {migrationResult && (
          <Alert className={migrationResult.errors > 0 ? "border-yellow-500" : "border-green-500"}>
            {migrationResult.errors > 0 ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              Migración completada: {migrationResult.success} especies migradas exitosamente
              {migrationResult.errors > 0 && `, ${migrationResult.errors} errores`}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleMigration} 
          disabled={isLoading || localCount === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Migrando datos...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Migrar a Supabase
            </>
          )}
        </Button>

        {localCount === 0 && (
          <p className="text-sm text-gray-500 text-center">
            No hay datos en localStorage para migrar
          </p>
        )}
      </CardContent>
    </Card>
  )
}