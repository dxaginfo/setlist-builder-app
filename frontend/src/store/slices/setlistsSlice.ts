import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo: number;
  durationSeconds: number;
  lyricsUrl?: string;
  chordChartUrl?: string;
  notes?: string;
}

export interface SetlistSong extends Song {
  position: number;
  notes: string;
}

export interface Setlist {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  songs: SetlistSong[];
}

interface SetlistsState {
  setlists: Setlist[];
  currentSetlist: Setlist | null;
  loading: boolean;
  error: string | null;
}

const initialState: SetlistsState = {
  setlists: [],
  currentSetlist: null,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchSetlists = createAsyncThunk(
  'setlists/fetchSetlists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/setlists');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch setlists');
    }
  }
);

export const fetchSetlistById = createAsyncThunk(
  'setlists/fetchSetlistById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/setlists/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch setlist');
    }
  }
);

export const createSetlist = createAsyncThunk(
  'setlists/createSetlist',
  async (setlist: Partial<Setlist>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/setlists', setlist);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create setlist');
    }
  }
);

export const updateSetlist = createAsyncThunk(
  'setlists/updateSetlist',
  async ({ id, setlist }: { id: string; setlist: Partial<Setlist> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/setlists/${id}`, setlist);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update setlist');
    }
  }
);

export const deleteSetlist = createAsyncThunk(
  'setlists/deleteSetlist',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/setlists/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete setlist');
    }
  }
);

// Slice definition
const setlistsSlice = createSlice({
  name: 'setlists',
  initialState,
  reducers: {
    clearCurrentSetlist: (state) => {
      state.currentSetlist = null;
    },
    updateSetlistSongs: (state, action: PayloadAction<{ setlistId: string; songs: SetlistSong[] }>) => {
      const { setlistId, songs } = action.payload;
      if (state.currentSetlist && state.currentSetlist.id === setlistId) {
        state.currentSetlist.songs = songs;
      }
      
      const setlistIndex = state.setlists.findIndex((s) => s.id === setlistId);
      if (setlistIndex !== -1) {
        state.setlists[setlistIndex].songs = songs;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all setlists
      .addCase(fetchSetlists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSetlists.fulfilled, (state, action) => {
        state.loading = false;
        state.setlists = action.payload;
      })
      .addCase(fetchSetlists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single setlist
      .addCase(fetchSetlistById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSetlistById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSetlist = action.payload;
      })
      .addCase(fetchSetlistById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create setlist
      .addCase(createSetlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSetlist.fulfilled, (state, action) => {
        state.loading = false;
        state.setlists.push(action.payload);
        state.currentSetlist = action.payload;
      })
      .addCase(createSetlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update setlist
      .addCase(updateSetlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSetlist.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.setlists.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.setlists[index] = action.payload;
        }
        state.currentSetlist = action.payload;
      })
      .addCase(updateSetlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete setlist
      .addCase(deleteSetlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSetlist.fulfilled, (state, action) => {
        state.loading = false;
        state.setlists = state.setlists.filter((s) => s.id !== action.payload);
        if (state.currentSetlist && state.currentSetlist.id === action.payload) {
          state.currentSetlist = null;
        }
      })
      .addCase(deleteSetlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSetlist, updateSetlistSongs } = setlistsSlice.actions;

export default setlistsSlice.reducer;