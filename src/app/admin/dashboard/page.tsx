import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Tag, List, Plus } from 'lucide-react';
import Link from 'next/link';

type DashboardCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  viewHref: string;
  createHref: string;
};

function DashboardCard({ title, description, icon, viewHref, createHref }: DashboardCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-6 w-6 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
        <div className="flex space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link href={viewHref}>
              <List className="mr-2 h-4 w-4" />
              Ver
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={createHref}>
              <Plus className="mr-2 h-4 w-4" />
              Crear
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona tu catálogo de productos, marcas y categorías
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Productos"
          description="Gestiona los productos de tu tienda"
          icon={<Package className="h-6 w-6" />}
          viewHref="/admin/products"
          createHref="/admin/products/new"
        />
        
        <DashboardCard
          title="Marcas"
          description="Administra las marcas de tus productos"
          icon={<Tag className="h-6 w-6" />}
          viewHref="/admin/brands"
          createHref="/admin/brands/new"
        />
        
        <DashboardCard
          title="Categorías"
          description="Gestiona las categorías de productos"
          icon={<List className="h-6 w-6" />}
          viewHref="/admin/categories"
          createHref="/admin/categories/new"
        />
      </div>
    </div>
  );
}
