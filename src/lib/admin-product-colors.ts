import { adminQuery } from '@/lib/admin-api'

export type ExistingColorRow = {
  id: string
  nombre: string
  hex: string
  fotos_color: { id: string; url: string }[]
}

export type ColorWithPhotos = {
  nombre: string
  fotos: File[]
}

async function getColorIdsUsedInOrders(colorIds: string[]): Promise<Set<string>> {
  if (!colorIds.length) return new Set()
  const rows = await adminQuery<{ color_id: string }[]>({
    op: 'select',
    table: 'pedido_items',
    select: 'color_id',
    matchIn: { color_id: colorIds },
  })
  return new Set((rows ?? []).map((r) => r.color_id))
}

function normalizeColorName(name: string) {
  return name.trim().toLowerCase()
}

/**
 * Actualiza colores sin borrar los que tienen pedidos (FK pedido_items).
 */
export async function syncProductColores(params: {
  productId: string
  colorNames: string[]
  existingColores: ExistingColorRow[]
  coloresConFotos: ColorWithPhotos[]
  fotosProducto: File[]
  uploadImage: (file: File, path: string) => Promise<string>
}): Promise<{ skippedDeletes: string[] }> {
  const {
    productId,
    colorNames,
    existingColores,
    coloresConFotos,
    fotosProducto,
    uploadImage,
  } = params

  const skippedDeletes: string[] = []
  const usedInOrders = await getColorIdsUsedInOrders(existingColores.map((c) => c.id))
  const formNames = new Set(colorNames.map(normalizeColorName))

  const matchedExistingIds = new Set<string>()

  for (let i = 0; i < colorNames.length; i++) {
    const nombre = colorNames[i]
    const key = normalizeColorName(nombre)
    let colorRow = existingColores.find(
      (c) => normalizeColorName(c.nombre) === key && !matchedExistingIds.has(c.id),
    )

    if (colorRow) {
      matchedExistingIds.add(colorRow.id)
      if (colorRow.nombre !== nombre) {
        await adminQuery({
          op: 'update',
          table: 'colores',
          data: { nombre },
          match: { id: colorRow.id },
        })
      }
    } else {
      const inserted = await adminQuery<{ id: string; nombre: string }[]>({
        op: 'insert',
        table: 'colores',
        data: { producto_id: productId, nombre, hex: '#000000' },
        select: 'id, nombre',
      })
      const row = inserted[0]
      if (!row) throw new Error(`Error creando color ${nombre}`)
      colorRow = { id: row.id, nombre: row.nombre, hex: '#000000', fotos_color: [] }
    }

    const fotosColorData: { color_id: string; url: string }[] = []
    const colorConFotos = coloresConFotos.find((c) => c.nombre === nombre)

    if (colorConFotos?.fotos.length) {
      for (let j = 0; j < colorConFotos.fotos.length; j++) {
        const file = colorConFotos.fotos[j]
        const fileName = `${productId}/colores/${nombre.toLowerCase().replace(/[^a-z0-9]/g, '-')}/foto-${Date.now()}-${j + 1}.jpg`
        try {
          const url = await uploadImage(file, fileName)
          fotosColorData.push({ color_id: colorRow.id, url })
        } catch (err) {
          console.error('Error subiendo foto de color:', err)
        }
      }
    }

    const fotosRestantes = fotosProducto.slice(1)
    const fotosPorColor = Math.floor(fotosRestantes.length / colorNames.length)
    const inicioIndex = i * fotosPorColor
    const finIndex = i === colorNames.length - 1 ? fotosRestantes.length : inicioIndex + fotosPorColor

    for (let j = inicioIndex; j < finIndex; j++) {
      const file = fotosRestantes[j]
      const fileName = `${productId}/colores/${nombre.toLowerCase().replace(/[^a-z0-9]/g, '-')}/producto-${Date.now()}-${j + 1}.jpg`
      try {
        const url = await uploadImage(file, fileName)
        fotosColorData.push({ color_id: colorRow.id, url })
      } catch (err) {
        console.error('Error subiendo foto de producto:', err)
      }
    }

    if (fotosColorData.length > 0) {
      await adminQuery({
        op: 'insert',
        table: 'fotos_color',
        data: fotosColorData,
      })
    }
  }

  for (const existing of existingColores) {
    if (formNames.has(normalizeColorName(existing.nombre))) continue

    if (usedInOrders.has(existing.id)) {
      skippedDeletes.push(existing.nombre)
      continue
    }

    await adminQuery({
      op: 'delete',
      table: 'fotos_color',
      match: { color_id: existing.id },
    })
    await adminQuery({
      op: 'delete',
      table: 'colores',
      match: { id: existing.id },
    })
  }

  return { skippedDeletes }
}
