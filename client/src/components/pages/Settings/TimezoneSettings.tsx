import React, { useState, useEffect } from "react";
import timezones from "../../../data/timezones/timezones.json"; 
import AxiosInstance from "../../../AxiosInstance";


const TimezoneSettings: React.FC = () => {
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Manila");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTimezone = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await AxiosInstance.get("/settings/timezone", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedTimezone(res.data.default_timezone);
      } catch (err) {
        console.error("Error fetching timezone:", err);
      }
    };
    fetchTimezone();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      await AxiosInstance.post(
        "/settings/timezone",
        { timezone: selectedTimezone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Timezone updated successfully!");
    } catch (err) {
      console.error("Error updating timezone:", err);
      setMessage("Failed to update timezone.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <h1>Timezone Settings</h1>
      <div className="timezone-select">
        <label>Select Default Timezone:</label>
        <select
          value={selectedTimezone}
          onChange={(e) => setSelectedTimezone(e.target.value)}
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.text}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TimezoneSettings;
