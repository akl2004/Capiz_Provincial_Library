import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Components
import AdminDashboard from "./components/pages/Dashboard/AdminDashboard";
import AdminLayout from "./components/Layout/Admin/AdminLayout";
import StaffLayout from "./components/Layout/Staff/StaffLayout";

// Pages
import Patron from "./components/pages/Patron/Patron";
import Cataloging from "./components/pages/Catalog/Cataloging";
import Accession from "./components/pages/Accession/Accession";
import Circulation from "./components/pages/Circulation/CirculationPage";
import Attendance from "./components/pages/Attendance/Attendance";
import Reports from "./components/pages/Reports/Reports";
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
import GuestLayout from "./components/Layout/Guest/GuestLayout";
import Settings from "./components/pages/Settings/Settings";
import Accounts from "./components/pages/Accounts/Accounts";
import PatronProfile from "./components/pages/Accounts/PatronProfile";
import StaffProfile from "./components/pages/Accounts/StaffProfile";
import StaffDashboard from "./components/pages/Dashboard/StaffDashboard";
import GuestDasboard from "./components/pages/Dashboard/GuestDasboard";
import SearchResults from "./components/pages/Catalog/SearchResults";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Role selection accessible to any logged-in user */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleSelection />
            </ProtectedRoute>
          }
        />

        {/* Guest Routes */}
        <Route
          path="/guest/guestdashboard"
          element={
            <ProtectedRoute allowedRoles={["guest"]}>
              <GuestLayout content={<GuestDasboard />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guest/cataloging"
          element={
            <ProtectedRoute allowedRoles={["guest"]}>
              <GuestLayout content={<Cataloging />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guest/dailyattendance"
          element={
            <ProtectedRoute allowedRoles={["guest"]}>
              <GuestLayout content={<DailyAttendancePage />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="guest/guestdashboard/search"
          element={
            <ProtectedRoute allowedRoles={["guest"]}>
              <GuestLayout content={<SearchResults />} />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout content={null} />
            </ProtectedRoute>
          }
        >
          <Route path="admindashboard" element={<AdminDashboard />} />
          <Route path="patrons" element={<Patron />} />
          <Route path="patrons/:id" element={<PatronInfo />} />
          <Route
            path="patrons/:id/transactions"
            element={<PatronTransactions />}
          />
          <Route path="cataloging" element={<Cataloging />} />
          <Route path="cataloging/addbook" element={<BookForm />} />
          <Route path="cataloging/:id" element={<BookDetails />} />
          <Route path="cataloging/:id/:copyId" element={<CopyInformation />} />
          <Route path="accession" element={<Accession />} />
          <Route path="circulation" element={<Circulation />} />
          <Route path="circulation/issue" element={<IssueForm />} />
          {/* <Route path="dailyattendance" element={<DailyAttendancePage />} /> */}
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/loan-days" element={<LoanDaysSetting />} />
          <Route
            path="settings/expiration-years"
            element={<ExpirationYearsSetting />}
          />
          <Route path="settings/fine-per-day" element={<FineSetting />} />
          <Route
            path="settings/renewal-limit"
            element={<RenewalLimitSetting />}
          />
          <Route path="accounts" element={<Accounts />} />
          <Route path="accounts/patron/:id" element={<PatronProfile />} />
          <Route path="accounts/staff/:id" element={<StaffProfile />} />
        </Route>

        {/* Staff Routes */}
        <Route
          path="/staff/*"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffLayout content={null} />
            </ProtectedRoute>
          }
        >
          <Route path="staffdashboard" element={<StaffDashboard />} />
          <Route path="patrons" element={<Patron />} />
          <Route path="patrons/:id" element={<PatronInfo />} />
          <Route
            path="patrons/:id/transactions"
            element={<PatronTransactions />}
          />
          <Route path="cataloging" element={<Cataloging />} />
          <Route path="cataloging/addbook" element={<BookForm />} />
          <Route path="cataloging/:id" element={<BookDetails />} />
          <Route path="cataloging/:id/:copyId" element={<CopyInformation />} />
          <Route path="accession" element={<Accession />} />
          <Route path="circulation" element={<Circulation />} />
          <Route path="circulation/issue" element={<IssueForm />} />
          {/* <Route path="dailyattendance" element={<DailyAttendancePage />} /> */}
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
