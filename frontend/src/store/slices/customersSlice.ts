import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { API_ENDPOINTS } from '../../constants/api';
import { Customer } from '../../types';

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  typeFilter: string | null;
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  typeFilter: null,
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Customer[]>(API_ENDPOINTS.CUSTOMERS);
      if (response.success && response.data) {
        // Save to offline storage
        await storageService.saveCustomers(response.data);
        return response.data;
      } else {
        // Try to get from offline storage
        const offlineCustomers = await storageService.getCustomers();
        if (offlineCustomers.length > 0) {
          return offlineCustomers;
        }
        return rejectWithValue(response.message || 'Failed to fetch customers');
      }
    } catch (error) {
      // Try to get from offline storage
      const offlineCustomers = await storageService.getCustomers();
      if (offlineCustomers.length > 0) {
        return offlineCustomers;
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Customer>(API_ENDPOINTS.CUSTOMER_BY_ID(id));
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch customer');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await apiService.post<Customer>(API_ENDPOINTS.CREATE_CUSTOMER, customerData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to create customer');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
    try {
      const response = await apiService.put<Customer>(API_ENDPOINTS.UPDATE_CUSTOMER(id), data);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to update customer');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(API_ENDPOINTS.CUSTOMER_BY_ID(id));
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message || 'Failed to delete customer');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete customer');
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setTypeFilter: (state, action: PayloadAction<string | null>) => {
      state.typeFilter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.typeFilter = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCustomer = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers.push(action.payload);
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = state.customers.filter(c => c.id !== action.payload);
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null;
        }
        state.error = null;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedCustomer,
  setSearchQuery,
  setTypeFilter,
  clearError,
  clearFilters,
} = customersSlice.actions;

export default customersSlice.reducer;