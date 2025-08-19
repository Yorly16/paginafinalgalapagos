import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, ExternalLink, MapPin, Calendar } from "lucide-react"
import Link from "next/link"

interface InvestigatorCardProps {
  investigator: {
    id: string
    name: string
    email: string
    institution: string
    specialization: string
    biography?: string
    orcid?: string
    registrationDate: string
  }
}

export function InvestigatorCard({ investigator }: InvestigatorCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {investigator.name}
            </CardTitle>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {investigator.institution}
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit">
          {investigator.specialization}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {investigator.biography && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {investigator.biography}
          </p>
        )}
        
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          Registrado: {new Date(investigator.registrationDate).toLocaleDateString('es-ES')}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`mailto:${investigator.email}`}>
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Link>
          </Button>
          
          {investigator.orcid && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`https://orcid.org/${investigator.orcid}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-1" />
                ORCID
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}