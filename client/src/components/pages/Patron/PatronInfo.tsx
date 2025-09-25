import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../LoadingSpinner";

interface Patron {
  patron_id?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  email: string;
  barangay?: string;
  city: string;
  province: string;
  number?: string;
  status?: string;
  age?: number;
  gender?: string;
  notes?: string;
  created_at?: string;
  expiry_date?: string;
}

interface PatronStats {
  borrowedBooks: number;
  returnedBooks: number;
  totalFine: number | null;
  overdueBooks: number;
}

const PatronInfo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patron, setPatron] = useState<Patron | null>(null);
  const [stats, setStats] = useState<PatronStats | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toISOString().split("T")[0]; // YYYY-MM-DD
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    AxiosInstance.get(`/patrons/${id}`)
      .then((res) => setPatron(res.data))
      .catch((err) => console.error("Failed to fetch patron info", err));

    AxiosInstance.get(`/patrons/${id}/stats`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to fetch patron stats", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!patron) return <p>Patron not found.</p>;

  const fullName = [
    patron.first_name,
    patron.middle_name,
    patron.last_name,
    patron.suffix,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <button
        onClick={() => navigate("/admin/patrons")}
        className="py-2 px-4 mb-4 bg-gray-200 hover:bg-gray-300 rounded"
      >
        ← Back
      </button>

      <div className="patron-container">
        {/* Patron Info */}
        <div className="patron-record">
          <h1 className="text-xl font-semibold mb-0">Patron Record</h1>
          <p className="mb-6 text-gray-600">
            <i>Holds the recorded information of the patron</i>
          </p>

          <table>
            <tbody>
              {Object.entries({
                "Patron ID": patron.patron_id || "-",
                Name: fullName,
                Age: patron.age ?? "-",
                Address:
                  [patron.barangay, patron.city, patron.province]
                    .filter(Boolean)
                    .join(", ") || "-",
                Gender: patron.gender ?? "-",
                Number: patron.number || "-",
                Email: patron.email,
                Status: patron.status || "-",
                "Registration Date": formatDate(patron.created_at),
                "Expiry Date": formatDate(patron.expiry_date),
                Notes: patron.notes || "-",
              }).map(([key, value]) => (
                <tr key={key}>
                  <td className="key">{key}</td>
                  <td className="value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Patron Stats */}
        <div className="patron-stats">
          <div className="stat-card">
            <div className="stat-header">
              <i className="bi bi-book me-3"></i> TOTAL BORROWED
            </div>
            <div className="stat-body">
              <span className="stat-number">{stats?.borrowedBooks ?? 0}</span>
              <span className="stat-label">/ borrowed materials</span>
            </div>
            <div className="stat-footer">
              Represents total books borrowed to date.
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <i className="bi bi-inboxes me-3"></i> TOTAL RETURNED
            </div>
            <div className="stat-body">
              <span className="stat-number">{stats?.returnedBooks ?? 0}</span>
              <span className="stat-label">
                /{stats?.borrowedBooks ?? 0} returned materials
              </span>
            </div>
            <div className="stat-footer">
              Represents total books returned to date.
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <i className="bi bi-alarm me-3"></i> OVERDUE INCIDENTS
            </div>
            <div className="stat-body">
              <span className="stat-number">{stats?.overdueBooks ?? 0}</span>
              <span className="stat-label">
                /{stats?.borrowedBooks ?? 0} borrow incidents
              </span>
            </div>
            <div className="stat-footer">
              Indicates frequency of overdue returns.
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <i className="bi bi-cash me-3"></i> TOTAL FINE
            </div>
            <div className="stat-body">
              <span className="stat-number">
                ₱{(Number(stats?.totalFine) || 0).toFixed(2)}
              </span>
            </div>

            <div className="stat-footer">
              Total penalties incurred by the patron.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatronInfo;
