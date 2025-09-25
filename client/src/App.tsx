import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Components
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLayout from "./components/Layout/Admin/AdminLayout";

// Pages
import Patron from "./components/pages/Patron/Patron";
import Cataloging from "./components/pages/Catalog/Cataloging";
import Accession from "./components/pages/Accession";
import Circulation from "./components/pages/Circulation/Circulation";
import Attendance from "./components/pages/Attendance/Attendance";
import Reports from "./components/pages/Reports";
import BookDetails from "./components/pages/Catalog/BookDetails";
import CopyInformation from "./components/pages/Catalog/CopyInformation";
import BookForm from "./components/pages/Catalog/BookForm";
import IssueForm from "./components/pages/Circulation/IssueForm";
import RoleSelection from "./components/pages/Authentication/RoleSelection";
import PatronInfo from "./components/pages/Patron/PatronInfo";
import LoanDaysSetting from "./components/pages/Settings/LoanDaysSettings";
import ExpirationYearsSetting from "./components/pages/Settings/ExpirationYearsSetting";
import FineSetting from "./components/pages/Settings/FineSetting";
import RenewalLimitSetting from "./components/pages/Settings/RenewalLimitSetting";
import PatronTransactions from "./components/pages/Patron/PatronTransaction";
import DailyAttendancePage from "./components/pages/Attendance/DailyAttendancePage";
import GuestDashboard from "./components/pages/Dashboard/GuestDashboard";
import GuestLayout from "./components/Layout/Guest/GuestLayout";
import Settings from "./components/pages/Settings/Settings";

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
          path="/guest/guestdashboard"
          element={
            <ProtectedRoute>
              <GuestLayout content={<GuestDashboard />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guest/cataloging"
          element={
            <ProtectedRoute>
              <GuestLayout content={<Cataloging />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guest/dailyattendance"
          element={
            <ProtectedRoute>
              <GuestLayout content={<DailyAttendancePage />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/admindashboard"
          element={
            <ProtectedRoute>
              <AdminLayout content={<AdminDashboard />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patrons"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Patron />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patrons/:id"
          element={
            <ProtectedRoute>
              <AdminLayout content={<PatronInfo />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patrons/:id/transactions"
          element={
            <ProtectedRoute>
              <AdminLayout content={<PatronTransactions />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cataloging"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Cataloging />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cataloging/addbook"
          element={
            <ProtectedRoute>
              <AdminLayout content={<BookForm />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cataloging/:id"
          element={
            <ProtectedRoute>
              <AdminLayout content={<BookDetails />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cataloging/:id/copies/:copyId"
          element={
            <ProtectedRoute>
              <AdminLayout content={<CopyInformation />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accession"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Accession />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/circulation"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Circulation />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/circulation/issue"
          element={
            <ProtectedRoute>
              <AdminLayout content={<IssueForm />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dailyattendance/attendance"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Attendance />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dailyattendance"
          element={
            <ProtectedRoute>
              <AdminLayout content={<DailyAttendancePage />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Reports />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminLayout content={<Settings />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/loan-days"
          element={
            <ProtectedRoute>
              <AdminLayout content={<LoanDaysSetting />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/expiration-years"
          element={
            <ProtectedRoute>
              <AdminLayout content={<ExpirationYearsSetting />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/fine-per-day"
          element={
            <ProtectedRoute>
              <AdminLayout content={<FineSetting />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/renewal-limit"
          element={
            <ProtectedRoute>
              <AdminLayout content={<RenewalLimitSetting />} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}
