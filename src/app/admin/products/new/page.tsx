
import { ProductForm } from '@/components/admin/product-form';
import { createProduct } from '@/app/actions/product-actions';

// createProduct ahora espera FormData, ProductForm se encarga de esto.
export default function NewProductPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ProductForm 
        onSubmitAction={createProduct} 
        isEditing={false} 
      />
    </div>
  );
}
