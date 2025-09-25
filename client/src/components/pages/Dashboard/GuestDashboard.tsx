import { useEffect } from "react";

const GuestDashboard = () => {
  useEffect(() => {
    document.title = "Guest Dashboard";
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to the guest dashboard!</p>
    </>
  );
};

export default GuestDashboard;
