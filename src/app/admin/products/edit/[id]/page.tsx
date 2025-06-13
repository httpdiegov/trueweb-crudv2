
import { fetchProductById, updateProduct } from '@/app/actions/product-actions';
import { ProductForm } from '@/components/admin/product-form';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
    notFound();
  }

  const product = await fetchProductById(productId);

  if (!product) {
    notFound();
  }

  // updateProduct ahora espera (id: number, formData: FormData)
  // ProductForm se encarga de pasar FormData.
  const handleUpdateProduct = async (formData: FormData) => {
    return updateProduct(productId, formData);
  };


  return (
    <div>
      <ProductForm
        initialData={product}
        onSubmitAction={handleUpdateProduct}
        isEditing={true}
      />
    </div>
  );
}
