import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";
import AxiosInstance from "../../../AxiosInstance";

interface AdminLayoutProps {
  content: React.ReactNode;
}

const AdminLayout = ({ content }: AdminLayoutProps) => {
  const [user, setUser] = useState<{
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    suffix?: string | null;
    avatar: string;
    role: string;
    name?: string | null;
  }>({
    first_name: "Guest",
    middle_name: null,
    last_name: "",
    suffix: null,
    avatar: "./src/assets/lib-logo.png",
    role: "guest",
    name: "Guest", // default
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return; // no token → stay as guest

    AxiosInstance.get("/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        // map API response to expected structure if needed
        console.log(res.data);
        setUser({
          first_name: res.data.first_name || "Guest",
          middle_name: res.data.middle_name || null,
          last_name: res.data.last_name || "",
          suffix: res.data.suffix || null,
          avatar: res.data.avatar || "./src/assets/lib-logo.png",
          role: res.data.role || "guest",
          name: res.data.name || `${res.data.first_name} ${res.data.last_name}`,
        });

      })
      .catch((err) => console.error("Failed to fetch user info", err));
  }, []);

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <AdminSidebar />
      </div>

      <div className="admin-main">
        <Header
          user={{
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            suffix: user.suffix,
            avatar: user.avatar,
            role: user.role,
            name: user.name, // new
          }}
          onLogout={() => {
            localStorage.removeItem("authToken");
            setUser({
              first_name: "Guest",
              middle_name: null,
              last_name: "",
              suffix: null,
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

export default AdminLayout;
