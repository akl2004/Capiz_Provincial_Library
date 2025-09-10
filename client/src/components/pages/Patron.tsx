import { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";

interface Patron {
  id: number;
  patron_id: string;
  name: string;
  email: string;
  address: string;
  number: string;
}

// ✅ Add Patron Modal
const AddPatronModal: React.FC<{ onClose: () => void; onSave: () => void }> = ({
  onClose,
  onSave,
}) => {
  const [patronId, setPatronId] = useState<string>(""); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");

  // ✅ Fetch a new Patron ID when modal opens
  useEffect(() => {
    const fetchPatronId = async () => {
      try {
        const response = await AxiosInstance.get("/patrons/generate-id");
        setPatronId(response.data.patron_id);
      } catch (error) {
        console.error("Error fetching Patron ID:", error);
      }
    };
    fetchPatronId();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AxiosInstance.post("/patrons", {
        patron_id: patronId,
        name,
        email,
        address,
        number,
      });
      onSave(); 
      onClose();
    } catch (error) {
      console.error("Error adding patron:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button onClick={onClose} className="modal-close-btn">
          &times;
        </button>
        <h2>Add Patron</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Patron ID</label>
            <input type="text" value={patronId} disabled />
          </div>
          <div className="mb-3">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Contact Number</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Save Patron
          </button>
        </form>
      </div>
    </div>
  );
};

// ✅ Patron Table Page
const Patron = () => {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchPatrons = async () => {
    try {
      const response = await AxiosInstance.get("/patrons");
      setPatrons(response.data);
    } catch (error) {
      console.error("Error fetching patrons:", error);
    }
  };

  useEffect(() => {
    fetchPatrons();
  }, []);

  return (
    <div className="copies-info mt-4">
      <h1 className="text-xl font-semibold mb-4">Patron Records</h1>

      <button onClick={() => setShowModal(true)}>
        + Add Patron
      </button>

      {patrons.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Patron ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Contact Number</th>
            </tr>
          </thead>
          <tbody>
            {patrons.map((patron) => (
              <tr key={patron.id}>
                <td>{patron.patron_id || "N/A"}</td>
                <td>{patron.name || "N/A"}</td>
                <td>{patron.email || "N/A"}</td>
                <td>{patron.address || "N/A"}</td>
                <td>{patron.number || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No patrons found.</p>
      )}

      {showModal && (
        <AddPatronModal
          onClose={() => setShowModal(false)}
          onSave={fetchPatrons}
        />
      )}
    </div>
  );
};

export default Patron;
