import { useState, useEffect } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { useNavigate } from "react-router-dom";

interface Patron {
  id: number;
  patron_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  status: "Active" | "Deactivated" | "Blocked"; // add status
}

interface BookCopy {
  id: number;
  barcode: string;
  copy_number: number;
  status: "available" | "borrowed"; // add status
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

  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  
  const ErrorModal = ({
    message,
    onClose,
  }: {
    message: string;
    onClose: () => void;
  }) => {
    return (
      <div
        className="modal-overlay"
        onClick={onClose} // close when clicking outside
      >
        <div
          className="modal-box"
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        >
          <h2>⚠️ Error</h2>
          <p>{message}</p>
          <button
            onClick={onClose}
            className="close-btn"
          >
            x
          </button>
        </div>
      </div>
    );
  };



  const fullName = [
    patronInfo?.first_name,
    patronInfo?.middle_name,
    patronInfo?.last_name,
    patronInfo?.suffix,
  ]
    .filter(Boolean)
    .join(" ");

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
      .then((res) => {
        if (res.data.status === "borrowed") {
          setBookInfo(null);
          setModalMessage(
            "This book copy is currently borrowed and unavailable."
          );
        } else {
          setBookInfo(res.data);
        }
      })
      .catch(() => {
        setBookInfo(null);
        setModalMessage("Book not found!");
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronInfo || !bookInfo || !issueDate) {
      alert("Please fill all fields!");
      return;
    }

    AxiosInstance.post("/circulations/borrow", {
      patron_id: patronInfo.patron_id,
      book_copy_id: bookInfo.id,
    })
      .then(() => {
        alert("✅ Book issued successfully!"); // you can also convert this to a success modal later
        navigate("/admin/circulation");
      })
      .catch((err: any) => {
        if (err.response) {
          if (err.response.status === 403) {
            setModalMessage(
              "Cannot issue book: Patron is deactivated or blocked."
            );
          } else if (err.response.status === 400) {
            setModalMessage("Cannot issue book: Book is already borrowed.");
          } else {
            setModalMessage("Something went wrong. Please try again.");
          }
        } else {
          setModalMessage("Network error or server not reachable.");
        }
      });
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
              <span className="success">{fullName}</span>
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
            onClick={() => navigate("/admin/circulation")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Confirm Loan
          </button>
        </div>
      </form>
      {/* Render the modal inside the return */}
      {modalMessage && (
        <ErrorModal
          message={modalMessage}
          onClose={() => setModalMessage(null)}
        />
      )}
    </div>
  );
};

export default IssueForm;
