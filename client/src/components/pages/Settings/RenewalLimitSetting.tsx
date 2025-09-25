import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";

const RenewalLimitSetting = () => {
  const [renewalLimit, setRenewalLimit] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch current renewal limit
  useEffect(() => {
    const fetchLimit = async () => {
      try {
        const res = await AxiosInstance.get("/settings/renewal-limit");
        setRenewalLimit(res.data.renewal_limit);
      } catch (error) {
        console.error("Failed to fetch renewal limit", error);
      }
    };
    fetchLimit();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await AxiosInstance.post("/settings/renewal-limit", {
        renewal_limit: renewalLimit,
      });
      setMessage("✅ " + res.data.message);
    } catch (error) {
      setMessage("⚠️ Error updating renewal limit");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRenewalLimit(2);
    setMessage(null);
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <h1 className="text-xl font-semibold mb-0">📌 Renewal Limit Setting</h1>
      <p className="settings-subtext">
        <i>
          Set the maximum number of times a patron can renew borrowed items.
        </i>
      </p>

      {/* Form Section */}
      <div className="settings-form">
        <label>Renewal Limit (times)</label>
        <input
          type="number"
          value={renewalLimit}
          onChange={(e) => setRenewalLimit(parseInt(e.target.value))}
          min={1}
          max={10}
        />
      </div>

      {/* Actions */}
      <div className="settings-actions">
        <button
          onClick={handleSave}
          className="btn btn-save"
          disabled={loading}
        >
          {loading ? (
            "Saving..."
          ) : (
            <>
              <i className="bi bi-save me-1"></i> Save
            </>
          )}
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

export default RenewalLimitSetting;
