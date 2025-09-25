import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";

const LoanDaysSetting = () => {
  const [loanDays, setLoanDays] = useState(5);

  useEffect(() => {
    AxiosInstance.get("/settings/loan-days")
      .then((res) => setLoanDays(res.data.loan_days))
      .catch(() => alert("Failed to load loan days"));
  }, []);

  const handleSave = () => {
    AxiosInstance.post("/settings/loan-days", { loan_days: loanDays })
      .then(() => alert("Loan days updated successfully!"))
      .catch(() => alert("Failed to update loan days"));
  };

  const handleReset = () => {
    setLoanDays(5);
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <h1 className="text-xl font-semibold mb-0">Loan Period Settings</h1>
      <p className="settings-subtext">
        <i>Set the default number of days a patron can borrow items.</i>
      </p>

      {/* Form Section */}
      <div className="settings-form">
        <label>Default Loan Days</label>
        <input
          type="number"
          value={loanDays}
          onChange={(e) => setLoanDays(parseInt(e.target.value))}
          min={1}
          max={30}
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
    </div>
  );
};

export default LoanDaysSetting;
