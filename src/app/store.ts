import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from '../features/auth/authSlice';
import programReducer from '../features/programs/programSlice';
import applicationReducer from '../features/applications/applicationSlice';
import documentReducer from '../features/documents/documentSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        programs: programReducer,
        applications: applicationReducer,
        documents: documentReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use these typed hooks throughout your app instead of plain useDispatch/useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
