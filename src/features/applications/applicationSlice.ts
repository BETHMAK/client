import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Application } from '../../types';
import { API_URL, getAuthHeader, handleApiError } from '../../config/api';

// Response type interfaces
export interface ApplicationResponse extends Application {}
export interface ApplicationsResponse extends Array<Application> {}

interface ApplicationsState {
    applications: Application[];
    selectedApplication: Application | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ApplicationsState = {
    applications: [],
    selectedApplication: null,
    isLoading: false,
    error: null
};

export const fetchApplications = createAsyncThunk<
    ApplicationsResponse,
    void,
    { rejectValue: string }
>(
    'applications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/applications`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const fetchApplicationById = createAsyncThunk<
    ApplicationResponse,
    string,
    { rejectValue: string }
>(
    'applications/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/applications/${id}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

/**
 * Application submission data interface
 */
export interface ApplicationSubmitData {
    programId: string;
    statement: string;
    comments?: string;
}

export const submitApplication = createAsyncThunk<
    ApplicationResponse,
    ApplicationSubmitData,
    { rejectValue: string }
>(
    'applications/submit',
    async (applicationData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/applications`, applicationData, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

/**
 * Status update data interface
 */
export interface StatusUpdateData {
    id: string; 
    status: string; 
    notes?: string;
}

export const updateApplicationStatus = createAsyncThunk<
    ApplicationResponse,
    StatusUpdateData,
    { rejectValue: string }
>(
    'applications/updateStatus',
    async ({ id, status, notes }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/applications/${id}/status`, 
                { status, notes },
                {
                    headers: getAuthHeader()
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

const applicationSlice = createSlice({
    name: 'applications',
    initialState,
    reducers: {
        setSelectedApplication: (state, action) => {
            state.selectedApplication = action.payload;
        },
        clearApplicationError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchApplications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchApplications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.applications = action.payload;
            })
            .addCase(fetchApplications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch applications';
            })
            .addCase(fetchApplicationById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchApplicationById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedApplication = action.payload;
            })
            .addCase(fetchApplicationById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch application';
            })
            .addCase(submitApplication.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(submitApplication.fulfilled, (state, action) => {
                state.isLoading = false;
                state.applications.push(action.payload);
            })
            .addCase(submitApplication.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to submit application';
            })
            .addCase(updateApplicationStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateApplicationStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.applications.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.applications[index] = action.payload;
                }
                if (state.selectedApplication?.id === action.payload.id) {
                    state.selectedApplication = action.payload;
                }
            })
            .addCase(updateApplicationStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to update application status';
            });
    }
});

export const { setSelectedApplication, clearApplicationError } = applicationSlice.actions;
export default applicationSlice.reducer;
