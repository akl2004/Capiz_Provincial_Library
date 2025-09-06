import { Link, useLocation } from "react-router-dom";
import dashboardIcon from "../../assets/icons-white/dashboard.png";
import patronIcon from "../../assets/icons-white/inventory.png";
import catalogingIcon from "../../assets/icons-white/inventory.png";
import accessionIcon from "../../assets/icons-white/inventory.png";
import circulationIcon from "../../assets/icons-white/inventory.png";
import attendanceIcon from "../../assets/icons-white/attendance.png";
import reportsIcon from "../../assets/icons-white/reports.png";
import elibIcon from "../../assets/icons-white/e-library.png";
import dashboardIconActive from "../../assets/icons-black/dashboard.png";
import patronIconActive from "../../assets/icons-black/inventory.png";
import catalogingIconActive from "../../assets/icons-black/inventory.png";
import accessionIconActive from "../../assets/icons-black/inventory.png";
import circulationIconActive from "../../assets/icons-black/inventory.png";
import attendanceIconActive from "../../assets/icons-black/attendance.png";
import reportsIconActive from "../../assets/icons-black/reports.png";
import bookBG from "../../assets/bg-side.png";

const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      path: "/admindashboard",
      icon: dashboardIcon,
      activeIcon: dashboardIconActive,
    },
    {
      name: "Patron",
      path: "/patron",
      icon: patronIcon,
      activeIcon: patronIconActive,
    },
    {
      name: "Cataloging",
      path: "/cataloging",
      icon: catalogingIcon,
      activeIcon: catalogingIconActive,
    },
    {
      name: "Accession",
      path: "/accession",
      icon: accessionIcon,
      activeIcon: accessionIconActive,
    },
    {
      name: "Circulation",
      path: "/circulation",
      icon: circulationIcon,
      activeIcon: circulationIconActive,
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: attendanceIcon,
      activeIcon: attendanceIconActive,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: reportsIcon,
      activeIcon: reportsIconActive,
    },
  ];

  return (
    <div
      className="text-white p-3 w-64"
      style={{
        backgroundImage: `
      linear-gradient(
        to bottom,
        rgba(57, 40, 112, 5) 0%,       /* Solid violet top */
        rgba(57, 40, 112, 2) 20%,   /* Still strong violet */
        rgba(92, 77, 145, 0.9) 45%,   /* Medium violet */
        rgba(59, 50, 92, 0.55) 70%,   /* Lighter violet */
        rgba(26, 22, 40, 0) 100%       /* Transparent bottom */
      ),
      url(${bookBG})
    `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
      }}
    >
      <h2 className="fs-4 fw-bold mb-4">
        <img className="mx-3" src={elibIcon} alt="" height={40} width={40} />
        E-LIBRARY
      </h2>
      <ul className="nav flex-column fs-5 mx-3">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-link d-flex align-items-center mb-2 ${
              location.pathname === item.path
                ? "active text-white fw-bold"
                : "text-light"
            }`}
            style={{
              fontSize: "1.1rem",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <img
              src={
                location.pathname === item.path ? item.activeIcon : item.icon
              }
              alt={item.name}
              style={{ width: "22px", height: "22px", marginRight: "10px" }}
            />
            <span className="flex-grow-1">{item.name}</span>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;
