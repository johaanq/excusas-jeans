"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function LibroReclamacionesForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<{ numero: string; fecha: string } | null>(null)
  const [esMenor, setEsMenor] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    try {
      const res = await fetch("/api/libro-reclamaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_documento: fd.get("tipo_documento"),
          nombres_apellidos: fd.get("nombres_apellidos"),
          tipo_doc_identidad: fd.get("tipo_doc_identidad"),
          numero_doc_identidad: fd.get("numero_doc_identidad"),
          domicilio: fd.get("domicilio"),
          telefono: fd.get("telefono"),
          email: fd.get("email"),
          es_menor_edad: esMenor,
          nombre_padre_tutor: fd.get("nombre_padre_tutor"),
          bien_contratado: fd.get("bien_contratado"),
          monto_reclamado: fd.get("monto_reclamado")
            ? Number(fd.get("monto_reclamado"))
            : null,
          descripcion: fd.get("descripcion"),
          pedido_consumidor: fd.get("pedido_consumidor"),
          detalle_pedido: fd.get("detalle_pedido"),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo enviar")
      setSuccess({
        numero: data.numero_hoja,
        fecha: new Date(data.fecha_registro).toLocaleString("es-PE"),
      })
      e.currentTarget.reset()
      setEsMenor(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800 mb-2">Hoja registrada</p>
        <p className="text-gray-700 mb-1">
          Número de hoja: <strong>{success.numero}</strong>
        </p>
        <p className="text-sm text-gray-600">Fecha y hora: {success.fecha}</p>
        <p className="text-sm text-gray-600 mt-4">
          Guarda este número. Te responderemos en un plazo máximo de 30 días calendario, según la
          normativa de protección al consumidor.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => setSuccess(null)}
        >
          Registrar otra hoja
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}

      <fieldset className="space-y-3">
        <legend className="font-semibold text-gray-900">1. Tipo de documento</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="tipo_documento" value="reclamo" required />
          <span>Reclamo (disconformidad con el producto o servicio)</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="tipo_documento" value="queja" required />
          <span>Queja (malestar con la atención recibida)</span>
        </label>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="nombres_apellidos">Nombres y apellidos / Razón social</Label>
          <Input id="nombres_apellidos" name="nombres_apellidos" required />
        </div>
        <div>
          <Label htmlFor="tipo_doc_identidad">Tipo de documento</Label>
          <select
            id="tipo_doc_identidad"
            name="tipo_doc_identidad"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="DNI">DNI</option>
            <option value="CE">CE</option>
            <option value="RUC">RUC</option>
          </select>
        </div>
        <div>
          <Label htmlFor="numero_doc_identidad">Número de documento</Label>
          <Input id="numero_doc_identidad" name="numero_doc_identidad" required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="domicilio">Domicilio</Label>
          <Input id="domicilio" name="domicilio" required />
        </div>
        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input id="telefono" name="telefono" type="tel" required />
        </div>
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" required />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={esMenor}
          onChange={(e) => setEsMenor(e.target.checked)}
        />
        Soy menor de edad
      </label>
      {esMenor && (
        <div>
          <Label htmlFor="nombre_padre_tutor">Nombre del padre, madre o tutor</Label>
          <Input id="nombre_padre_tutor" name="nombre_padre_tutor" required={esMenor} />
        </div>
      )}

      <div>
        <Label htmlFor="bien_contratado">Bien contratado (producto o servicio)</Label>
        <Input
          id="bien_contratado"
          name="bien_contratado"
          placeholder="Ej. Jean modelo X, talla 30"
          required
        />
      </div>
      <div>
        <Label htmlFor="monto_reclamado">Monto reclamado (S/) — opcional</Label>
        <Input id="monto_reclamado" name="monto_reclamado" type="number" step="0.01" min="0" />
      </div>
      <div>
        <Label htmlFor="descripcion">Descripción del reclamo o queja</Label>
        <Textarea id="descripcion" name="descripcion" rows={4} required />
      </div>
      <div>
        <Label htmlFor="pedido_consumidor">Pedido del consumidor</Label>
        <Textarea
          id="pedido_consumidor"
          name="pedido_consumidor"
          rows={3}
          placeholder="Qué solución solicitas (cambio, devolución, etc.)"
          required
        />
      </div>
      <div>
        <Label htmlFor="detalle_pedido">Número de pedido web (si aplica)</Label>
        <Input id="detalle_pedido" name="detalle_pedido" placeholder="EJ-20250525-XXXX" />
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Enviar hoja de reclamación
      </Button>
    </form>
  )
}
