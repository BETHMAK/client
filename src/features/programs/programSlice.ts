import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Program } from '../../types';
import { API_URL, handleApiError } from '../../config/api';
import axiosInstance from '../../config/axios';

// Request and Response interfaces
export interface CreateProgramRequest extends Omit<Program, 'id'> {}
export interface UpdateProgramRequest {
    id: string;
    programData: Partial<Program>;
}
export interface ProgramResponse extends Program {}
export interface ProgramsResponse extends Array<Program> {}

interface ProgramsState {
    programs: Program[];
    selectedProgram: Program | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProgramsState = {
    programs: [],
    selectedProgram: null,
    isLoading: false,
    error: null
};

export const fetchPrograms = createAsyncThunk<
    ProgramsResponse,
    void,
    { rejectValue: string }
>(
    'programs/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get<ProgramsResponse>('/programs');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const createProgram = createAsyncThunk<
    ProgramResponse,
    CreateProgramRequest,
    { rejectValue: string }
>(
    'programs/create',
    async (programData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post<ProgramResponse>(
                '/programs', 
                programData
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const updateProgram = createAsyncThunk<
    ProgramResponse,
    UpdateProgramRequest,
    { rejectValue: string }
>(
    'programs/update',
    async ({ id, programData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put<ProgramResponse>(
                `/programs/${id}`, 
                programData
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const deleteProgram = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>(
    'programs/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(
                `/programs/${id}`
            );
            return id;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

const programSlice = createSlice({
    name: 'programs',
    initialState,
    reducers: {
        setSelectedProgram: (state, action) => {
            state.selectedProgram = action.payload;
        },
        clearProgramError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPrograms.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPrograms.fulfilled, (state, action) => {
                state.isLoading = false;
                state.programs = action.payload;
            })
            .addCase(fetchPrograms.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch programs';
            })
            .addCase(createProgram.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createProgram.fulfilled, (state, action) => {
                state.isLoading = false;
                state.programs.push(action.payload);
            })
            .addCase(createProgram.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to create program';
            })
            .addCase(updateProgram.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProgram.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.programs.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.programs[index] = action.payload;
                }
            })
            .addCase(updateProgram.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to update program';
            })
            .addCase(deleteProgram.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProgram.fulfilled, (state, action) => {
                state.isLoading = false;
                state.programs = state.programs.filter(p => p.id !== action.payload);
            })
            .addCase(deleteProgram.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to delete program';
            });
    }
});

export const { setSelectedProgram, clearProgramError } = programSlice.actions;
export default programSlice.reducer;
