import { useEffect } from "react";

const DashboardPage = () => {
  useEffect(() => {
    document.title = "Admin Dashboard";
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to the admin dashboard!</p>
    </>
  );
};

export default DashboardPage;
