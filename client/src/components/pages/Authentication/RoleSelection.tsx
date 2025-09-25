import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";

const roles = [
  { name: "Guest", image: "./src/assets/icons-white/admin.png" },
  { name: "Staff", image: "./src/assets/icons-white/admin.png" },
  { name: "Admin", image: "./src/assets/icons-white/admin.png" },
];

const RoleSelection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login";
  }, []);

  const [loggedInUser, setLoggedInUser] = useState<{
    name: string;
    avatar: string;
    role: string;
  } | null>(null);

  const handleLoginSuccess = (user: {
    name: string;
    avatar: string;
    role: string;
  }) => {
    setLoggedInUser(user);

    if (user.role === "staff") {
      navigate("/staff/staffdashboard");
    } else if (user.role === "admin") {
      navigate("/admin/admindashboard");
    } else if (user.role === "guest" || user.role === "guest") {
      navigate("/guestdashboard");
    }
  };

  const handleRoleClick = (role: string) => {
    if (role === "Guest") {
      navigate("/guest/guestdashboard");
    } else {
      setSelectedRole(role);
    }
  };


  return (
    <div className="background">
      <div className="login-container">
        <div className="branding">
          <h1 className="brand-title">CAPIZ PROVINCIAL LIBRARY</h1>
        </div>

        <div className="role-selection">
          {roles.map((role) => (
            <div
              key={role.name}
              className="role-card"
              onClick={() => handleRoleClick(role.name)}
            >
              <img src={role.image} alt={role.name} className="role-image" />
              <div className="role-divider"></div>
              <h5 className="role-name">{role.name}</h5>
            </div>
          ))}
        </div>

        {selectedRole && (
          <LoginModal
            role={selectedRole} // ✅ lowercase role
            onClose={() => setSelectedRole(null)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default RoleSelection;
