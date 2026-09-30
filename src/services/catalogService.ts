import { ProductItem, CatalogFilterTab, ProductCategory } from '../types';
import { mockProducts } from '../data/mockData';

class CatalogService {
  private products: ProductItem[] = [...mockProducts];
  private listeners: Array<() => void> = [];

  public getProducts(filter: CatalogFilterTab = 'All', category?: ProductCategory): ProductItem[] {
    let list = [...this.products];

    if (category) {
      list = list.filter(p => p.category === category);
    }

    switch (filter) {
      case 'Available':
        return list.filter(p => p.isAvailable);
      case 'Unavailable':
        return list.filter(p => !p.isAvailable);
      case 'Needs Attention':
        return list.filter(p => p.reviewStatus === 'Needs Changes');
      case 'Pending Review':
        return list.filter(p => p.reviewStatus === 'Pending Review');
      case 'All':
      default:
        return list;
    }
  }

  public getProductById(id: string): ProductItem | undefined {
    return this.products.find(p => p.id === id);
  }

  public searchProducts(query: string, filter: CatalogFilterTab = 'All', category?: ProductCategory): ProductItem[] {
    const q = query.trim().toLowerCase();
    let list = this.getProducts(filter, category);
    if (!q) return list;
    return list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  public toggleAvailability(productId: string): boolean {
    const product = this.products.find(p => p.id === productId);
    if (!product) return false;
    product.isAvailable = !product.isAvailable;
    this.notify();
    return true;
  }

  public saveProduct(productData: Omit<ProductItem, 'id'> & { id?: string }): { success: boolean; error?: string; product?: ProductItem } {
    // Strict business rule: sellingPrice <= mrp
    if (productData.sellingPrice > productData.mrp) {
      return {
        success: false,
        error: `Selling Price (₹${productData.sellingPrice}) cannot be greater than MRP (₹${productData.mrp}).`,
      };
    }

    if (productData.id) {
      // Update existing
      const index = this.products.findIndex(p => p.id === productData.id);
      if (index === -1) {
        return { success: false, error: 'Product not found.' };
      }
      const existing = this.products[index];
      const updated: ProductItem = {
        ...existing,
        ...productData,
        id: existing.id,
      };
      this.products[index] = updated;
      this.notify();
      return { success: true, product: updated };
    } else {
      // Create new custom product
      const newProduct: ProductItem = {
        ...productData,
        id: `prod-custom-${Date.now()}`,
        sku: `SKU-LOCAL-${Math.floor(1000 + Math.random() * 9000)}`,
        isMasterCatalog: false,
        reviewStatus: 'Pending Review', // default to Pending Review for custom additions
      };
      this.products.unshift(newProduct);
      this.notify();
      return { success: true, product: newProduct };
    }
  }

  public deleteProduct(productId: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter(p => p.id !== productId);
    if (this.products.length !== initialLen) {
      this.notify();
      return true;
    }
    return false;
  }

  public bulkSetAvailability(productIds: string[], isAvailable: boolean): void {
    this.products = this.products.map(p => 
      productIds.includes(p.id) ? { ...p, isAvailable } : p
    );
    this.notify();
  }

  public bulkAdjustPrices(percentageChange: number): { updatedCount: number } {
    let count = 0;
    this.products = this.products.map(p => {
      const adjustment = Math.round((p.sellingPrice * percentageChange) / 100);
      const newPrice = Math.max(1, p.sellingPrice + adjustment);
      // Ensure sellingPrice <= mrp invariant
      const safePrice = Math.min(newPrice, p.mrp);
      if (safePrice !== p.sellingPrice) {
        count++;
        return { ...p, sellingPrice: safePrice };
      }
      return p;
    });
    this.notify();
    return { updatedCount: count };
  }
}

export const catalogService = new CatalogService();
