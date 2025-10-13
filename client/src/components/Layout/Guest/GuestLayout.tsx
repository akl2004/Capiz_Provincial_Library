import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import elibIcon from "../../../assets/cpl_logo.png";

interface GuestLayoutProps {
  content?: React.ReactNode;
}

const GuestLayout = ({ content }: GuestLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/guest/guestdashboard" },
    { name: "Attendance", path: "/guest/dailyattendance" },
    { name: "About", path: "/guest/about" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="guest-layout">
      {/* Top Navigation */}
      <div className="guest-navbar">
        {/* Left: Logo + Title */}
        <div className="guest-logo">
          <img src={elibIcon} alt="E-LIB" />
          <h1>CAPIZ E-LIB</h1>
        </div>

        {/* Center: Tabs */}
        <div className="guest-tabs">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`guest-tab ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right: Logout */}
        <button
          className="guest-logout"
          onClick={() => {
            localStorage.removeItem("authToken"); // remove token
            navigate("/"); // go to role selection
          }}
        >
          LOG OUT ↩
        </button>
      </div>

      {/* Page Content */}
      <main className="guest-content">{content ? content : <Outlet />}</main>
    </div>
  );
};

export default GuestLayout;
