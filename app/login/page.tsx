import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import Link from "next/link"

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex items-start justify-center bg-background px-4 pt-16 pb-16">
        <div className="w-full max-w-md">
          <Card className="border-border">
            <CardHeader className="space-y-3 py-8">
              <CardTitle className="text-2xl font-bold text-center">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <LoginForm />
              <div className="mt-6 text-center text-sm text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Regístrate aquí
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
