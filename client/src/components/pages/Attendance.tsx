import { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";

interface Attendance {
  id: number;
  name: string;
  gender: string;
  email?: string;
  address?: string;
  purpose_of_visit: string;
  time_in: string | null;
  time_out: string | null;
}

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gender: "",
    email: "",
    address: "",
    purpose_of_visit: "",
  });

  // Fetch attendances
  const fetchAttendances = async () => {
    try {
      const res = await AxiosInstance.get("/attendances");
      setAttendances(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, []);

  // Form input handler
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit Time In
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AxiosInstance.post("/attendances", form);
      setOpen(false);
      setForm({
        name: "",
        gender: "",
        email: "",
        address: "",
        purpose_of_visit: "",
      });
      fetchAttendances();
    } catch (err) {
      console.error(err);
    }
  };

  // Time Out
  const handleTimeOut = async (id: number) => {
    try {
      await AxiosInstance.post(`/attendances/${id}/timeout`);
      fetchAttendances();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="attendance-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1>Library Attendance</h1>
        <button
          onClick={() => setOpen(true)}
          className="attendance-form button"
        >
          + Time In
        </button>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>Email</th>
              <th>Address</th>
              <th>Purpose</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((att) => (
              <tr key={att.id}>
                <td>{att.name}</td>
                <td className="capitalize">{att.gender}</td>
                <td>{att.email || "-"}</td>
                <td>{att.address || "-"}</td>
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
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button onClick={() => setOpen(false)} className="modal-close-btn">
              &times;
            </button>
            <h2>Guest Time In</h2>
            <form onSubmit={handleSubmit} className="attendance-form">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                required
              />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled style={{ color: "#888" }}>
                  Select Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
              />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
              />
              <textarea
                name="purpose_of_visit"
                value={form.purpose_of_visit}
                onChange={handleChange}
                placeholder="Purpose of Visit"
                required
              />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="submit-btn">
                  Time In
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="submit-btn bg-gray-400 hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
