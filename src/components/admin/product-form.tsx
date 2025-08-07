
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Prenda, Categoria, Talla, Imagen, Marca } from '@/types';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, ImagePlus, ArrowUp, ArrowDown, X, Film } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAvailableBrands, fetchAvailableCategories, fetchAvailableSizes, generateNextSku } from '@/app/actions/product-actions';
import NextImage from 'next/image';

const productFormSchemaClient = z.object({
  nombre_prenda: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  sku: z.string().min(1, { message: 'SKU es requerido.' }),
  precio: z.coerce.number().positive({ message: 'El precio debe ser un número positivo.' }),
  stock: z.coerce.number().int().min(0, { message: 'El stock no puede ser negativo.' }),
  estado: z.coerce.number().int().min(0).max(1),
  categoria_id: z.coerce.number().int().positive({ message: 'Debe seleccionar una categoría.' }),
  talla_id: z.coerce.number().int().positive({ message: 'Debe seleccionar una talla.' }),
  caracteristicas: z.string().min(5, { message: 'Características son requeridas (mínimo 5 caracteres).' }).optional().nullable(),
  medidas: z.string().min(1, {message: 'Medidas son requeridas (mínimo 1 caracter)'}).optional().nullable(),
  desc_completa: z.string().min(10, { message: 'Descripción completa es requerida (mínimo 10 caracteres).' }),
  drop_name: z.string().optional().nullable(),
  marca_id: z.coerce.number().int().positive({ message: 'Debe seleccionar una marca.' }).optional().nullable(),
});

type ProductFormValues = z.infer<typeof productFormSchemaClient>;

interface ImageFileWithPreview {
  file: File;
  preview: string;
}

interface ProductFormProps {
  initialData?: Prenda | null;
  onSubmitAction: (data: FormData) => Promise<{ success: boolean; message: string }>;
  isEditing: boolean;
}

const MAX_BW_IMAGES = 2; // Límite para imágenes BW

