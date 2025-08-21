import emailjs from '@emailjs/browser'

// Configuración de EmailJS
const EMAIL_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_ka1nnzs'
const EMAIL_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_zl3qie3'
const EMAIL_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 't2CCxS8Az14-5FWvE'

// Inicializar EmailJS
if (typeof window !== 'undefined') {
  emailjs.init(EMAIL_PUBLIC_KEY)
}

export interface WelcomeEmailData {
  to_name: string
  to_email: string
  user_institution: string
  user_specialization?: string
}

export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<boolean> => {
  try {
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') {
      console.error('EmailJS solo funciona en el cliente')
      return false
    }

    // Verificar credenciales
    if (!EMAIL_SERVICE_ID || !EMAIL_TEMPLATE_ID || !EMAIL_PUBLIC_KEY) {
      console.error('Faltan credenciales de EmailJS')
      return false
    }

    console.log('Configuración EmailJS:', {
      serviceId: EMAIL_SERVICE_ID,
      templateId: EMAIL_TEMPLATE_ID,
      publicKey: EMAIL_PUBLIC_KEY ? 'Configurada' : 'Faltante'
    })

    const templateParams = {
      to_name: data.to_name,
      to_email: data.to_email,
      user_institution: data.user_institution,
      user_specialization: data.user_specialization || 'No especificada',
      site_name: 'Portal de Biodiversidad Galápagos',
      current_year: new Date().getFullYear().toString(),
      current_date: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    console.log('Parámetros del template:', templateParams)

    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      templateParams
    )

    console.log('Email enviado exitosamente:', response.status, response.text)
    return response.status === 200
  } catch (error) {
    console.error('Error detallado al enviar email:', {
      error: error,
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    })
    return false
  }
}