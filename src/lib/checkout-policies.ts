import {
  CONTACT_EMAIL,
  SITE_NAME,
  WHATSAPP_NUMBER_DISPLAY,
  getBusinessAddress,
} from '@/lib/site'
import {
  SHIPPING_LIMA_DEPARTAMENTO,
  SHIPPING_LIMA_METROPOLITANA,
  SHIPPING_PROVINCIA_AGENCY,
} from '@/lib/shipping'

export type CheckoutPolicyId = 'terms' | 'privacy' | 'returns'

export type PolicySection = {
  heading?: string
  paragraphs: string[]
}

export type CheckoutPolicyContent = {
  id: CheckoutPolicyId
  title: string
  updatedAt: string
  sections: PolicySection[]
}

const contactBlock = `Correo: ${CONTACT_EMAIL} · WhatsApp: ${WHATSAPP_NUMBER_DISPLAY} · ${getBusinessAddress()}`

export const CHECKOUT_POLICIES: Record<CheckoutPolicyId, CheckoutPolicyContent> = {
  terms: {
    id: 'terms',
    title: 'Términos del servicio',
    updatedAt: '26 de mayo de 2026',
    sections: [
      {
        paragraphs: [
          `Al comprar en ${SITE_NAME} (excusasjeans.com) aceptas estos términos. Los precios y stock se confirman al pagar. El pago online acepta tarjeta, Yape y billeteras habilitadas en el checkout.`,
        ],
      },
      {
        heading: 'LIMA METROPOLITANA',
        paragraphs: [
          `Envío a domicilio con tarifa de S/ ${SHIPPING_LIMA_METROPOLITANA.toFixed(2)} (según distrito en checkout). Despachamos al día hábil siguiente de confirmado el pago, salvo falta de stock.`,
          'Las entregas se coordinan en horario de tarde, aproximadamente entre 1:00 p. m. y 8:00 p. m.; la hora exacta puede variar según distrito y ruta.',
          'El plazo estimado es de 1 a 2 días hábiles desde el despacho, según stock, hora de compra y ubicación.',
        ],
      },
      {
        heading: 'LIMA DEPARTAMENTO',
        paragraphs: [
          `Envío a domicilio con tarifa de S/ ${SHIPPING_LIMA_DEPARTAMENTO.toFixed(2)} (distritos del cono y zonas alejadas de Lima).`,
          'Despacho al día hábil siguiente de confirmado el pago, salvo falta de stock. Entregas en tarde (1:00 p. m. – 8:00 p. m.).',
          'Plazo estimado de 2 a 3 días hábiles desde el despacho, según stock y distrito.',
        ],
      },
      {
        heading: 'PROVINCIA',
        paragraphs: [
          `Incluye S/ ${SHIPPING_PROVINCIA_AGENCY.toFixed(2)} por llevar tu pedido hasta la agencia Shalom indicada. El flete en destino lo pagas al recoger (no está incluido en este pago).`,
          'Envíos a agencia de lunes a viernes. Si compras el viernes por la tarde, sábado o domingo, el envío se programa para el lunes.',
          'Tiempo estimado hasta la agencia: 3 a 5 días hábiles aproximadamente. Puede demorar más por causas ajenas al courier.',
          'Si no hay Shalom en tu zona, contáctanos por WhatsApp para coordinar otra agencia.',
        ],
      },
      {
        heading: 'GENERAL',
        paragraphs: [
          'Tras el pago te escribimos por WhatsApp para confirmar datos y envío de comprobante o guía.',
          'Solo realizamos cambios de talla del mismo producto (mismo modelo y color), según nuestra política de cambios. No hacemos devoluciones ni cambios de modelo.',
          contactBlock,
        ],
      },
    ],
  },
  returns: {
    id: 'returns',
    title: 'Política de cambios',
    updatedAt: '26 de mayo de 2026',
    sections: [
      {
        paragraphs: [
          `Aplica a compras en excusasjeans.com. En ${SITE_NAME} solo hacemos cambios de talla del mismo producto (mismo modelo y color). No realizamos devoluciones ni cambios de modelo.`,
        ],
      },
      {
        heading: 'CAMBIOS DE TALLA',
        paragraphs: [
          'Plazo: hasta 7 días calendario desde que recibes el producto (Lima) o desde que la agencia confirma llegada (provincia).',
          'Condiciones: prenda sin uso, con etiquetas originales, sin olores ni daños, mismo modelo y color. Solo se cambia la talla, sujeto a stock disponible.',
          'Debes escribirnos por WhatsApp con fotos, número de pedido y la talla que necesitas.',
          'En Lima coordinamos recojo o entrega en punto acordado. En provincia el cliente asume el flete de envío y retorno salvo error nuestro.',
          'Si no hay tu talla en stock, te avisamos; no se cambia por otro modelo ni se devuelve el dinero.',
        ],
      },
      {
        heading: 'NO APLICA',
        paragraphs: [
          'Devoluciones de dinero, cambios de modelo, color o producto distinto.',
          'Prendas usadas, lavadas, alteradas o sin etiqueta. Promociones o liquidaciones pueden tener condiciones especiales en la ficha del producto.',
          contactBlock,
        ],
      },
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Política de privacidad',
    updatedAt: '26 de mayo de 2026',
    sections: [
      {
        paragraphs: [
          `${SITE_NAME} gestiona excusasjeans.com y trata tus datos para procesar pedidos, pagos, envíos y atención al cliente. Al usar el sitio o comprar, aceptas esta política.`,
          'Si hay conflicto entre estos términos y otra política del sitio, prevalece lo indicado aquí respecto al tratamiento de datos personales.',
        ],
      },
      {
        heading: 'DATOS QUE RECOPILAMOS',
        paragraphs: [
          'Contacto: nombre, correo, teléfono, DNI o carné de extranjería, dirección y datos de envío.',
          'Compra: productos, tallas, colores, montos, historial de pedidos y comprobantes.',
          'Pago: los datos de tarjeta los procesa Culqi; nosotros no almacenamos el número completo de tu tarjeta.',
          'Técnica: dirección IP, navegador, cookies necesarias para sesión y carrito, y estadísticas básicas de uso del sitio.',
        ],
      },
      {
        heading: 'PARA QUÉ LOS USAMOS',
        paragraphs: [
          'Procesar y entregar pedidos, cobrar pagos, enviar confirmaciones y coordinar por WhatsApp.',
          'Gestionar tu cuenta si te registras, recordar preferencias y resolver reclamos o cambios.',
          'Prevenir fraude, cumplir obligaciones legales (facturación, libro de reclamaciones) y mejorar el catálogo.',
          'Con tu consentimiento, enviarte novedades o promociones; puedes pedir dejar de recibirlas en cualquier momento.',
        ],
      },
      {
        heading: 'CON QUIÉN LOS COMPARTIMOS',
        paragraphs: [
          'Culqi: procesamiento de pagos.',
          'Proveedores de hosting, base de datos (InsForge) y mensajería solo para operar la tienda.',
          'Couriers (por ejemplo Shalom) cuando es necesario para el envío.',
          'Autoridades si la ley lo exige. No vendemos tu información personal a terceros para su marketing.',
        ],
      },
      {
        heading: 'TUS DERECHOS Y SEGURIDAD',
        paragraphs: [
          'Puedes solicitar acceso, rectificación o eliminación de tus datos escribiendo a ' +
            CONTACT_EMAIL +
            ' o por WhatsApp, adjuntando DNI y descripción de tu pedido.',
          'Conservamos la información el tiempo necesario para pedidos, contabilidad y reclamos legales.',
          'Aplicamos medidas razonables de seguridad; ningún sistema en internet es 100 % infalible.',
          'El sitio no está dirigido a menores de 18 años.',
        ],
      },
      {
        heading: 'COOKIES Y ACTUALIZACIONES',
        paragraphs: [
          'Usamos cookies esenciales para el carrito y la sesión. Puedes configurar tu navegador para limitar cookies.',
          'Podemos actualizar esta política; la fecha de actualización se muestra arriba. El uso continuado del sitio implica conocer la versión vigente.',
          contactBlock,
        ],
      },
    ],
  },
}

export const CHECKOUT_POLICY_LINKS: { id: CheckoutPolicyId; label: string }[] = [
  { id: 'returns', label: 'Política de cambios' },
  { id: 'terms', label: 'Términos del servicio' },
  { id: 'privacy', label: 'Política de privacidad' },
]
