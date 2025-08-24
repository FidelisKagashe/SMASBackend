import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { API_ENDPOINTS } from '../../constants/api';
import { Product } from '../../types';

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'name' | 'price' | 'stock' | 'date';
  sortOrder: 'asc' | 'desc';
}

const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  sortBy: 'name',
  sortOrder: 'asc',
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Product[]>(API_ENDPOINTS.PRODUCTS);
      if (response.success && response.data) {
        // Save to offline storage
        await storageService.saveProducts(response.data);
        return response.data;
      } else {
        // Try to get from offline storage
        const offlineProducts = await storageService.getProducts();
        if (offlineProducts.length > 0) {
          return offlineProducts;
        }
        return rejectWithValue(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      // Try to get from offline storage
      const offlineProducts = await storageService.getProducts();
      if (offlineProducts.length > 0) {
        return offlineProducts;
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id));
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch product');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await apiService.post<Product>(API_ENDPOINTS.PRODUCTS, productData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to create product');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue }) => {
    try {
      const response = await apiService.put<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id), data);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to update product');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message || 'Failed to delete product');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete product');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Product[]>(`${API_ENDPOINTS.PRODUCT_SEARCH}?q=${encodeURIComponent(query)}`);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to search products');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search products');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'name' | 'price' | 'stock' | 'date'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProductStock: (state, action: PayloadAction<{ id: string; stock: number }>) => {
      const product = state.products.find(p => p.id === action.payload.id);
      if (product) {
        product.stock = action.payload.stock;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.push(action.payload);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedProduct,
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setSortOrder,
  clearError,
  updateProductStock,
} = productsSlice.actions;

export default productsSlice.reducer;