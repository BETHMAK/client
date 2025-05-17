import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL, getAuthHeader, handleApiError } from '../../config/api';

// Document-related types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  applicationId: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Response type interfaces
export interface DocumentResponse extends Document {}
export interface DocumentsResponse extends Array<Document> {}

// Document state interface
interface DocumentsState {
  documents: Document[];
  selectedDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number | null;
}

const initialState: DocumentsState = {
  documents: [],
  selectedDocument: null,
  isLoading: false,
  error: null,
  uploadProgress: null
};

// Async thunk for fetching documents for a specific application
export const fetchDocuments = createAsyncThunk<
  DocumentsResponse,
  string, // applicationId
  { rejectValue: string }
>(
  'documents/fetchAll',
  async (applicationId, { rejectWithValue }) => {
    try {
      // Handle 'all' as a special case to fetch all documents
      const url = applicationId === 'all' 
        ? `${API_URL}/documents` 
        : `${API_URL}/documents?applicationId=${applicationId}`;
        
      const response = await axios.get(url, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Async thunk for fetching a single document by ID
export const fetchDocumentById = createAsyncThunk<
  DocumentResponse,
  string, // documentId
  { rejectValue: string }
>(
  'documents/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/documents/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Interface for document upload data
export interface DocumentUploadData {
  file: File;
  applicationId: string;
  documentType?: string;
  description?: string;
}

// Async thunk for uploading a single document
export const uploadDocument = createAsyncThunk<
  DocumentResponse,
  DocumentUploadData,
  { rejectValue: string }
>(
  'documents/upload',
  async (documentData, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append('file', documentData.file);
      formData.append('applicationId', documentData.applicationId);
      
      if (documentData.documentType) {
        formData.append('documentType', documentData.documentType);
      }
      
      if (documentData.description) {
        formData.append('description', documentData.description);
      }

      const response = await axios.post(
        `${API_URL}/documents/upload`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              dispatch(setUploadProgress(progress));
            }
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Interface for batch document upload data
export interface BatchDocumentUploadData {
  files: File[];
  applicationId: string;
  documentType?: string;
}

// Async thunk for uploading multiple documents
export const uploadMultipleDocuments = createAsyncThunk<
  DocumentsResponse,
  BatchDocumentUploadData,
  { rejectValue: string }
>(
  'documents/uploadMultiple',
  async (uploadData, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      
      uploadData.files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      formData.append('applicationId', uploadData.applicationId);
      
      if (uploadData.documentType) {
        formData.append('documentType', uploadData.documentType);
      }

      const response = await axios.post(
        `${API_URL}/documents/upload-multiple`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              dispatch(setUploadProgress(progress));
            }
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Async thunk for deleting a document
export const deleteDocument = createAsyncThunk<
  string, // returns document ID on success
  string, // document ID to delete
  { rejectValue: string }
>(
  'documents/delete',
  async (documentId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/documents/${documentId}`, {
        headers: getAuthHeader()
      });
      return documentId; // Return the ID of the deleted document
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Interface for document status update data
export interface DocumentStatusUpdateData {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

// Async thunk for updating document status
export const updateDocumentStatus = createAsyncThunk<
  DocumentResponse,
  DocumentStatusUpdateData,
  { rejectValue: string }
>(
  'documents/updateStatus',
  async (statusData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/documents/${statusData.id}/status`,
        {
          status: statusData.status,
          comment: statusData.comment
        },
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

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setSelectedDocument: (state, action) => {
      state.selectedDocument = action.payload;
    },
    clearDocumentError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents cases
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch documents';
      })
      
      // Fetch document by ID cases
      .addCase(fetchDocumentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch document';
      })
      
      // Upload document cases
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.push(action.payload);
        state.uploadProgress = 100;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to upload document';
        state.uploadProgress = null;
      })
      
      // Upload multiple documents cases
      .addCase(uploadMultipleDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadMultipleDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = [...state.documents, ...action.payload];
        state.uploadProgress = 100;
      })
      .addCase(uploadMultipleDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to upload documents';
        state.uploadProgress = null;
      })
      
      // Delete document cases
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = state.documents.filter(
          (document) => document.id !== action.payload
        );
        if (state.selectedDocument?.id === action.payload) {
          state.selectedDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete document';
      })
      
      // Update document status cases
      .addCase(updateDocumentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDocumentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.selectedDocument?.id === action.payload.id) {
          state.selectedDocument = action.payload;
        }
      })
      .addCase(updateDocumentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update document status';
      });
  }
});

export const { 
  setSelectedDocument, 
  clearDocumentError,
  setUploadProgress,
  resetUploadProgress
} = documentSlice.actions;

export default documentSlice.reducer;

