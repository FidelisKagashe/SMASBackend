import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { SyncStatus } from '../../types';

interface SyncState extends SyncStatus {
  error: string | null;
}

const initialState: SyncState = {
  lastSync: null,
  pendingChanges: 0,
  isOnline: true,
  isSyncing: false,
  error: null,
};

// Async thunks
export const syncData = createAsyncThunk(
  'sync/syncData',
  async (_, { rejectWithValue }) => {
    try {
      // Check if online
      const isOnline = apiService.getNetworkStatus();
      if (!isOnline) {
        return rejectWithValue('Device is offline');
      }

      // Sync queued requests
      await apiService.syncQueuedRequests();

      // Get updated sync status
      const syncStatus = await storageService.getSyncStatus();
      
      return {
        lastSync: new Date().toISOString(),
        pendingChanges: syncStatus.pendingChanges,
        isOnline: true,
        isSyncing: false,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sync failed');
    }
  }
);

export const getSyncStatus = createAsyncThunk(
  'sync/getSyncStatus',
  async (_, { rejectWithValue }) => {
    try {
      const syncStatus = await storageService.getSyncStatus();
      const isOnline = apiService.getNetworkStatus();
      
      return {
        ...syncStatus,
        isOnline,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get sync status');
    }
  }
);

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setSyncingStatus: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    incrementPendingChanges: (state) => {
      state.pendingChanges += 1;
    },
    decrementPendingChanges: (state) => {
      if (state.pendingChanges > 0) {
        state.pendingChanges -= 1;
      }
    },
    setPendingChanges: (state, action: PayloadAction<number>) => {
      state.pendingChanges = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLastSync: (state, action: PayloadAction<string>) => {
      state.lastSync = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sync data
      .addCase(syncData.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncData.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.lastSync = action.payload.lastSync;
        state.pendingChanges = action.payload.pendingChanges;
        state.isOnline = action.payload.isOnline;
        state.error = null;
      })
      .addCase(syncData.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      })
      
      // Get sync status
      .addCase(getSyncStatus.pending, (state) => {
        // Don't set loading state for status checks
      })
      .addCase(getSyncStatus.fulfilled, (state, action) => {
        state.lastSync = action.payload.lastSync;
        state.pendingChanges = action.payload.pendingChanges;
        state.isOnline = action.payload.isOnline;
        state.isSyncing = action.payload.isSyncing;
      })
      .addCase(getSyncStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setOnlineStatus,
  setSyncingStatus,
  incrementPendingChanges,
  decrementPendingChanges,
  setPendingChanges,
  clearError,
  updateLastSync,
} = syncSlice.actions;

export default syncSlice.reducer;