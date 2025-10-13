import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { useNavigate } from "react-router-dom";

interface Patron {
  patron_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
}

interface BookCopy {
  id: number;
  barcode: string;
  copy_number: number;
  book: {
    title: string;
    call_number: string;
  };
  borrowed_by?: Patron;
  issue_date?: string;
  due_date?: string;
}

const RenewForm = () => {
  const [barcode, setBarcode] = useState("");
  const [bookInfo, setBookInfo] = useState<BookCopy | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [loanDays, setLoanDays] = useState<number>(5);

  const navigate = useNavigate();

  // Fetch default loan days from server
  useEffect(() => {
    AxiosInstance.get("/settings/loan-days")
      .then((res) => setLoanDays(res.data.loan_days))
      .catch(() => setLoanDays(5)); // fallback
  }, []);

  // Fetch borrowed book details by barcode
  const fetchBookByBarcode = () => {
    if (!barcode) return;
    setSearching(true);
    AxiosInstance.get(`/circulations/borrowed-book/${barcode}`)
      .then((res) => setBookInfo(res.data))
      .catch(() => {
        setBookInfo(null);
        setModalMessage("Book not found or not currently borrowed.");
      })
      .finally(() => setSearching(false));
  };

  const handleRenew = () => {
    if (!bookInfo || !bookInfo.borrowed_by) {
      alert("Please search for a borrowed book first!");
      return;
    }

    setRenewing(true);
    AxiosInstance.post("/circulations/renew", { book_copy_id: bookInfo.id })
      .then(() => {
        alert("✅ Book renewed successfully!");

        // Get role from localStorage (or wherever you store it)
        const role = localStorage.getItem("role") || "";

        if (role === "staff") {
          navigate("/staff/circulation");
        } else {
          navigate("/admin/circulation");
        }
      })
      .catch(() => setModalMessage("Failed to renew the book."))
      .finally(() => setRenewing(false));
  };


  const fullName = bookInfo?.borrowed_by
    ? [
        bookInfo.borrowed_by.first_name,
        bookInfo.borrowed_by.middle_name,
        bookInfo.borrowed_by.last_name,
        bookInfo.borrowed_by.suffix,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const renewalDate = new Date().toISOString().split("T")[0];
  const newDueDate = bookInfo?.due_date
    ? new Date(
        new Date(bookInfo.due_date).setDate(
          new Date(bookInfo.due_date).getDate() + loanDays
        )
      )
        .toISOString()
        .split("T")[0]
    : "";

  return (
    <div className="issue-form-container">
      <h1 className="form-title">🔄 Renew Book</h1>

      <form className="issue-form" onSubmit={(e) => e.preventDefault()}>
        {/* Barcode Input */}
        <div className="form-row">
          <div className="form-group half">
            <label>Book Barcode</label>
            <div className="input-with-button">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan or enter barcode..."
              />
              <button
                type="button"
                onClick={fetchBookByBarcode}
                disabled={searching}
              >
                {searching && <span className="spinner-tiny"></span>}
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Borrower Info */}
        <div className="section-box">
          <h2>👤 Borrower</h2>
          {bookInfo?.borrowed_by ? (
            <table className="info-table">
              <tbody>
                <tr>
                  <th>Patron ID</th>
                  <td>{bookInfo.borrowed_by.patron_id}</td>
                </tr>
                <tr>
                  <th>Name</th>
                  <td>{fullName}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <span className="placeholder">
              Borrower info will appear here after scanning a borrowed book...
            </span>
          )}
        </div>

        {/* Book Info */}
        <div className="section-box">
          <h2>📖 Book Information</h2>
          <table className="info-table">
            <tbody>
              <tr>
                <th>Title</th>
                <td>{bookInfo?.book.title || "N/A"}</td>
              </tr>
              <tr>
                <th>Call Number</th>
                <td>{bookInfo?.book.call_number || "N/A"}</td>
              </tr>
              <tr>
                <th>Copy Number</th>
                <td>{bookInfo?.copy_number || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Loan Details */}
        <div className="section-box">
          <h2>📚 Loan Details</h2>
          {bookInfo?.borrowed_by ? (
            <table className="info-table">
              <tbody>
                <tr>
                  <th>Original Issue Date</th>
                  <td>{bookInfo.issue_date}</td>
                </tr>
                <tr>
                  <th>Original Due Date</th>
                  <td>{bookInfo.due_date}</td>
                </tr>
                <tr>
                  <th>Renewal Date</th>
                  <td>{renewalDate}</td>
                </tr>
                <tr>
                  <th>New Issue Date</th>
                  <td>{renewalDate}</td>
                </tr>
                <tr>
                  <th>New Due Date</th>
                  <td>{newDueDate}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <span className="placeholder">
              Loan details will appear after scanning a borrowed book...
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/admin/circulation")}
            disabled={renewing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="submit-btn"
            onClick={handleRenew}
            disabled={renewing || searching}
          >
            {renewing && <span className="spinner-tiny"></span>}
            {renewing ? "Renewing..." : "Renew Book"}
          </button>
        </div>
      </form>

      {modalMessage && (
        <div className="modal-overlay" onClick={() => setModalMessage(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Notice</h2>
            <p>{modalMessage}</p>
            <button onClick={() => setModalMessage(null)} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenewForm;
