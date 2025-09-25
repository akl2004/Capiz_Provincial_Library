import { Link, useLocation } from "react-router-dom";
import dashboardIcon from "../../../assets/gray-icons/dashboard.png";
import catalogingIcon from "../../../assets/gray-icons/cataloging.png";
import attendanceIcon from "../../../assets/gray-icons/attendance.png";
import elibIcon from "../../../assets/cpl_logo.png";
import dashboardIconActive from "../../../assets/icons-black/dashboard.png";
import catalogingIconActive from "../../../assets/white-icons/cataloging.png";
import attendanceIconActive from "../../../assets/icons-black/attendance.png";

const GuestSidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      path: "/guest/guestdashboard",
      icon: dashboardIcon,
      activeIcon: dashboardIconActive,
    },
    {
      name: "Cataloging",
      path: "/guest/cataloging",
      icon: catalogingIcon,
      activeIcon: catalogingIconActive,
    },
    {
      name: "Attendance",
      path: "/guest/dailyattendance",
      icon: attendanceIcon,
      activeIcon: attendanceIconActive,
    },
  ];

  return (
    <div className="p-3 w-64">
      <h2 className="fs-4 fw-bold mb-4">
        <img className="mx-2" src={elibIcon} alt="" height={40} width={40} />
        CAPIZ E-LIB
      </h2>
      <ul className="nav flex-column fs-5 mx-3">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-link ${
              location.pathname === item.path
                ? "active text-white fw-bold"
                : "text-gray-300"
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

export default GuestSidebar;
