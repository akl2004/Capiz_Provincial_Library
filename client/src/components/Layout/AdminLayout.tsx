import React from "react";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";

interface AdminLayoutProps {
  content: React.ReactNode;
}

const AdminLayout = ({ content }: AdminLayoutProps) => {
  return (
    <div className="admin-layout">
      {/* Sidebar (fixed on left) */}
      <div className="admin-sidebar">
        <AdminSidebar />
      </div>

      {/* Right Section */}
      <div className="admin-main">
        {/* Fixed Header */}
        <Header
          user={{
            name: "Thea Ledesma",
            avatar: "https://via.placeholder.com/150", // replace with real user image
          }}
          onLogout={() => console.log("Logged out")}
        />

        {/* Scrollable Content */}
        <main className="admin-content">{content}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
