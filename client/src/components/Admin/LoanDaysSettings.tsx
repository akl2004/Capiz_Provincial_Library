import { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";

const LoanDaysSetting = () => {
  const [loanDays, setLoanDays] = useState(5);

  useEffect(() => {
    AxiosInstance.get("/settings/loan-days").then((res) => {
      setLoanDays(res.data.loan_days);
    });
  }, []);

  const handleSave = () => {
    AxiosInstance.post("/settings/loan-days", { loan_days: loanDays })
      .then(() => alert("Loan days updated successfully!"))
      .catch(() => alert("Failed to update loan days"));
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">📅 Loan Period Settings</h2>
      <label className="block font-semibold">Default Loan Days</label>
      <input
        type="number"
        value={loanDays}
        onChange={(e) => setLoanDays(parseInt(e.target.value))}
        className="w-full border px-3 py-2 rounded mb-4"
      />
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
};

export default LoanDaysSetting;
