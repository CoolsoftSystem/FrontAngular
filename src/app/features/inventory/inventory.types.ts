export interface Product
{
  id: string;               // Identificador único del producto
  code: string;             // Código interno/sku del producto para referencia rápida
  name: string;             // Nombre comercial del producto
  category?: string;        // Categoría principal del producto
  location: string;         // Ubicación del producto en el Almacén
  description?: string;     // Descripción detallada del producto
  tags?: string[];          // Etiquetas para búsqueda y filtrado
  barcode?: string | null;  // Código de barras (EAN/UPC) para escaneo
  brand?: string | null;    // Marca o fabricante del producto
  quantity: number;         // Cantidad disponible en inventario
  status: number;           // Estado del inventario (1=En stock, 2=Agotado, 3=Bajo stock)
  cost: number;             // Costo de adquisición (para cálculo de margen)
  basePrice: number;        // Precio base antes de impuestos
  taxPercent: number;       // Porcentaje de impuesto aplicable
  price: number;            // Precio final al público (basePrice + impuestos)
  thumbnail: string;        // Ruta/URL de imagen miniatura
  image: string;            // Ruta/URL de imagen detallada
  active: boolean;          // Si el producto está disponible
}


// Categorías
export interface ProductCategory
{
  id?: string;
  value?: string;
}

// Marcas
export interface ProductBrand
{
  id?: string;
  value?: string;
}


// Estado de Stock
export interface ProductStatus
{
  id?: string;
  value?: string;
}


export interface ProductTag
{
  id?: string;
  title?: string;
}