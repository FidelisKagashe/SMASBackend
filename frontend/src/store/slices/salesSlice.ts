import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { API_ENDPOINTS } from '../../constants/api';
import { Sale } from '../../types';

interface SalesState {
  sales: Sale[];
  selectedSale: Sale | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: string | null;
  dateFilter: {
    startDate: string | null;
    endDate: string | null;
  };
}

const initialState: SalesState = {
  sales: [],
  selectedSale: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  statusFilter: null,
  dateFilter: {
    startDate: null,
    endDate: null,
  },
};

// Async thunks
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Sale[]>(API_ENDPOINTS.SALES);
      if (response.success && response.data) {
        // Save to offline storage
        await storageService.saveSales(response.data);
        return response.data;
      } else {
        // Try to get from offline storage
        const offlineSales = await storageService.getSales();
        if (offlineSales.length > 0) {
          return offlineSales;
        }
        return rejectWithValue(response.message || 'Failed to fetch sales');
      }
    } catch (error) {
      // Try to get from offline storage
      const offlineSales = await storageService.getSales();
      if (offlineSales.length > 0) {
        return offlineSales;
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch sales');
    }
  }
);

export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Sale>(API_ENDPOINTS.SALE_BY_ID(id));
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch sale');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch sale');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await apiService.post<Sale>(API_ENDPOINTS.CREATE_SALE, saleData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to create sale');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create sale');
    }
  }
);

export const updateSale = createAsyncThunk(
  'sales/updateSale',
  async ({ id, data }: { id: string; data: Partial<Sale> }, { rejectWithValue }) => {
    try {
      const response = await apiService.put<Sale>(API_ENDPOINTS.UPDATE_SALE(id), data);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to update sale');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update sale');
    }
  }
);

export const deleteSale = createAsyncThunk(
  'sales/deleteSale',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(API_ENDPOINTS.SALE_BY_ID(id));
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message || 'Failed to delete sale');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete sale');
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSelectedSale: (state, action: PayloadAction<Sale | null>) => {
      state.selectedSale = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string | null>) => {
      state.statusFilter = action.payload;
    },
    setDateFilter: (state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) => {
      state.dateFilter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.statusFilter = null;
      state.dateFilter = {
        startDate: null,
        endDate: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = action.payload;
        state.error = null;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch sale by ID
      .addCase(fetchSaleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSale = action.payload;
        state.error = null;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create sale
      .addCase(createSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales.unshift(action.payload); // Add to beginning for recent sales
        state.error = null;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update sale
      .addCase(updateSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.sales.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        if (state.selectedSale?.id === action.payload.id) {
          state.selectedSale = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete sale
      .addCase(deleteSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = state.sales.filter(s => s.id !== action.payload);
        if (state.selectedSale?.id === action.payload) {
          state.selectedSale = null;
        }
        state.error = null;
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedSale,
  setSearchQuery,
  setStatusFilter,
  setDateFilter,
  clearError,
  clearFilters,
} = salesSlice.actions;

export default salesSlice.reducer;