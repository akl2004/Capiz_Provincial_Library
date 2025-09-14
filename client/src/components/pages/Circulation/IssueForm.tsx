import { useState, useEffect } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { useNavigate } from "react-router-dom";

interface Patron {
  id: number;
  name: string;
  patron_id: string;
}

interface BookCopy {
  id: number;
  barcode: string;
  copy_number: number;
  book: {
    title: string;
    call_number: string;
  };
}

const IssueForm = () => {
  const [patronId, setPatronId] = useState("");
  const [patronInfo, setPatronInfo] = useState<Patron | null>(null);

  const [barcode, setBarcode] = useState("");
  const [bookInfo, setBookInfo] = useState<BookCopy | null>(null);

  const [issueDate, setIssueDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const [loanDays, setLoanDays] = useState<number>(5);

  const navigate = useNavigate();

  useEffect(() => {
    AxiosInstance.get("/settings/loan-days")
      .then((res) => setLoanDays(res.data.loan_days))
      .catch(() => setLoanDays(5));
  }, []);

  useEffect(() => {
    if (!patronId) {
      setPatronInfo(null);
      return;
    }
    const delayDebounce = setTimeout(() => {
      AxiosInstance.get(`/patrons/by-id/${patronId}`)
        .then((res) => setPatronInfo(res.data))
        .catch(() => setPatronInfo(null));
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [patronId]);

  useEffect(() => {
    if (issueDate && loanDays) {
      const issue = new Date(issueDate);
      issue.setDate(issue.getDate() + loanDays);
      setDueDate(issue.toISOString().split("T")[0]);
    }
  }, [issueDate, loanDays]);

  const fetchBookByBarcode = () => {
    if (!barcode) return;
    AxiosInstance.get(`/books/copy/${barcode}`)
      .then((res) => setBookInfo(res.data))
      .catch(() => {
        setBookInfo(null);
        alert("Book not found!");
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronInfo || !bookInfo || !issueDate) {
      alert("Please fill all fields!");
      return;
    }

    AxiosInstance.post("/circulations/borrow", {
      patron_id: patronInfo?.patron_id,
      book_copy_id: bookInfo.id,
    })
      .then(() => {
        alert("Book issued successfully!");
        navigate("/circulation");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="issue-form-container">
      <h1 className="form-title">📚 Issue Book</h1>

      <form onSubmit={handleSubmit} className="issue-form">
        {/* Top Section */}
        <div className="form-row">
          {/* Barcode */}
          <div className="form-group half">
            <label>Book Barcode</label>
            <div className="input-with-button">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan or enter barcode..."
              />
              <button type="button" onClick={fetchBookByBarcode}>
                Search
              </button>
            </div>
          </div>

          {/* Dates */}
          <div className="date-row">
            {/* Issue Date */}
            <div className="date-field">
              <label htmlFor="issue_date">Issue Date</label>
              <input
                type="date"
                id="issue_date"
                name="issue_date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            {/* Due Date */}
            <div className="date-field">
              <label htmlFor="due_date">Due Date</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Patron Section */}
        <div className="section-box">
          <h2>👤 Borrower</h2>
          <input
            type="text"
            value={patronId}
            onChange={(e) => setPatronId(e.target.value)}
            placeholder="Enter Patron ID..."
          />

          <div className="info-box">
            {patronInfo ? (
              <span className="success">{patronInfo.name}</span>
            ) : patronId ? (
              <span className="error">❌ Patron not found</span>
            ) : (
              <span className="placeholder">
                Patron info will appear here...
              </span>
            )}
          </div>
        </div>

        {/* Book Info Section */}
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

        {/* Submit */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/circulation")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Confirm Loan
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueForm;
