import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";

const FineSetting = () => {
  const [finePerDay, setFinePerDay] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    AxiosInstance.get("/settings/fine-per-day")
      .then((res) => setFinePerDay(res.data.fine_per_day))
      .catch(() => setMessage("⚠️ Failed to load fine settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setMessage("");
    AxiosInstance.post("/settings/fine-per-day", { fine_per_day: finePerDay })
      .then((res) => setMessage("✅ " + res.data.message))
      .catch(() => setMessage("⚠️ Failed to update fine per day"));
  };

  const handleReset = () => {
    setFinePerDay(5);
    setMessage("");
  };

  if (loading) return <p>Loading fine settings...</p>;

  return (
    <div className="settings-container">
      {/* Header */}
      <h1 className="text-xl font-semibold mb-0">Fine Per Day Setting</h1>
      <p className="settings-subtext">
        <i>Set the amount charged per day for overdue items.</i>
      </p>

      {/* Form Section */}
      <div className="settings-form">
        <label>Fine Per Day (₱)</label>
        <input
          type="number"
          value={finePerDay}
          onChange={(e) => setFinePerDay(Number(e.target.value))}
          min={1}
          max={100}
        />
      </div>

      {/* Actions */}
      <div className="settings-actions">
        <button onClick={handleSave} className="btn btn-save">
          <i className="bi bi-save me-1"></i> Save
        </button>
        <button onClick={handleReset} className="btn btn-reset">
          Reset
        </button>
      </div>

      {/* Feedback message */}
      {message && <p className="settings-message mt-3">{message}</p>}
    </div>
  );
};

export default FineSetting;
