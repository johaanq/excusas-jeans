import { ProductList } from '@/components/admin/product-list'
import { AdminGuard } from '@/components/auth/admin-guard'

export default function ProductsPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <ProductList />
        </div>
      </div>
    </AdminGuard>
  )
}
