import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Components
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLayout from "./components/Layout/AdminLayout";

// Pages
import Patron from "./components/pages/Patron/Patron";
import Cataloging from "./components/pages/Catalog/Cataloging";
import Accession from "./components/pages/Accession";
import Circulation from "./components/pages/Circulation/Circulation";
import Attendance from "./components/pages/Attendance";
import Reports from "./components/pages/Reports";
import BookDetails from "./components/pages/Catalog/BookDetails";
import CopyInformation from "./components/pages/Catalog/CopyInformation";
import BookForm from "./components/pages/Catalog/BookForm";
import IssueForm from "./components/pages/Circulation/IssueForm";
import RoleSelection from "./components/pages/Authentication/RoleSelection";
import PatronInfo from "./components/pages/Patron/PatronInfo";
import LoanDaysSetting from "./components/Admin/LoanDaysSettings";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute>
              <AdminLayout content={<AdminDashboard />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patrons"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Patron />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patrons/:id"
          element={
            <ProtectedRoute>
              <AdminLayout content={<PatronInfo />} />
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
          path="circulation/issue"
          element={
            <ProtectedRoute>
              <AdminLayout content={<IssueForm />} />
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
          path="/settings/loan-days"
          element={
            <ProtectedRoute>
              <AdminLayout content={<LoanDaysSetting />} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}
