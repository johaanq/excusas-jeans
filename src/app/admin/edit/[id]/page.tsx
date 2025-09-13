import { ProductEditForm } from '@/components/admin/product-edit-form'
import { AdminGuard } from '@/components/auth/admin-guard'

interface EditPageProps {
  params: {
    id: string
  }
}

export default function EditProductPage({ params }: EditPageProps) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
            <p className="text-gray-600 mt-2">Modifica la información del producto</p>
          </div>
          
          <ProductEditForm productId={params.id} />
        </div>
      </div>
    </AdminGuard>
  )
}
