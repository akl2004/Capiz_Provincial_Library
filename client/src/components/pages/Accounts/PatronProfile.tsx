import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../LoadingSpinner";

interface Patron {
  id: number;
  patron_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  email: string;
  status: string;
  created_at: string;
  registered_by: string; // staff name
  expiry_date: string | null;
}

interface ActivityLog {
  id: number;
  time_in: string;
  time_out: string | null;
  purpose_of_visit: string;
}

const PatronProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patron, setPatron] = useState<Patron | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingPatron, setLoadingPatron] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<"date_asc" | "date_desc" | "">(
    ""
  );

  const filterRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Fetch Patron Details
  useEffect(() => {
    const fetchPatron = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const res = await AxiosInstance.get(`/patrons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatron(res.data);
      } catch (err) {
        console.error("Error fetching patron:", err);
      } finally {
        setLoadingPatron(false);
      }
    };
    fetchPatron();
  }, [id]);

  // Fetch Activity Logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const res = await AxiosInstance.get(`/patrons/${id}/activity-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivityLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, [id]);

  if (!patron && !loadingPatron) return <p>Patron not found.</p>;

  const fullName = patron
    ? [patron.first_name, patron.middle_name, patron.last_name, patron.suffix]
        .filter(Boolean)
        .join(" ")
    : "";

  // Close filter menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter + Sort Activity Logs
  const filteredLogs = activityLogs.filter((log) =>
    log.purpose_of_visit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortOption === "date_asc")
      return new Date(a.time_in).getTime() - new Date(b.time_in).getTime();
    if (sortOption === "date_desc")
      return new Date(b.time_in).getTime() - new Date(a.time_in).getTime();
    return 0;
  });

  return (
    <>
      <div className="patron-profile mt-4 mb-5">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">
            <span
              className="me-2"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/admin/accounts")}
            >
              <i className="bi bi-arrow-left"></i>
            </span>
            PATRON PROFILE
          </h1>
        </div>
        <div className="patron-profile d-flex justify-content-between align-items-center border">
          <div>
            <h4 className="mb-0">
              {loadingPatron ? (
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
            <small className="text-muted">Patron</small>
          </div>
          <div className="patron-actions">
            <span
              className="action-link text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/admin/patrons/${patron?.id}/edit`)}
            >
              Edit
            </span>
            {" | "}
            <span
              className="action-link text-warning"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to deactivate this user?"
                  )
                ) {
                  // Call your deactivate API here
                  console.log("User deactivated");
                }
              }}
            >
              Deactivate
            </span>
            {" | "}
            <span
              className="action-link text-danger"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to block this user?")
                ) {
                  // Call your block API here
                  console.log("User blocked");
                }
              }}
            >
              Block
            </span>
            {" | "}
            <span
              className="action-link text-secondary"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/admin/patrons/${patron?.id}/full-record`)
              }
            >
              View Full Record
            </span>
          </div>
        </div>

        {/* Account Information */}
        <div className="patron-profile border">
          <h4 className="mb-3">Account Information</h4>
          {loadingPatron ? (
            <LoadingSpinner />
          ) : (
            <table className="w-100 table-borderless text-center">
              <thead>
                <tr className="text-muted">
                  <th>Patron ID</th>
                  <th>Date Registered</th>
                  <th>Registered By</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{patron?.patron_id}</td>
                  <td>
                    {patron?.created_at
                      ? new Date(patron.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>{patron?.registered_by ?? "N/A"}</td>
                  <td>
                    {patron?.expiry_date
                      ? new Date(patron.expiry_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className={`status-pill status-${patron?.status?.toLowerCase()}`}
                    >
                      {patron?.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="patron-profile mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="mb-0">Activity Log</h2>
            <p className="mb-0">
              <i>Chronological list of activities made by the user.</i>
            </p>
          </div>

          <div className="d-flex gap-2 align-items-center">
            {/* Search */}
            <div className="position-relative" style={{ maxWidth: "300px" }}>
              <span
                className="position-absolute top-50 translate-middle-y ps-2"
                style={{ left: "10px", color: "#6c757d" }}
              >
                <i className="bi bi-search"></i>
              </span>
              <input
                className="form-control ps-5 pe-5"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter */}
            <div className="position-relative" ref={filterRef}>
              <button
                className="btn btn-outline-secondary d-flex align-items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterMenuOpen(!filterMenuOpen);
                }}
              >
                <i className="bi bi-sliders me-2"></i> Filter
              </button>

              {filterMenuOpen && (
                <div
                  className="dropdown-menu show"
                  style={{ position: "absolute", zIndex: 9999 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="dropdown-item"
                    onClick={() => setSortOption("date_asc")}
                  >
                    <i className="bi bi-sort-numeric-down"></i> Date Asc
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => setSortOption("date_desc")}
                  >
                    <i className="bi bi-sort-numeric-down"></i> Date Desc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-body">
          {loadingLogs ? (
            <LoadingSpinner />
          ) : sortedLogs.length > 0 ? (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Purpose of Visit</th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.time_in).toLocaleString()}</td>
                    <td>
                      {log.time_out
                        ? new Date(log.time_out).toLocaleString()
                        : "Not yet logged out"}
                    </td>
                    <td>{log.purpose_of_visit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No activity logs found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default PatronProfile;
