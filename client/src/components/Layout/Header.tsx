import { useState } from "react";
import LogoutModal from "../pages/Authentication/LogoutModal";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  user: {
    name: string;
    avatar: string;
  };
  onLogout: () => void;
}

const Header = ({ user, onLogout }: HeaderProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true); // Show confirmation modal
    setDropdownOpen(false); // Close dropdown
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
    navigate("/"); // go back to RoleSelection
  };

  return (
    <header className="admin-header">
      {/* LEFT: System Name */}
      <h2 className="m-0 fw-bold">Library System</h2>

      {/* RIGHT: All controls in one row */}
      <div className="d-flex align-items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="btn btn-sm btn-outline-secondary"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Settings */}
        <img
          src="https://img.icons8.com/ios-filled/24/settings.png"
          alt="settings"
          style={{ cursor: "pointer" }}
        />

        {/* User Profile */}
        <div className="dropdown">
          <button
            className="btn d-flex align-items-center"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img
              src={user.avatar || "./src/assets/lib-logo.png"}
              alt="avatar"
              className="rounded-circle me-2"
              style={{ width: "32px", height: "32px" }}
            />
            <span>{user.name}</span>
          </button>

          {dropdownOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show"
              style={{ position: "absolute" }}
            >
              <button className="dropdown-item" onClick={handleLogoutClick}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleConfirmLogout}
        />
      )}
    </header>
  );
};

export default Header;
