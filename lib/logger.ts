export const logger = {
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error)
    }
    // En producción, enviar a servicio de logging
  },
  warn: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message)
    }
  },
  info: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(message)
    }
  }
}