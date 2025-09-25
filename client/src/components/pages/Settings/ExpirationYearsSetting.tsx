import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../LoadingSpinner";

const ExpirationYearsSetting = () => {
  const [expirationYears, setExpirationYears] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch current expiration years
  useEffect(() => {
    const fetchExpirationYears = async () => {
      try {
        const res = await AxiosInstance.get("/settings/expiration-years");
        const years = Number(res.data.expiration_years);
        setExpirationYears(Number.isInteger(years) ? years : 3);
      } catch (err) {
        setMessage("⚠️ Failed to load expiration years");
      } finally {
        setLoading(false);
      }
    };

    fetchExpirationYears();
  }, []);

  // Handle input changes safely
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 10) {
      setExpirationYears(value);
    } else if (e.target.value === "") {
      // Allow clearing input temporarily without breaking
      setExpirationYears(0);
    }
  };

  // Save updated expiration years
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await AxiosInstance.post("/settings/expiration-years", {
        expiration_years: Number(expirationYears) || 3,
      });
      setMessage("✅ Expiration years updated successfully!");
    } catch {
      setMessage("⚠️ Failed to update expiration years");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleReset = () => {
    setExpirationYears(3);
    setMessage(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="settings-container">
      <h1 className="text-xl font-semibold mb-0">Patron Expiration Settings</h1>
      <p className="settings-subtext">
        <i>
          Configure how many years a patron’s account remains valid before
          requiring renewal.
        </i>
      </p>

      <div className="settings-form">
        <label>Default Expiration (Years)</label>
        <input
          type="number"
          value={expirationYears > 0 ? expirationYears : ""}
          onChange={handleChange}
          min={1}
          max={10}
        />
      </div>

      <div className="settings-actions">
        <button
          onClick={handleSave}
          className="btn btn-save flex items-center justify-center"
          disabled={saving}
        >
          {saving ? (
            <LoadingSpinner message="Saving..." />
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

      {message && <p className="settings-message mt-3">{message}</p>}
    </div>
  );
};

export default ExpirationYearsSetting;
