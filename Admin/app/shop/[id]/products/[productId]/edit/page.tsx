import ProductForm from "@/components/product-form"

export default function EditProductPage({ params }: { params: { productId: string } }) {
  return <ProductForm productId={params.productId} />
} 