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

const StaffProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [staff, setStaff] = useState<Staff | null>(null);
  
  const [loadingStaff, setLoadingStaff] = useState(true);
  
  const navigate = useNavigate();

  // Fetch Staff Details
  useEffect(() => {
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

  

  if (!staff && !loadingStaff) return <p>Staff not found.</p>;

  const fullName = staff
    ? [staff.first_name, staff.middle_name, staff.last_name, staff.suffix]
        .filter(Boolean)
        .join(" ")
    : "";
  

  return (
    <>
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
                // Skeleton loader for the name
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
          <div className="staff-actions">
            <span
              className="action-link text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/admin/staff/${staff?.id}/edit`)}
            >
              Edit
            </span>{" "}
            |{" "}
            <span
              className="action-link text-warning"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to deactivate this user?"
                  )
                ) {
                  console.log("User deactivated");
                }
              }}
            >
              Deactivate
            </span>{" "}
            |{" "}
            <span
              className="action-link text-danger"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to block this user?")
                ) {
                  console.log("User blocked");
                }
              }}
            >
              Block
            </span>{" "}
            |{" "}
            <span
              className="action-link text-secondary"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/admin/staff/${staff?.id}/full-record`)}
            >
              View Full Record
            </span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="staff-profile border">
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

        {/* Account Information */}
        <div className="staff-profile border">
          <h2 className="mb-4">Account Information</h2>
          {loadingStaff ? (
            <LoadingSpinner/>
          ) : (
            <table className="w-100 table-borderless text-center">
              <thead>
                <tr className="text-muted">
                  <th>Date Registered</th>
                  <th>Registered By</th>
                  <th>Last Login</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {staff?.created_at
                      ? new Date(staff.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>{staff?.registered_by || "N/A"}</td>
                  <td>
                    {staff?.last_login
                      ? new Date(staff.last_login).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className={`status-pill status-${staff?.status?.toLowerCase()}`}
                    >
                      {staff?.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default StaffProfile;
