import React, { useState, useEffect } from "react";
import AxiosInstance from "../../../AxiosInstance";
import StaffSidebar from "./GuestSidebar";
import Header from "../Admin/Header";

interface StaffLayoutProps {
  content: React.ReactNode;
}

const GuestLayout = ({ content }: StaffLayoutProps) => {
  const [user, setUser] = useState<{
    name: string;
    avatar: string;
    role: string;
  }>({
    name: "Guest",
    avatar: "./src/assets/lib-logo.png",
    role: "guest",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return; // no token → stay as guest

    AxiosInstance.get("/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Failed to fetch user info", err));
  }, []);

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <StaffSidebar />
      </div>

      <div className="admin-main">
        <Header
          user={user || { name: "Guest", avatar: "./src/assets/lib-logo.png" }}
          onLogout={() => {
            localStorage.removeItem("authToken");
            setUser({
              name: "Guest",
              avatar: "./src/assets/lib-logo.png",
              role: "guest",
            });
          }}
        />

        <main className="admin-content">{content}</main>
      </div>
    </div>
  );
};

export default GuestLayout;
