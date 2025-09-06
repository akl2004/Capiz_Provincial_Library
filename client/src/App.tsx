import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Components
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLayout from "./components/Layout/AdminLayout";

import BookList from "./components/Admin/BookList";
import BookFormSample from "./components/Admin/BookFormSample";

// Pages
import Patron from "./components/pages/Patron";
import Cataloging from "./components/pages/Cataloging";
import Accession from "./components/pages/Accession";
import Circulation from "./components/pages/Circulation";
import Attendance from "./components/pages/Attendance";
import Reports from "./components/pages/Reports";
import BookDetails from "./components/pages/BookDetails";
import CopyInformation from "./components/pages/CopyInformation";
import BookForm from "./components/pages/BookForm";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout content={<AdminDashboard />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patron"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Patron />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cataloging"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Cataloging />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cataloging/addbook"
          element={
            <ProtectedRoute>
              <AdminLayout content={<BookForm />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cataloging/:id"
          element={
            <ProtectedRoute>
              <AdminLayout content={<BookDetails />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cataloging/:id/copies/:copyId"
          element={
            <ProtectedRoute>
              <AdminLayout content={<CopyInformation />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accession"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Accession />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circulation"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Circulation />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Attendance />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Reports />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <BookList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/add"
          element={
            <ProtectedRoute>
              <BookFormSample />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}
