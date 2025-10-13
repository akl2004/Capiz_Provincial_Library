import { useState, useEffect } from "react";
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
  overdue_by?: number;
  fine?: number;
}

const ReturnForm = () => {
  const [barcode, setBarcode] = useState("");
  const [bookInfo, setBookInfo] = useState<BookCopy | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showOverdueModal, setShowOverdueModal] = useState(false);

  const navigate = useNavigate();

  // Error modal
  const ErrorModal = ({
    message,
    onClose,
  }: {
    message: string;
    onClose: () => void;
  }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">⚠️ Notice</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Overdue modal
  const OverdueModal = ({
    book,
    patron,
    overdue_by,
    fine,
    onClose,
    onPay,
  }: {
    book: BookCopy;
    patron: Patron;
    overdue_by: number;
    fine: number;
    onClose: () => void;
    onPay: () => void;
  }) => {
    const fullName = [
      patron.first_name,
      patron.middle_name,
      patron.last_name,
      patron.suffix,
    ]
      .filter(Boolean)
      .join(" ");

    const overdueDays = Math.floor(overdue_by);

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <h3 className="modal-title">⚠️ Overdue Notice</h3>

          <div className="modal-content">
            <p>
              This item is <b>OVERDUE</b> by <b>{overdueDays}</b> day
              {overdueDays > 1 ? "s" : ""}. A fine of <b>₱{fine.toFixed(2)}</b>{" "}
              (₱
              {(fine / overdueDays).toFixed(2)}/day) has been applied. Pay fine to proceed.
            </p>

            <hr className="modal-divider" />

            <div className="modal-info">
              <p>
                <b>Title:</b> {book.book.title}
              </p>
              <p>
                <b>Copy Number:</b> {book.copy_number}
              </p>
              <p>
                <b>Borrower:</b> {fullName}
              </p>
            </div>

            <div className="form-actions">
              <button className="submit-btn" onClick={onPay}>
                Pay Fine
              </button>
              <button className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  useEffect(() => {
    document.title = "Return Form";
  }, []);

  const fetchBookByBarcode = () => {
    if (!barcode) return;

    AxiosInstance.get(`/circulations/borrowed-book/${barcode}`)
      .then((res) => {
        setBookInfo(res.data);

        // Show overdue modal if fine exists
        if (res.data.overdue_by && res.data.overdue_by > 0) {
          setShowOverdueModal(true);
        }
      })
      .catch((err) => {
        setBookInfo(null);
        setModalMessage(err.response?.data?.message || "Book not found!");
      });
  };

  const handleReturn = () => {
    if (!bookInfo) {
      alert("Please search for a borrowed book first!");
      return;
    }

    AxiosInstance.post("/circulations/return", { book_copy_id: bookInfo.id })
      .then(() => {
        alert("✅ Book returned successfully!");
        const role = localStorage.getItem("role")?.toLowerCase();
        if (role === "admin") navigate("/admin/circulation");
        else if (role === "staff") navigate("/staff/circulation");
        else navigate("/");
      })
      .catch((err: any) => {
        setModalMessage(err.response?.data?.message || "Something went wrong.");
      });
  };

  const handlePayFine = () => {
    if (!bookInfo || !bookInfo.borrowed_by || !bookInfo.fine) return;

    const amountToPay = bookInfo.fine;

    AxiosInstance.post("/patrons/pay-fine", {
      patron_id: bookInfo.borrowed_by.patron_id,
      amount: amountToPay,
    })
      .then(() => {
        alert(
          `✅ ₱${amountToPay.toFixed(
            2
          )} has been deducted from the patron's account.`
        );
        // Update local state to clear fine
        setBookInfo({ ...bookInfo, fine: 0, overdue_by: 0 });
        setShowOverdueModal(false);
      })
      .catch(() => {
        alert("❌ Failed to pay fine. Please try again.");
      });
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

  return (
    <div className="issue-form-container">
      <h1 className="form-title">📚 Return Book</h1>

      <form className="issue-form" onSubmit={(e) => e.preventDefault()}>
        {/* Barcode */}
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
              <button type="button" onClick={fetchBookByBarcode}>
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Patron Info */}
        <div className="section-box">
          <h2>👤 Borrower Information</h2>
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
              Patron info will appear here after scanning a borrowed book...
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

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/admin/circulation")}
          >
            Cancel
          </button>
          <button type="button" className="submit-btn" onClick={handleReturn}>
            Return Book
          </button>
        </div>
      </form>

      {/* Modals */}
      {modalMessage && (
        <ErrorModal
          message={modalMessage}
          onClose={() => setModalMessage(null)}
        />
      )}
      {showOverdueModal && bookInfo && bookInfo.overdue_by && bookInfo.fine && (
        <OverdueModal
          book={bookInfo}
          patron={bookInfo.borrowed_by!}
          overdue_by={bookInfo.overdue_by}
          fine={bookInfo.fine}
          onClose={() => setShowOverdueModal(false)}
          onPay={handlePayFine}
        />
      )}
    </div>
  );
};

export default ReturnForm;
