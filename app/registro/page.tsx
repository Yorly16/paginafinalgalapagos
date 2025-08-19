import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">Crear Cuenta</CardTitle>
              <CardDescription className="text-muted-foreground">
                Únete a la comunidad científica de las Galápagos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
