import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../LoadingSpinner";

interface Staff {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  registered_by: string;
  last_login: string | null;
}

interface ActivityLog {
  id: number;
  role: string;
  module: string;
  action: string;
  description: string;
  created_at: string;
}

const StaffProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const navigate = useNavigate();

  // Fetch Staff Details
  useEffect(() => {
    document.title = "Staff Profile";
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const res = await AxiosInstance.get(`/staff/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStaff(res.data);
      } catch (err) {
        console.error("Error fetching staff:", err);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, [id]);

  // Fetch Activity Logs for this specific staff
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const res = await AxiosInstance.get(`/staff/${id}/activity-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivityLogs(res.data);
      } catch (err) {
        console.error("Error fetching activity logs:", err);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, [id]);

  const fullName = staff
    ? [staff.first_name, staff.middle_name, staff.last_name, staff.suffix]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div className="staff-profile mt-4 mb-5">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">
          <span
            className="me-2"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/accounts")}
          >
            <i className="bi bi-arrow-left"></i>
          </span>
          STAFF PROFILE
        </h1>
      </div>

      {/* Basic Info / Actions */}
      <div className="staff-profile d-flex justify-content-between align-items-center border p-3 mb-4">
        <div>
          <h4 className="mb-0">
            {loadingStaff ? (
              <div
                style={{
                  width: "250px",
                  height: "34px",
                  background: "#e0e0e0",
                  borderRadius: "4px",
                  animation: "pulse 1.5s infinite",
                }}
              ></div>
            ) : (
              <u>{fullName}</u>
            )}
          </h4>
          <small className="text-muted">Staff</small>
        </div>
      </div>

      {/* Personal Information */}
      <div className="staff-profile border mb-4 p-3">
        <h2 className="mb-4">Personal Information</h2>
        {loadingStaff ? (
          <LoadingSpinner message="Loading personal info..." />
        ) : (
          <div className="row">
            <div className="col-md-4 mb-2">
              <strong>First Name:</strong> {staff?.first_name || "N/A"}
            </div>
            <div className="col-md-4 mb-2">
              <strong>Middle Name:</strong> {staff?.middle_name || "N/A"}
            </div>
            <div className="col-md-4 mb-2">
              <strong>Last Name:</strong> {staff?.last_name || "N/A"}
            </div>
            <div className="col-md-4 mb-2">
              <strong>Suffix:</strong> {staff?.suffix || "N/A"}
            </div>
            <div className="col-md-4 mb-2">
              <strong>Email:</strong> {staff?.email || "N/A"}
            </div>
            <div className="col-md-4 mb-2">
              <strong>Phone Number:</strong> {staff?.phone || "N/A"}
            </div>
          </div>
        )}
      </div>

      {/* Activity Logs */}
      <div className="staff-profile border mt-4 p-3">
        <h2 className="mb-3">Activity Log</h2>
        {loadingLogs ? (
          <LoadingSpinner message="Loading activity logs..." />
        ) : activityLogs.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Role</th>
                <th>Module</th>
                <th>Action</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.role}</td>
                  <td>{log.module}</td>
                  <td>{log.action}</td>
                  <td>{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No activities yet.</p>
        )}
      </div>
    </div>
  );
};

export default StaffProfile;
