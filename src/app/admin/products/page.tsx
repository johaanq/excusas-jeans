import { Suspense } from "react"
import { ProductList } from "@/components/admin/product-list"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductList />
    </Suspense>
  )
}
