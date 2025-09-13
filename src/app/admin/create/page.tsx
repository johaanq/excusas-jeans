import { ProductForm } from '@/components/admin/product-form'
import { AdminGuard } from '@/components/auth/admin-guard'

export default function CreateProductPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Producto</h1>
            <p className="text-gray-600 mt-2">Agrega un nuevo producto a tu catálogo</p>
          </div>
          
          <ProductForm />
        </div>
      </div>
    </AdminGuard>
  )
}
