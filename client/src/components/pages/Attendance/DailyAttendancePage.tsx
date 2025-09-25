import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../LoadingSpinner";

interface Attendance {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  province: string;
  city: string;
  barangay: string;
  email?: string;
  number?: string;
  affiliation?: string;
  purpose_of_visit: string;
  time_in: string | null;
  time_out: string | null;
}

const DailyAttendancePage = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patronId: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    province: "",
    city: "",
    barangay: "",
    email: "",
    number: "",
    affiliation: "",
    purpose_of_visit: "",
  });

  const navigate = useNavigate();

  const location = useLocation();
  const isGuest = location.pathname.startsWith("/guest"); 

  useEffect(() => {
    fetchTodayAttendances();
  }, []);

  const fetchTodayAttendances = async () => {
    try {
      const res = await AxiosInstance.get("/attendances/today");
      setAttendances(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AxiosInstance.post("/attendances", form);
      setOpen(false);
      setForm({
        patronId: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        province: "",
        city: "",
        barangay: "",
        email: "",
        number: "",
        affiliation: "",
        purpose_of_visit: "",
      });
      fetchTodayAttendances();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeOut = async (id: number) => {
    try {
      await AxiosInstance.post(`/attendances/${id}/timeout`);
      fetchTodayAttendances();
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-fill by Patron ID (use patron_id, not internal id)
  const handlePatronIdChange = async (patronId: string) => {
    setForm((prev) => ({ ...prev, patronId }));

    if (!patronId) return;

    try {
      const res = await AxiosInstance.get(`/patrons/by-id/${patronId}`);
      const patron = res.data;

      setForm((prev) => ({
        ...prev,
        first_name: patron.first_name,
        middle_name: patron.middle_name || "",
        last_name: patron.last_name,
        suffix: patron.suffix || "",
        province: patron.province || "",
        city: patron.city || "",
        barangay: patron.barangay || "",
        email: patron.email || "",
        number: patron.number || "",
        // Keep the previous purpose and affiliation editable
        affiliation: prev.affiliation,
        purpose_of_visit: prev.purpose_of_visit,
      }));
    } catch (err) {
      console.error("Patron not found", err);
    }
  };

  // Filtered attendances
  const filteredAttendances = attendances.filter(
    (att) =>
      `${att.first_name} ${att.middle_name || ""} ${att.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      att.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${att.province} ${att.city} ${att.barangay}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      att.purpose_of_visit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="attendance-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="text-xl font-semibold mb-0">Today's Attendance</h1>
          <p className="mb-0">
            <i>View and manage all attendance records for today.</i>
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center">
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
          {!isGuest && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/admin/dailyattendance/attendance")}
            >
              View All Attendance
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => setOpen(true)}>
            + Time In
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Number</th>
              <th>Affiliation</th>
              <th>Purpose</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendances.map((att) => (
              <tr key={att.id}>
                <td>{`${att.first_name} ${att.middle_name || ""} ${
                  att.last_name
                } ${att.suffix || ""}`}</td>
                <td>{att.email || "-"}</td>
                <td>{`${att.barangay}, ${att.city}, ${att.province}`}</td>
                <td>{att.number || "-"}</td>
                <td>{att.affiliation || "-"}</td>
                <td>{att.purpose_of_visit}</td>
                <td>
                  {att.time_in ? new Date(att.time_in).toLocaleString() : "-"}
                </td>
                <td>
                  {att.time_out ? new Date(att.time_out).toLocaleString() : "-"}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      att.time_out ? "status-out" : "status-in"
                    }`}
                  >
                    {att.time_out ? "Timed Out" : "Timed In"}
                  </span>
                </td>
                <td>
                  {!att.time_out && (
                    <button
                      onClick={() => handleTimeOut(att.id)}
                      className="timeout-btn"
                    >
                      Time Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredAttendances.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-4">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button
              onClick={() => setOpen(false)}
              className="modal-close-btn"
              disabled={loading}
            >
              &times;
            </button>
            <h2>Guest Time In</h2>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <form onSubmit={handleSubmit} className="attendance-form">
                {/* Patron Section (optional) */}
                <div className="patron-section">
                  <label className="patronId">
                    Patron ID (optional)
                    <span
                      title="Only for registered patrons. Leave blank if you are a walk-in guest."
                      style={{ marginLeft: "5px", cursor: "help" }}
                    >
                      <i className="bi bi-info-circle"></i>
                    </span>
                  </label>
                  <input
                    id="patronId"
                    name="patronId"
                    value={form.patronId}
                    onChange={(e) => handlePatronIdChange(e.target.value)}
                    placeholder="Enter Patron ID..."
                    disabled={loading}
                  />
                </div>

                {/* Divider for visual separation */}
                <hr />

                {/* Name Row */}
                <div className="name-row mb-0">
                  <input
                    name="firstName"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                    disabled={loading}
                  />
                  <input
                    name="middleName"
                    value={form.middle_name}
                    onChange={handleChange}
                    placeholder="Middle Name"
                    disabled={loading}
                  />
                  <input
                    name="lastName"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                    disabled={loading}
                  />
                  <input
                    name="suffix"
                    value={form.suffix}
                    onChange={handleChange}
                    placeholder="Suffix"
                    disabled={loading}
                  />
                </div>

                {/* Address Row */}
                <div className="address-row mb-0">
                  <input
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    placeholder="Province"
                    required
                    disabled={loading}
                  />
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                    disabled={loading}
                  />
                  <input
                    name="barangay"
                    value={form.barangay}
                    onChange={handleChange}
                    placeholder="Barangay"
                    required
                    disabled={loading}
                  />
                </div>

                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  disabled={loading}
                />
                <input
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  required
                  disabled={loading}
                />
                <input
                  name="affiliation"
                  value={form.affiliation}
                  onChange={handleChange}
                  placeholder="Affiliation / Organization"
                  disabled={loading}
                />
                <textarea
                  name="purpose_of_visit"
                  value={form.purpose_of_visit}
                  onChange={handleChange}
                  placeholder="Purpose of Visit"
                  required
                  disabled={loading}
                />

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    Time In
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyAttendancePage;