export function ProductForm({ initialData, onSubmitAction, isEditing }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colorImageFilesInputRef = useRef<HTMLInputElement>(null);
  const bwImageFilesInputRef = useRef<HTMLInputElement>(null);
  
  // State for dropdown data
  const [availableCategories, setAvailableCategories] = useState<Categoria[]>([]);
  const [availableSizes, setAvailableSizes] = useState<Talla[]>([]);
  const [availableBrands, setAvailableBrands] = useState<Marca[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState<boolean>(true);
  
  // State for images
  const [currentImages, setCurrentImages] = useState<Imagen[]>([]);
  const [currentBwImages, setCurrentBwImages] = useState<Imagen[]>([]);
  const [newColorImageFiles, setNewColorImageFiles] = useState<ImageFileWithPreview[]>([]);
  const [newBwImageFiles, setNewBwImageFiles] = useState<ImageFileWithPreview[]>([]);
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);

  useEffect(() => {
    async function loadDropdownData() {
      setIsLoadingDropdowns(true);
      try {
        const [categories, sizes, brands] = await Promise.all([
          fetchAvailableCategories(),
          fetchAvailableSizes(),
          fetchAvailableBrands()
        ]);
        setAvailableCategories(categories);
        setAvailableSizes(sizes.sort((a,b) => a.orden_talla - b.orden_talla));
        setAvailableBrands(brands);
      } catch (error) {
        console.error("Failed to load categories/sizes from DB:", error);
        toast({ title: 'Error', description: 'No se pudieron cargar categorías o tallas.', variant: 'destructive'});
      } finally {
        setIsLoadingDropdowns(false);
      }
    }
    loadDropdownData();
  }, [toast]);

  const defaultValues: ProductFormValues = initialData
    ? {
        nombre_prenda: initialData.nombre_prenda || '',
        sku: initialData.sku || '',
        precio: initialData.precio || 0,
        stock: initialData.stock || 0,
        estado: initialData.estado ?? 1,
        categoria_id: initialData.categoria_id || 0,
        talla_id: initialData.talla_id || 0,
        caracteristicas: initialData.caracteristicas || '',
        medidas: initialData.medidas || '',
        desc_completa: initialData.desc_completa || '',
        drop_name: initialData.drop_name || '',
      }
    : {
        nombre_prenda: '',
        sku: '',
        precio: 0,
        stock: 0,
        estado: 1,
        categoria_id: 0,
        talla_id: 0,
        caracteristicas: '',
        medidas: '',
        desc_completa: '',
        drop_name: '',
      };

  // Initialize form with react-hook-form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchemaClient),
    defaultValues: {
      nombre_prenda: initialData?.nombre_prenda || '',
      sku: initialData?.sku || '',
      precio: initialData?.precio || 0,
      stock: initialData?.stock || 0,
      estado: initialData?.estado ?? 1,
      categoria_id: initialData?.categoria_id || 0,
      talla_id: initialData?.talla_id || 0,
      caracteristicas: initialData?.caracteristicas || '',
      medidas: initialData?.medidas || '',
      desc_completa: initialData?.desc_completa || '',
      drop_name: initialData?.drop_name || '',
      marca_id: initialData?.marca_id || null,
    },
    mode: "onChange",
  });
  
  // Get form state
  const { isDirty } = form.formState;

  // useEffect para generar SKU automáticamente cuando cambie la categoría
  useEffect(() => {
    const generateSku = async () => {
      const categoriaId = form.watch('categoria_id');
      
      // Solo generar SKU si:
      // 1. No estamos editando (isEditing = false)
      // 2. Se ha seleccionado una categoría válida
      // 3. No estamos ya generando un SKU
      if (!isEditing && categoriaId && categoriaId > 0 && !isGeneratingSku) {
        try {
          setIsGeneratingSku(true);
          const newSku = await generateNextSku(categoriaId);
          form.setValue('sku', newSku);
        } catch (error) {
          console.error('Error generando SKU:', error);
          toast({
            title: 'Error',
            description: 'No se pudo generar el SKU automáticamente.',
            variant: 'destructive'
          });
        } finally {
          setIsGeneratingSku(false);
        }
      }
    };

    generateSku();
  }, [form.watch('categoria_id'), isEditing, isGeneratingSku, form, toast]);

  // Initialize form and images when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      // Reset form with initial data
      form.reset({
        nombre_prenda: initialData.nombre_prenda || '',
        sku: initialData.sku || '',
        precio: initialData.precio || 0,
        stock: initialData.stock || 0,
        estado: initialData.estado ?? 1,
        categoria_id: initialData.categoria_id || 0,
        talla_id: initialData.talla_id || 0,
        caracteristicas: initialData.caracteristicas || '',
        medidas: initialData.medidas || '',
        desc_completa: initialData.desc_completa || '',
        drop_name: initialData.drop_name || '',
        marca_id: initialData.marca_id || null,
      });
      
      // Set current images from initial data
      setCurrentImages(initialData.imagenes || []);
      setCurrentBwImages(initialData.imagenes_bw || []);
      
      // Clear any new files that might have been added
      setNewColorImageFiles([]);
      setNewBwImageFiles([]);
    }
  }, [form, initialData]); // Only run when these dependencies change

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty || newColorImageFiles.length > 0 || newBwImageFiles.length > 0) {
        event.preventDefault(); // Standard for most browsers
        event.returnValue = ''; // Required for some browsers
        return ''; // For older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [form.formState.isDirty, newColorImageFiles.length, newBwImageFiles.length]);

  // Manejo de imágenes a COLOR (ilimitadas)
  const handleColorFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesToAdd = Array.from(files).map(file => ({ file, preview: URL.createObjectURL(file) }));
      setNewColorImageFiles(prev => [...prev, ...filesToAdd]);
    }
    if (colorImageFilesInputRef.current) {
        colorImageFilesInputRef.current.value = "";
    }
  };

  const removeNewColorImage = (indexToRemove: number) => {
    setNewColorImageFiles(prev => {
      const imageToRemove = prev[indexToRemove];
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };
  
  const moveColorImage = (index: number, direction: 'up' | 'down') => {
    setNewColorImageFiles(prev => {
      const newArr = [...prev];
      const item = newArr[index];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= newArr.length) return prev;
      newArr[index] = newArr[swapIndex];
      newArr[swapIndex] = item;
      return newArr;
    });
  };

  // Manejo de imágenes BW (máximo MAX_BW_IMAGES)
  const handleBwFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesToAdd = Array.from(files);
      setNewBwImageFiles(prev => {
        const combined = [...prev, ...filesToAdd.map(file => ({ file, preview: URL.createObjectURL(file) }))];
        const toKeep = combined.slice(0, MAX_BW_IMAGES);
        const toRevoke = combined.slice(MAX_BW_IMAGES);
        toRevoke.forEach(fp => URL.revokeObjectURL(fp.preview));
        return toKeep;
      });
    }
    if (bwImageFilesInputRef.current) {
        bwImageFilesInputRef.current.value = "";
    }
  };

  const removeNewBwImage = (indexToRemove: number) => {
    setNewBwImageFiles(prev => {
      const imageToRemove = prev[indexToRemove];
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const moveBwImage = (index: number, direction: 'up' | 'down') => {
    setNewBwImageFiles(prev => {
      const newArr = [...prev];
      const item = newArr[index];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= newArr.length) return prev; // Check bounds
      newArr[index] = newArr[swapIndex];
      newArr[swapIndex] = item;
      return newArr;
    });
  };


  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();

    (Object.keys(data) as Array<keyof ProductFormValues>).forEach(key => {
        const value = data[key];
         if (value !== null && value !== undefined) {
             if ((key === 'drop_name' || key === 'caracteristicas' || key === 'medidas') && (value === '' || value === null)) {
                // Do not append if optional and empty string, let backend handle as null
             } else {
                formData.append(key, String(value));
             }
        }
    });

    // Marca ID
    if (data.marca_id !== null && data.marca_id !== undefined) {
       formData.append('marca_id', String(data.marca_id));
    }
    
    // Imágenes a color
    newColorImageFiles.forEach((imageFileWithPreview, index) => {
      formData.append('imageFilesColor', imageFileWithPreview.file); // Renombrado para diferenciar
      formData.append('imageIndexesColor', index.toString()); 
    });
    
    if (isEditing && newColorImageFiles.length > 0) {
        formData.append('replaceExistingColorImages', 'true');
    } else if (isEditing && newColorImageFiles.length === 0) {
        formData.append('replaceExistingColorImages', 'false');
    }

    // Imágenes BW
    newBwImageFiles.forEach((imageFileWithPreview, index) => {
      formData.append('imageFilesBw', imageFileWithPreview.file); // Nuevo nombre para BW
      formData.append('imageIndexesBw', index.toString());
    });
     if (isEditing && newBwImageFiles.length > 0) {
        formData.append('replaceExistingBwImages', 'true');
    } else if (isEditing && newBwImageFiles.length === 0) {
        formData.append('replaceExistingBwImages', 'false');
    }


    const result = await onSubmitAction(formData);
    setIsSubmitting(false);

    if (result.success) {
      newColorImageFiles.forEach(ip => URL.revokeObjectURL(ip.preview));
      setNewColorImageFiles([]);
      newBwImageFiles.forEach(ip => URL.revokeObjectURL(ip.preview));
      setNewBwImageFiles([]);
      form.reset(data); // Reset form with current data to clear dirty state
      
      toast({
        title: isEditing ? 'Producto Actualizado' : 'Producto Creado',
        description: result.message,
      });
      router.push('/admin');
      router.refresh(); 
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  }
  
  const canUploadMoreBwImages = newBwImageFiles.length < MAX_BW_IMAGES;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nombre_prenda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Prenda</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Vestido Floral Elegante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      SKU
                      {!isEditing && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-normal">
                          Auto-generado
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder={isGeneratingSku ? "Generando SKU..." : "Ej: TSB001"} 
                          {...field} 
                          readOnly={!isEditing}
                          disabled={isGeneratingSku}
                          className={!isEditing ? "bg-blue-50 border-blue-200 text-blue-900 font-medium cursor-not-allowed" : ""}
                        />
                        {!isEditing && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {!isEditing && (
                      <p className="text-xs text-blue-600 mt-1">
                        El SKU se genera automáticamente basado en la categoría seleccionada
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="precio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ej: 79.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Visible</SelectItem>
                        <SelectItem value="0">Oculto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="categoria_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value,10))} 
                      defaultValue={field.value ? field.value.toString() : ""}
                      disabled={isLoadingDropdowns}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingDropdowns ? "Cargando categorías..." : "Selecciona una categoría"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingDropdowns ? (
                          <SelectItem value="loading" disabled>Cargando...</SelectItem>
                        ) : (
                          availableCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nom_categoria}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="talla_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Talla</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value,10))} 
                      defaultValue={field.value ? field.value.toString() : ""}
                      disabled={isLoadingDropdowns}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingDropdowns ? "Cargando tallas..." : "Selecciona una talla"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingDropdowns ? (
                           <SelectItem value="loading" disabled>Cargando...</SelectItem>
                         ) : (
                          availableSizes.map(talla => (
                            <SelectItem key={talla.id} value={talla.id.toString()}>{talla.nom_talla}</SelectItem>
                          ))
                         )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marca_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value,10))}
                      defaultValue={field.value ? field.value.toString() : ""}
                      disabled={isLoadingDropdowns}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingDropdowns ? "Cargando marcas..." : "Selecciona una marca"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingDropdowns ? (
                           <SelectItem value="loading" disabled>Cargando...</SelectItem>
                         ) : (
                          availableBrands.map(marca => (
                            <SelectItem key={marca.id} value={marca.id.toString()}>{marca.nombre_marca}</SelectItem>
                          ))
                         )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="drop_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Drop (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Colección Verano 2024" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="caracteristicas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Características (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ej: Tela ligera, estampado floral, corte A." 
                        className="min-h-[120px]"
                        {...field} 
                        value={field.value ?? ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="bg-muted/50 p-4 rounded-md border border-border">
                <h4 className="text-sm font-medium mb-2">Ejemplo de formato:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Bolsillos con cierre</p>
                  <p>• Umbro logos bordados</p>
                  <p>• Corte regular fit</p>
                  <p>• Cuello redondo</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="medidas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medidas (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ej: Largo: 90cm, Busto: 85cm (Talla M)" 
                        className="min-h-[120px]"
                        {...field} 
                        value={field.value ?? ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="bg-muted/50 p-4 rounded-md border border-border">
                <h4 className="text-sm font-medium mb-2">Ejemplo de formato:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Ancho (Axila): 51 cm</p>
                  <p>• Ancho de manga: 18 cm</p>
                  <p>• Largo de manga: 73 cm</p>
                  <p>• Largo: 64 cm</p>
                  <p>• Cintura: 38 hasta 58 cm</p>
                  <p>• Tiro: 38 cm</p>
                  <p>• Muslo: 40 cm</p>
                  <p>• Largo: 107 cm</p>
                  <p>• Basta: 23 cm</p>
                </div>
              </div>
            </div>
            <FormField
              control={form.control}
              name="desc_completa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción Completa</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Describe el producto en detalle..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Imágenes a Color */}
            <FormItem>
              <FormLabel>{isEditing && currentImages.length > 0 ? 'Imágenes a Color Actuales (se reemplazarán si subes nuevas)' : 'Subir Imágenes a Color'}</FormLabel>
              {isEditing && currentImages.length > 0 && newColorImageFiles.length === 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {currentImages.map(img => (
                      <div key={img.id} className="relative aspect-square border rounded-md overflow-hidden">
                        <NextImage src={img.url} alt={`Imagen actual ${img.id}`} fill objectFit="cover" />
                      </div>
                    ))}
                  </div>
                   <p className="text-xs text-muted-foreground pt-1">
                    Para reemplazar estas imágenes, selecciona nuevos archivos abajo. Si no subes archivos nuevos, estas imágenes se conservarán.
                  </p>
                </div>
              )}
               <FormControl>
                <div className='flex items-center gap-2 p-3 border-2 border-dashed rounded-md hover:border-primary transition-colors'>
                  <ImagePlus className='w-8 h-8 text-muted-foreground' />
                  <Input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    ref={colorImageFilesInputRef}
                    onChange={handleColorFileChange}
                    className='block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20'
                  />
                </div>
              </FormControl>
              <FormMessage />
              {newColorImageFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Previsualización y Orden de Nuevas Imágenes a Color (Total: {newColorImageFiles.length}):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {newColorImageFiles.map((image, index) => (
                      <div key={image.preview} className="relative group aspect-square border rounded-md overflow-hidden p-1 bg-muted/20">
                        <NextImage src={image.preview} alt={`Preview ${index + 1}`} fill objectFit="contain" />
                        <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button type="button" size="icon" variant="destructive" className="h-6 w-6" onClick={() => removeNewColorImage(index)}>
                             <X className="h-4 w-4" />
                           </Button>
                           <Button type="button" size="icon" variant="secondary" className="h-6 w-6" onClick={() => moveColorImage(index, 'up')} disabled={index === 0}>
                             <ArrowUp className="h-4 w-4" />
                           </Button>
                           <Button type="button" size="icon" variant="secondary" className="h-6 w-6" onClick={() => moveColorImage(index, 'down')} disabled={index === newColorImageFiles.length - 1}>
                             <ArrowDown className="h-4 w-4" />
                           </Button>
                        </div>
                         <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded-sm">
                           img{(index + 1).toString().padStart(2, '0')}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                {isEditing ? `Si subes ${newColorImageFiles.length > 0 ? newColorImageFiles.length : 'nuevos'} archivos de color, estos reemplazarán todas las imágenes de color actuales del producto.` : `Puedes seleccionar múltiples archivos.`}
                El orden de las previsualizaciones determinará el sufijo numérico (img01, img02, ...).
              </p>
            </FormItem>

            {/* Imágenes Blanco y Negro */}
            <FormItem>
              <FormLabel>{isEditing && currentBwImages.length > 0 ? `Imágenes B&N Actuales (Máx. ${MAX_BW_IMAGES} - se reemplazarán si subes nuevas)` : `Subir Imágenes B&N (Máx. ${MAX_BW_IMAGES})`}</FormLabel>
              {isEditing && currentBwImages.length > 0 && newBwImageFiles.length === 0 && (
                <div className="mb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {currentBwImages.map(img => (
                            <div key={img.id} className="relative aspect-[3/4] border rounded-md overflow-hidden">
                                <NextImage src={img.url} alt={`Imagen B&N actual ${img.id}`} fill objectFit="cover" />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                        Para reemplazar estas imágenes B&N, selecciona nuevos archivos abajo.
                    </p>
                </div>
              )}
               <FormControl>
                <div className={`flex items-center gap-2 p-3 border-2 border-dashed rounded-md transition-colors ${canUploadMoreBwImages ? 'hover:border-primary' : 'border-muted bg-muted/50 cursor-not-allowed'}`}>
                  <Film className={`w-8 h-8 ${canUploadMoreBwImages ? 'text-muted-foreground' : 'text-muted-foreground/50'}`} />
                  <Input 
                    type="file" 
                    multiple
                    accept="image/*"
                    ref={bwImageFilesInputRef}
                    onChange={handleBwFileChange}
                    className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${canUploadMoreBwImages ? 'text-slate-500 file:bg-primary/10 file:text-primary hover:file:bg-primary/20' : 'text-muted-foreground file:bg-muted file:text-muted-foreground cursor-not-allowed'}`}
                    disabled={!canUploadMoreBwImages}
                  />
                </div>
              </FormControl>
              <FormMessage />
              {newBwImageFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Previsualización y Orden de Nuevas Imágenes B&N (Total: {newBwImageFiles.length} de {MAX_BW_IMAGES}):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {newBwImageFiles.map((image, index) => (
                      <div key={image.preview} className="relative group aspect-[3/4] border rounded-md overflow-hidden p-1 bg-muted/20">
                        <NextImage src={image.preview} alt={`Preview B&N ${index + 1}`} fill objectFit="contain" />
                        <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button type="button" size="icon" variant="destructive" className="h-6 w-6" onClick={() => removeNewBwImage(index)}>
                             <X className="h-4 w-4" />
                           </Button>
                           <Button type="button" size="icon" variant="secondary" className="h-6 w-6" onClick={() => moveBwImage(index, 'up')} disabled={index === 0}>
                             <ArrowUp className="h-4 w-4" />
                           </Button>
                           <Button type="button" size="icon" variant="secondary" className="h-6 w-6" onClick={() => moveBwImage(index, 'down')} disabled={index === newBwImageFiles.length - 1}>
                             <ArrowDown className="h-4 w-4" />
                           </Button>
                        </div>
                         <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded-sm">
                           bw{(index + 1).toString().padStart(2, '0')}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                {isEditing ? `Si subes ${newBwImageFiles.length > 0 ? newBwImageFiles.length : 'nuevos'} archivos B&N (máx. ${MAX_BW_IMAGES}), estos reemplazarán todas las imágenes B&N actuales.` : `Puedes seleccionar hasta ${MAX_BW_IMAGES} archivos B&N.`}
                El orden de las previsualizaciones determinará el sufijo numérico (bw01, bw02).
              </p>
            </FormItem>

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingDropdowns}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
    

    

