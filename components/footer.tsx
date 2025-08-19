import Link from "next/link"
import { MapPin, Mail, Phone, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg text-foreground">Galápagos DataLens</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma científica dedicada a la conservación y estudio de la biodiversidad única de las Islas
              Galápagos.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Explorar</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/especies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Catálogo de Especies
              </Link>
              <Link href="/mapa" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Mapa Interactivo
              </Link>
              <Link
                href="/investigacion"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Investigación
              </Link>
              <Link
                href="/conservacion"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Conservación
              </Link>
            </nav>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Cuenta</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/registro" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Registrarse
              </Link>
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Panel de Admin
              </Link>
              <Link
                href="/investigadores"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Investigadores
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Islas Galápagos, Ecuador
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                info@galapagos-species.org
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                +593 5 252-6146
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Galápagos Species Platform. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Link href="/privacidad" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Términos
            </Link>
            <Link href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
<Link
  href="/investigadores"
  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
>
  Investigadores
</Link>
