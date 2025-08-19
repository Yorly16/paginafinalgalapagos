"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Upload, X, Plus } from "lucide-react"

const speciesSchema = z.object({
  commonName: z.string().min(2, "El nombre común debe tener al menos 2 caracteres"),
  scientificName: z.string().min(2, "El nombre científico debe tener al menos 2 caracteres"),
  category: z.string().min(1, "Selecciona una categoría"),
  status: z.string().min(1, "Selecciona un estado de conservación"),
  location: z.string().min(2, "La ubicación debe tener al menos 2 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  habitat: z.string().min(2, "El hábitat debe tener al menos 2 caracteres"),
  diet: z.string().min(2, "La dieta debe tener al menos 2 caracteres"),
  size: z.string().min(1, "El tamaño es requerido"),
  weight: z.string().optional(),
  lifespan: z.string().optional(),
  threats: z.string().optional(),
  conservationEfforts: z.string().optional()
})

type SpeciesFormData = z.infer<typeof speciesSchema>

export function AddSpeciesForm() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SpeciesFormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      commonName: "",
      scientificName: "",
      category: "",
      status: "",
      location: "",
      description: "",
      habitat: "",
      diet: "",
      size: "",
      weight: "",
      lifespan: "",
      threats: "",
      conservationEfforts: ""
    }
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const onSubmit = async (data: SpeciesFormData) => {
    setIsSubmitting(true)
    
    try {
      // Crear objeto de especie con todos los datos
      const newSpecies = {
        id: Date.now(), // ID temporal basado en timestamp
        ...data,
        tags,
        image: imagePreview || "/placeholder.jpg",
        dateAdded: new Date().toISOString(),
        addedBy: "admin@galapagos.com"
      }

      // Obtener especies existentes del localStorage
      const existingSpecies = JSON.parse(localStorage.getItem("galapagos-species") || "[]")
      
      // Añadir la nueva especie
      const updatedSpecies = [...existingSpecies, newSpecies]
      
      // Guardar en localStorage
      localStorage.setItem("galapagos-species", JSON.stringify(updatedSpecies))
      
      // Mostrar mensaje de éxito
      toast.success(`¡Especie "${data.commonName}" añadida exitosamente!`)
      
      // Limpiar formulario
      form.reset()
      setSelectedImage(null)
      setImagePreview(null)
      setTags([])
      
    } catch (error) {
      toast.error("Error al añadir la especie. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Añadir Nueva Especie</CardTitle>
        <CardDescription>
          Completa la información de la nueva especie para añadirla al catálogo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="commonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Común</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Iguana Marina" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scientificName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Científico</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Amblyrhynchus cristatus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mamifero">Mamífero</SelectItem>
                        <SelectItem value="ave">Ave</SelectItem>
                        <SelectItem value="reptil">Reptil</SelectItem>
                        <SelectItem value="pez">Pez</SelectItem>
                        <SelectItem value="invertebrado">Invertebrado</SelectItem>
                        <SelectItem value="planta">Planta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Conservación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="estable">Estable</SelectItem>
                        <SelectItem value="vulnerable">Vulnerable</SelectItem>
                        <SelectItem value="en-peligro">En Peligro</SelectItem>
                        <SelectItem value="critico">Crítico</SelectItem>
                        <SelectItem value="extinto">Extinto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Santa Cruz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe las características principales de la especie..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Información Detallada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="habitat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hábitat</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Costas rocosas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="diet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dieta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Algas marinas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamaño</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 1.5 metros" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 12 kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lifespan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Esperanza de Vida (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 60-70 años" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Imagen */}
            <div className="space-y-4">
              <FormLabel>Imagen de la Especie</FormLabel>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Subir Imagen
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {selectedImage && (
                  <span className="text-sm text-muted-foreground">
                    {selectedImage.name}
                  </span>
                )}
              </div>
              {imagePreview && (
                <div className="relative w-32 h-32">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-full object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => {
                      setSelectedImage(null)
                      setImagePreview(null)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <FormLabel>Etiquetas</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir etiqueta"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Información Adicional */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="threats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenazas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe las principales amenazas que enfrenta la especie..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="conservationEfforts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Esfuerzos de Conservación (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe los esfuerzos de conservación actuales..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Añadiendo Especie..." : "Añadir Especie"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}