import { supabase } from './supabase';

export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    category_id: string;
    unit: string;
    reorder_point: number;
    created_at: string;
    updated_at?: string;
    categories?: {
        id: string;
        name: string;
    };
    total_inventory?: number;
    available_inventory?: number;
}

export interface CreateProductData {
    sku: string;
    name: string;
    description?: string;
    category_id: string;
    unit: string;
    reorder_point: number;
}

/**
 * Get all products with optional inventory information
 */
export async function getAllProducts(includeInventory = false) {
    let query = supabase
        .from('products')
        .select(`
      *,
      categories (id, name)
    `)
        .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    if (includeInventory && data) {
        // Fetch inventory for each product
        const productsWithInventory = await Promise.all(
            data.map(async (product) => {
                const { data: inventoryData } = await supabase
                    .from('inventory')
                    .select('quantity, available_quantity')
                    .eq('product_id', product.id);

                const totalInventory = inventoryData?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
                const availableInventory = inventoryData?.reduce((sum, inv) => sum + inv.available_quantity, 0) || 0;

                return {
                    ...product,
                    total_inventory: totalInventory,
                    available_inventory: availableInventory,
                };
            })
        );

        return productsWithInventory as Product[];
    }

    return data as Product[];
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId: string) {
    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      categories (id, name)
    `)
        .eq('id', productId)
        .single();

    if (error) throw error;
    return data as Product;
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string) {
    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      categories (id, name)
    `)
        .eq('category_id', categoryId)
        .order('name');

    if (error) throw error;
    return data as Product[];
}

/**
 * Search products by name or SKU
 */
export async function searchProducts(searchTerm: string) {
    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      categories (id, name)
    `)
        .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('name');

    if (error) throw error;
    return data as Product[];
}

/**
 * Create a new product
 */
export async function createProduct(productData: CreateProductData) {
    const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select(`
      *,
      categories (id, name)
    `)
        .single();

    if (error) throw error;
    return data as Product;
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, updates: Partial<CreateProductData>) {
    const { data, error } = await supabase
        .from('products')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select(`
      *,
      categories (id, name)
    `)
        .single();

    if (error) throw error;
    return data as Product;
}

/**
 * Delete a product (soft delete or hard delete based on business rules)
 */
export async function deleteProduct(productId: string) {
    // Check if product has inventory
    const { data: inventoryData } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', productId);

    const hasInventory = inventoryData && inventoryData.some(inv => inv.quantity > 0);

    if (hasInventory) {
        throw new Error('Cannot delete product with existing inventory. Please adjust inventory to zero first.');
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) throw error;
    return true;
}

/**
 * Get products with low stock (quantity below reorder point)
 */
export async function getLowStockProducts() {
    const products = await getAllProducts(true);

    return products.filter(
        product =>
            product.total_inventory !== undefined &&
            product.total_inventory < product.reorder_point
    );
}

/**
 * Get all product categories
 */
export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
}

/**
 * Create a new category
 */
export async function createCategory(name: string, description?: string, parentId?: string) {
    const { data, error } = await supabase
        .from('categories')
        .insert({
            name,
            description,
            parent_id: parentId,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
