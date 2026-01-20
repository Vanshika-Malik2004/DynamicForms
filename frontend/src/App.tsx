import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './routes/Login';
import { CandidateForm } from './routes/CandidateForm';
import { AdminFormBuilder } from './routes/AdminFormBuilder';
import { AdminSubmissions } from './routes/AdminSubmissions';
import { SubmissionDetail } from './routes/SubmissionDetail';
import { MySubmissions } from './routes/MySubmissions';
import { NotFound } from './routes/NotFound';
import { DEFAULT_FORM_ID } from './constants/config';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/forms/:formId"
          element={
            <ProtectedRoute>
              <CandidateForm />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/forms/:formId"
          element={
            <ProtectedRoute requireAdmin>
              <AdminFormBuilder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/forms/:formId/submissions"
          element={
            <ProtectedRoute requireAdmin>
              <AdminSubmissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/submissions/:submissionId"
          element={
            <ProtectedRoute requireAdmin>
              <SubmissionDetail />
            </ProtectedRoute>
          }
        />

        {/* User Protected Routes */}
        <Route
          path="/my-submissions"
          element={
            <ProtectedRoute>
              <MySubmissions />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={`/forms/${DEFAULT_FORM_ID}`} replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
