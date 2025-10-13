import { useEffect } from "react";

const StaffDashboard = () => {
  useEffect(() => {
    document.title = "Staff Dashboard";
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to the guest dashboard!</p>
    </>
  );
};

export default StaffDashboard;
