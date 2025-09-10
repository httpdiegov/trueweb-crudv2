
import { ProductForm } from '@/components/admin/product-form';
import { createProduct } from '@/app/actions/product-actions';

// createProduct ahora espera FormData, ProductForm se encarga de esto.
export default function NewProductPage() {
  return (
    <div>
      <ProductForm 
        onSubmitAction={createProduct} 
        isEditing={false} 
      />
    </div>
  );
}
