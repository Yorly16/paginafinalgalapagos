import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, MapPin } from "lucide-react"
import Link from "next/link"

const featuredSpecies = [
  {
    id: 1,
    name: "Iguana Marina",
    scientificName: "Amblyrhynchus cristatus",
    category: "Reptil",
    status: "Vulnerable",
    location: "Todas las islas",
    image: "/marine-iguana-swimming.png",
    description: "La única iguana marina del mundo, perfectamente adaptada a la vida acuática.",
  },
  {
    id: 2,
    name: "Tortuga Gigante",
    scientificName: "Chelonoidis nigra",
    category: "Reptil",
    status: "En Peligro",
    location: "Isabela, Santa Cruz",
    image: "/galapagos-giant-tortoise-large-shell.png",
    description: "Símbolo icónico de las Galápagos, puede vivir más de 100 años.",
  },
  {
    id: 3,
    name: "Pinzón de Darwin",
    scientificName: "Geospiza fortis",
    category: "Ave",
    status: "Estable",
    location: "Múltiples islas",
    image: "/darwin-finch-beaks.png",
    description: "Clave en la teoría de la evolución de Darwin por la adaptación de su pico.",
  },
]

export function SpeciesPreview() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Especies Destacadas</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conoce algunas de las especies más emblemáticas que han hecho de las Galápagos un laboratorio natural único
            en el mundo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredSpecies.map((species) => (
            <Card key={species.id} className="group hover:shadow-lg transition-all duration-300 border-border">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={species.image || "/placeholder.svg"}
                  alt={species.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 right-3 bg-background/90 text-foreground" variant="secondary">
                  {species.category}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-foreground">{species.name}</CardTitle>
                <p className="text-sm italic text-muted-foreground">{species.scientificName}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{species.description}</p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {species.location}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant={species.status === "Estable" ? "default" : "destructive"} className="text-xs">
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

        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/especies">Ver Todas las Especies</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
