import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Detectar tipo de dispositivo
export function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'
  
  const userAgent = navigator.userAgent
  
  // Detectar tablets
  if (/iPad|Android(?=.*\bMobile\b)/i.test(userAgent)) {
    return 'tablet'
  }
  
  // Detectar móviles
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return 'mobile'
  }
  
  return 'desktop'
}

// Detectar si es dispositivo móvil (mantener compatibilidad)
export function isMobileDevice(): boolean {
  return getDeviceType() === 'mobile'
}

// Generar mensaje de WhatsApp con detalles del pedido
export function generateWhatsAppMessage(items: { producto?: { nombre?: string; precio?: number }; color?: { nombre?: string }; talla?: string; cantidad?: number }[], customerInfo?: {
  nombre?: string
  dni?: string
  telefono?: string
  provincia?: string
  distrito?: string
  direccion?: string
  referencia?: string
  codigo_postal?: string
  empresa_envio?: string
  sede_envio?: string
}): string {
  if (!items || items.length === 0) {
    let message = "¡Hola! Me gustaría obtener más información sobre sus productos."
    
    if (customerInfo?.nombre || customerInfo?.dni || customerInfo?.telefono || 
        customerInfo?.provincia || customerInfo?.distrito || customerInfo?.direccion || 
        customerInfo?.referencia || customerInfo?.codigo_postal || customerInfo?.empresa_envio || customerInfo?.sede_envio) {
      message += "\n\nMIS DATOS:"
      if (customerInfo.nombre) message += `\nNombre: ${customerInfo.nombre}`
      if (customerInfo.dni) message += `\nDNI: ${customerInfo.dni}`
      if (customerInfo.telefono) message += `\nTeléfono: ${customerInfo.telefono}`
      
      // Verificar si es Lima o provincia
      const isLima = customerInfo.provincia?.toLowerCase() === 'lima' || 
                     customerInfo.provincia?.toLowerCase() === 'lima metropolitana' ||
                     customerInfo.provincia?.toLowerCase() === 'callao'
      
      
      if (isLima) {
        // Datos para Lima
        if (customerInfo.distrito) message += `\nDistrito: ${customerInfo.distrito}`
        if (customerInfo.direccion) message += `\nDirección: ${customerInfo.direccion}`
        if (customerInfo.referencia) message += `\nReferencia: ${customerInfo.referencia}`
      } else {
        // Datos para provincia
        if (customerInfo.provincia) message += `\nProvincia: ${customerInfo.provincia}`
        if (customerInfo.empresa_envio) message += `\nEmpresa de envío: ${customerInfo.empresa_envio}`
        if (customerInfo.sede_envio) message += `\nSede: ${customerInfo.sede_envio}`
      }
      
      if (customerInfo.codigo_postal) message += `\nCódigo Postal: ${customerInfo.codigo_postal}`
    }
    
    return encodeURIComponent(message)
  }

  let message = `¡Hola! Me interesan estos productos:\n\n`
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.producto?.nombre || 'Producto'}\n`
    if (item.color?.nombre) message += `   Color: ${item.color.nombre}\n`
    if (item.talla) message += `   Talla: ${item.talla}\n`
    message += `   Cantidad: ${item.cantidad || 1}\n`
    if (item.producto?.precio) message += `   Precio: S/ ${item.producto.precio}\n`
    message += `\n`
  })

  const total = items.reduce((sum, item) => {
    const precio = item.producto?.precio || 0
    const cantidad = item.cantidad || 1
    return sum + (precio * cantidad)
  }, 0)

  if (total > 0) {
    message += `Total: S/ ${total.toFixed(2)}\n\n`
  }

  // Agregar información del cliente
  if (customerInfo?.nombre || customerInfo?.dni || customerInfo?.telefono || 
      customerInfo?.provincia || customerInfo?.distrito || customerInfo?.direccion || 
      customerInfo?.referencia || customerInfo?.codigo_postal || customerInfo?.empresa_envio || customerInfo?.sede_envio) {
    message += `MIS DATOS:\n`
    if (customerInfo.nombre) message += `Nombre: ${customerInfo.nombre}\n`
    if (customerInfo.dni) message += `DNI: ${customerInfo.dni}\n`
    if (customerInfo.telefono) message += `Teléfono: ${customerInfo.telefono}\n`
    
    // Verificar si es Lima o provincia
    const isLima = customerInfo.provincia?.toLowerCase() === 'lima' || 
                   customerInfo.provincia?.toLowerCase() === 'lima metropolitana' ||
                   customerInfo.provincia?.toLowerCase() === 'callao'
    
    
    if (isLima) {
      // Datos para Lima
      if (customerInfo.distrito) message += `Distrito: ${customerInfo.distrito}\n`
      if (customerInfo.direccion) message += `Dirección: ${customerInfo.direccion}\n`
      if (customerInfo.referencia) message += `Referencia: ${customerInfo.referencia}\n`
    } else {
      // Datos para provincia
      if (customerInfo.provincia) message += `Provincia: ${customerInfo.provincia}\n`
      if (customerInfo.empresa_envio) message += `Empresa de envío: ${customerInfo.empresa_envio}\n`
      if (customerInfo.sede_envio) message += `Sede: ${customerInfo.sede_envio}\n`
    }
    
    if (customerInfo.codigo_postal) message += `Código Postal: ${customerInfo.codigo_postal}\n\n`
  }
  
  message += `¿Están disponibles? ¿Cuál es el precio por mayor?`

  return encodeURIComponent(message)
}

// Función mejorada para abrir WhatsApp
export async function openWhatsApp(phoneNumber: string, message?: string) {
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, '') // Solo números
  const deviceType = getDeviceType()
  
  // Copiar mensaje al portapapeles si existe
  if (message) {
    const decodedMessage = decodeURIComponent(message)
    try {
      await copyToClipboard(decodedMessage)
      // Mostrar notificación de que el mensaje fue copiado
      showClipboardNotification()
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error)
    }
  }
  
  if (deviceType === 'mobile') {
    // En móvil, usar wa.me con mensaje (abre la app nativa)
    const url = message 
      ? `https://wa.me/${cleanPhoneNumber}?text=${message}`
      : `https://wa.me/${cleanPhoneNumber}`
    window.open(url, '_blank')
  } else if (deviceType === 'tablet') {
    // En tablet, usar wa.me (puede abrir app o web)
    const url = message 
      ? `https://wa.me/${cleanPhoneNumber}?text=${message}`
      : `https://wa.me/${cleanPhoneNumber}`
    window.open(url, '_blank')
  } else {
    // En desktop, usar WhatsApp Web
    const webUrl = message 
      ? `https://web.whatsapp.com/send?phone=${cleanPhoneNumber}&text=${message}`
      : `https://web.whatsapp.com/send?phone=${cleanPhoneNumber}`
    window.open(webUrl, '_blank')
  }
}

// Funciones de WhatsApp Desktop removidas para simplificar

// Función para mostrar notificación de portapapeles
export function showClipboardNotification() {
  // Crear una notificación temporal
  const notification = document.createElement('div')
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #25D366;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
    ">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>✅</span>
        <span><strong>Mensaje copiado!</strong><br>Presiona Ctrl+V en WhatsApp para pegarlo</span>
      </div>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // Remover la notificación después de 4 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 4000)
}

// Funciones complejas de WhatsApp Desktop removidas para simplificar

// Función para copiar al portapapeles
export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback para navegadores más antiguos
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve()
      } else {
        reject()
      }
      textArea.remove()
    })
  }
}