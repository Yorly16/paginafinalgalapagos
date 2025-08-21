"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Language = 'es' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Traducciones
const translations = {
  es: {
    // Header
    'nav.species': 'Especies',
    'nav.maps': 'Mapas',
    'nav.researchers': 'Investigadores',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    
    // Home page
    'home.title': 'Galápagos DataLens',
    'home.subtitle': 'Explora la biodiversidad única de las Islas Galápagos',
    'home.description': 'Descubre especies endémicas, accede a datos científicos y contribuye a la conservación de este patrimonio natural único.',
    'home.explore': 'Explorar Especies',
    'home.learn_more': 'Conocer Más',
    
    // Species
    'species.title': 'Catálogo de Especies',
    'species.subtitle': 'Explora todas las especies registradas en nuestro catálogo local de las Islas Galápagos',
    'species.search_filters': 'Filtros de Búsqueda',
    'species.search_placeholder': 'Nombre común, científico...',
    'species.category': 'Categoría',
    'species.all_categories': 'Todas las categorías',
    'species.conservation_status': 'Estado de Conservación',
    'species.all_statuses': 'Todos los estados',
    'species.showing_results': 'Mostrando {count} de {total} especies',
    'species.no_species': 'No hay especies registradas aún',
    'species.admin_panel': 'Ir al Panel de Administración',
    
    // Admin
    'admin.title': 'Panel de Administración',
    'admin.subtitle': 'Gestiona especies, usuarios y permisos del sistema.',
    'admin.stats': 'Estadísticas',
    'admin.add_species': 'Añadir Especie',
    'admin.search_species': 'Buscar Especie',
    'admin.local_db': 'Base Local',
    'admin.users': 'Usuarios',
    'admin.permissions': 'Permisos',
    'admin.logout': 'Cerrar Sesión',
    'admin.researcher_panel': 'Panel Investigador',
    
    // Login
    'login.title': 'Iniciar Sesión',
    'login.subtitle': 'Ingresa tus credenciales para acceder al sistema',
    'login.email': 'Correo Electrónico',
    'login.password': 'Contraseña',
    'login.role': 'Tipo de Usuario',
    'login.role_placeholder': 'Selecciona tu rol',
    'login.researcher': 'Investigador',
    'login.administrator': 'Administrador',
    'login.submit': 'Iniciar Sesión',
    'login.no_account': '¿No tienes una cuenta?',
    'login.register_here': 'Regístrate aquí',
    
    // Register
    'register.title': 'Crear Cuenta',
    'register.subtitle': 'Únete a nuestra comunidad de investigadores',
    'register.first_name': 'Nombre',
    'register.last_name': 'Apellido',
    'register.email': 'Correo Electrónico',
    'register.password': 'Contraseña',
    'register.confirm_password': 'Confirmar Contraseña',
    'register.institution': 'Institución',
    'register.specialization': 'Especialización',
    'register.submit': 'Crear Cuenta',
    'register.have_account': '¿Ya tienes una cuenta?',
    'register.login_here': 'Inicia sesión aquí',
    
    // Footer
    'footer.explore': 'Explorar',
    'footer.species_catalog': 'Catálogo de Especies',
    'footer.interactive_maps': 'Mapas Interactivos',
    'footer.research': 'Investigación',
    'footer.conservation': 'Conservación',
    'footer.account': 'Cuenta',
    'footer.admin_panel': 'Panel de Admin',
    'footer.researchers': 'Investigadores',
    'footer.contact': 'Contacto',
    'footer.galapagos_ecuador': 'Islas Galápagos, Ecuador',
    'footer.rights': 'Todos los derechos reservados.',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.clear': 'Limpiar',
  },
  en: {
    // Header
    'nav.species': 'Species',
    'nav.maps': 'Maps',
    'nav.researchers': 'Researchers',
    'nav.login': 'Login',
    'nav.register': 'Register',
    
    // Home page
    'home.title': 'Galápagos DataLens',
    'home.subtitle': 'Explore the unique biodiversity of the Galápagos Islands',
    'home.description': 'Discover endemic species, access scientific data, and contribute to the conservation of this unique natural heritage.',
    'home.explore': 'Explore Species',
    'home.learn_more': 'Learn More',
    
    // Species
    'species.title': 'Species Catalog',
    'species.subtitle': 'Explore all species registered in our local catalog of the Galápagos Islands',
    'species.search_filters': 'Search Filters',
    'species.search_placeholder': 'Common name, scientific...',
    'species.category': 'Category',
    'species.all_categories': 'All categories',
    'species.conservation_status': 'Conservation Status',
    'species.all_statuses': 'All statuses',
    'species.showing_results': 'Showing {count} of {total} species',
    'species.no_species': 'No species registered yet',
    'species.admin_panel': 'Go to Administration Panel',
    
    // Admin
    'admin.title': 'Administration Panel',
    'admin.subtitle': 'Manage species, users and system permissions.',
    'admin.stats': 'Statistics',
    'admin.add_species': 'Add Species',
    'admin.search_species': 'Search Species',
    'admin.local_db': 'Local Database',
    'admin.users': 'Users',
    'admin.permissions': 'Permissions',
    'admin.logout': 'Logout',
    'admin.researcher_panel': 'Researcher Panel',
    
    // Login
    'login.title': 'Login',
    'login.subtitle': 'Enter your credentials to access the system',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.role': 'User Type',
    'login.role_placeholder': 'Select your role',
    'login.researcher': 'Researcher',
    'login.administrator': 'Administrator',
    'login.submit': 'Login',
    'login.no_account': "Don't have an account?",
    'login.register_here': 'Register here',
    
    // Register
    'register.title': 'Create Account',
    'register.subtitle': 'Join our community of researchers',
    'register.first_name': 'First Name',
    'register.last_name': 'Last Name',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.confirm_password': 'Confirm Password',
    'register.institution': 'Institution',
    'register.specialization': 'Specialization',
    'register.submit': 'Create Account',
    'register.have_account': 'Already have an account?',
    'register.login_here': 'Login here',
    
    // Footer
    'footer.explore': 'Explore',
    'footer.species_catalog': 'Species Catalog',
    'footer.interactive_maps': 'Interactive Maps',
    'footer.research': 'Research',
    'footer.conservation': 'Conservation',
    'footer.account': 'Account',
    'footer.admin_panel': 'Admin Panel',
    'footer.researchers': 'Researchers',
    'footer.contact': 'Contact',
    'footer.galapagos_ecuador': 'Galápagos Islands, Ecuador',
    'footer.rights': 'All rights reserved.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Cargar idioma desde localStorage solo en el cliente
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage)
      // Actualizar el atributo lang del documento
      document.documentElement.lang = savedLanguage
    }
  }, [])

  // Efecto para actualizar el atributo lang cuando cambie el idioma
  useEffect(() => {
    if (isClient) {
      document.documentElement.lang = language
    }
  }, [language, isClient])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    if (isClient) {
      localStorage.setItem('language', newLanguage)
      // Actualizar inmediatamente el atributo lang del documento
      document.documentElement.lang = newLanguage
    }
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}