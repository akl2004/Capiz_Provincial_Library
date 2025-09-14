import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { useNavigate } from "react-router-dom";

import provinceListData from "../../../data/ph_addresses/province.json";
import cityListData from "../../../data/ph_addresses/city.json";
import barangayListData from "../../../data/ph_addresses/barangay.json";

const provinceList = provinceListData as Province[];
const cityList = cityListData as City[];
const barangayList = barangayListData as Barangay[];

// Types
interface Province {
  province_code: string;
  province_name: string;
  region_code: string;
}

interface City {
  city_code: string;
  city_name: string;
  province_code: string;
}

interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
  province_code: string;
}

interface Patron {
  id: number;
  patron_id: string;
  name: string;
  status: string;
  registration_date: string;
  address: string;
  age: string;
  created_at: string;
}

// ✅ Add Patron Modal
const AddPatronModal: React.FC<{ onClose: () => void; onSave: () => void }> = ({
  onClose,
  onSave,
}) => {
  const [patronId, setPatronId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [age, setAge] = useState("");

  // Address parts
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");

  // Suggestions
  const [provinceSuggestions, setProvinceSuggestions] = useState<Province[]>(
    []
  );
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [barangaySuggestions, setBarangaySuggestions] = useState<Barangay[]>(
    []
  );

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

  // Suggestion handlers
  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setProvinceSuggestions(
      provinceList
        .filter((p) =>
          p.province_name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 4)
    );
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    const selectedProvince = provinceList.find(
      (p) => p.province_name.toLowerCase() === province.toLowerCase()
    );
    if (!selectedProvince) return setCitySuggestions([]);
    setCitySuggestions(
      cityList
        .filter(
          (c) =>
            c.province_code === selectedProvince.province_code &&
            c.city_name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 4)
    );
  };

  const handleBarangayChange = (value: string) => {
    setBarangay(value);
    const selectedCity = cityList.find(
      (c) => c.city_name.toLowerCase() === city.toLowerCase()
    );
    if (!selectedCity) return setBarangaySuggestions([]);
    setBarangaySuggestions(
      barangayList
        .filter(
          (b) =>
            b.city_code === selectedCity.city_code &&
            b.brgy_name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 4)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AxiosInstance.post("/patrons", {
        patron_id: patronId,
        name,
        email,
        number,
        age,
        address: `${barangay}, ${city}, ${province}`,
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
            <label>Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
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

          {/* Province, City, Barangay */}
          <div className="address-row">
            {/* Province */}
            <div className="relative">
              <label>Province</label>
              <input
                type="text"
                value={province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                required
              />
              {provinceSuggestions.length > 0 && (
                <ul className="suggestion-list">
                  {provinceSuggestions.map((p) => (
                    <li
                      key={p.province_code}
                      className="suggestion-item"
                      onClick={() => {
                        setProvince(p.province_name);
                        setProvinceSuggestions([]);
                      }}
                    >
                      {p.province_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* City */}
            <div className="relative">
              <label>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                required
              />
              {citySuggestions.length > 0 && (
                <ul className="suggestion-list">
                  {citySuggestions.map((c) => (
                    <li
                      key={c.city_code}
                      className="suggestion-item"
                      onClick={() => {
                        setCity(c.city_name);
                        setCitySuggestions([]);
                      }}
                    >
                      {c.city_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Barangay */}
            <div className="relative">
              <label>Barangay</label>
              <input
                type="text"
                value={barangay}
                onChange={(e) => handleBarangayChange(e.target.value)}
                required
              />
              {barangaySuggestions.length > 0 && (
                <ul className="suggestion-list">
                  {barangaySuggestions.map((b) => (
                    <li
                      key={b.brgy_code}
                      className="suggestion-item"
                      onClick={() => {
                        setBarangay(b.brgy_name);
                        setBarangaySuggestions([]);
                      }}
                    >
                      {b.brgy_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="long">Contact Number</label>
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatrons();
  }, []);

  return (
    <div className="copies-info mt-4">
      <h1 className="text-xl font-semibold mb-4">Patron Records</h1>

      <button onClick={() => setShowModal(true)}>+ Add Patron</button>

      {patrons.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Patron ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {patrons.map((patron) => (
              <tr
                key={patron.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/patrons/${patron.id}`)}
              >
                <td>{patron.patron_id || "N/A"}</td>
                <td>{patron.name || "N/A"}</td>
                <td>{patron.status || "N/A"}</td>
                <td>{new Date(patron.created_at).toLocaleDateString()}</td>
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
