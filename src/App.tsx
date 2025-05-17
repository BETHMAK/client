import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './app/store';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ApplicantDashboard from './components/Dashboard/ApplicantDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import ProgramList from './components/Programs/ProgramList';
import AdminProgramList from './components/Programs/AdminProgramList';
import ApplicationsList from './components/Applications/ApplicationsList';
import AdminApplicationsList from './components/Applications/AdminApplicationsList';
import ApplicationForm from './components/Applications/ApplicationForm';
import DocumentsPage from './components/Documents/DocumentsPage';
import ApplicationReview from './components/Applications/ApplicationReview';
import DocumentVerification from './components/Documents/DocumentVerification';

// Protected Route component
interface ProtectedRouteProps {
    children: React.ReactNode;
    role?: 'admin' | 'applicant';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/dashboard" />;
    }
    
    return <>{children}</>;
};

const App = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <Router>
            <Layout>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={
                        user ? <Navigate to="/dashboard" /> : <Login />
                    } />
                    <Route path="/register" element={
                        user ? <Navigate to="/dashboard" /> : <Register />
                    } />
                    
                    {/* Dashboard Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            {user?.role === 'admin' ? <AdminDashboard /> : <ApplicantDashboard />}
                        </ProtectedRoute>
                    } />
                    
                    {/* Program Routes */}
                    <Route path="/programs" element={
                        <ProtectedRoute>
                            <ProgramList />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/programs" element={
                        <ProtectedRoute role="admin">
                            <AdminProgramList />
                        </ProtectedRoute>
                    } />
                    
                    {/* Application Routes */}
                    <Route path="/applications" element={
                        <ProtectedRoute>
                            {user?.role === 'admin' ? <AdminApplicationsList /> : <ApplicationsList />}
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/applications" element={
                        <ProtectedRoute role="admin">
                            <AdminApplicationsList />
                        </ProtectedRoute>
                    } />
                    <Route path="/applications/new" element={
                        <ProtectedRoute>
                            <ApplicationForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/applications/:applicationId/review" element={
                        <ProtectedRoute role="admin">
                            <ApplicationReview />
                        </ProtectedRoute>
                    } />
                    
                    {/* Document Routes */}
                    <Route path="/documents" element={
                        <ProtectedRoute>
                            {user?.role === 'admin' ? 
                                <DocumentsPage isAdmin={true} /> : 
                                <DocumentsPage />
                            }
                        </ProtectedRoute>
                    } />
                    <Route path="/documents/:documentId/verify" element={
                        <ProtectedRoute role="admin">
                            <DocumentVerification />
                        </ProtectedRoute>
                    } />
                    <Route path="/applications/:applicationId/documents" element={
                        <ProtectedRoute role="applicant">
                            <DocumentsPage />
                        </ProtectedRoute>
                    } />
                    
                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    
                    {/* 404 Route */}
                    <Route path="*" element={
                        <div>
                            <h1>404: Page Not Found</h1>
                            <p>The page you are looking for does not exist.</p>
                        </div>
                    } />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;
