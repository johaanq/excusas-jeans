import { ProductEditForm } from "@/components/admin/product-edit-form"

interface EditPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditPageProps) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-4xl">
      <ProductEditForm productId={id} />
    </div>
  )
}
