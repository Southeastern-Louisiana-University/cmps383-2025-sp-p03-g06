// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import TheaterList from './components/TheaterList';
import TheaterForm from './components/TheaterForm';
import Navbar from './components/Navbar';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAdmin) {
    return <Navigate to="/theaters" replace />;
  }
  
  return <>{children}</>;
};

// Main component
const AppContent = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Navigate to="/theaters" replace />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/theaters" 
            element={
              <ProtectedRoute>
                <TheaterList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/theaters/new" 
            element={
              <AdminRoute>
                <TheaterForm mode="create" />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/theaters/edit/:id" 
            element={
              <AdminRoute>
                <TheaterForm mode="edit" />
              </AdminRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Root App component with providers
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;