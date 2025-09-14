import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../LoadingSpinner";

interface Patron {
  patron_id?: string;
  name: string;
  email: string;
  barangay?: string;
  municipality: string;
  province: string;
  number?: string;
  status?: string;
  age?: number;
  notes?: string;
  expiry_date?: string;
}

const PatronInfo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patron, setPatron] = useState<Patron | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    AxiosInstance.get(`/patrons/${id}`)
      .then((res) => setPatron(res.data))
      .catch((err) => console.error("Failed to fetch patron info", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!patron) return <p>Patron not found.</p>;

  return (
    <div>
      <button
        onClick={() => navigate("/patrons")}
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Patron Record</h1>
      <table className="table-auto border border-gray-300 w-full">
        <tbody>
          {Object.entries({
            "Patron ID": patron.patron_id || "-",
            Name: patron.name,
            Email: patron.email,
            Barangay: patron.barangay || "-",
            Municipality: patron.municipality,
            Province: patron.province,
            Number: patron.number || "-",
            Status: patron.status || "-",
            Age: patron.age ?? "-",
            Notes: patron.notes || "-",
            "Expiry Date": patron.expiry_date || "-",
          }).map(([key, value]) => (
            <tr key={key} className="border">
              <td className="font-semibold border px-4 py-2">{key}</td>
              <td className="border px-4 py-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatronInfo;
