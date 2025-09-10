import { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";

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


  // Auto-fetch patron info whenever patronId changes
  useEffect(() => {
    if (!patronId) {
      setPatronInfo(null);
      return;
    }

    const delayDebounce = setTimeout(() => {
      AxiosInstance.get(`/patrons/by-id/${patronId}`)
        .then((res) => setPatronInfo(res.data))
        .catch(() => setPatronInfo(null));
    }, 500); // ⏳ wait 0.5s after typing

    return () => clearTimeout(delayDebounce);
  }, [patronId]);

  // Auto-calc dates: dueDate = issueDate + 5 days
  useEffect(() => {
    if (issueDate) {
      const issue = new Date(issueDate);
      issue.setDate(issue.getDate() + 5);
      setDueDate(issue.toISOString().split("T")[0]);
    }
  }, [issueDate]);

  // Fetch book by barcode
  const fetchBookByBarcode = () => {
    if (!barcode) return;
    AxiosInstance.get(`/books/copy/${barcode}`) // <-- backend must support this route
      .then((res) => setBookInfo(res.data))
      .catch(() => {
        setBookInfo(null);
        alert("Book not found!");
      });
  };

  // Submit Issue
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronInfo || !bookInfo || !issueDate) {
      alert("Please fill all fields!");
      return;
    }

    AxiosInstance.post("/circulations", {
      patron_id: patronInfo?.patron_id,
      book_copy_id: bookInfo.id,
      issue_date: issueDate,
      due_date: dueDate,
    })
      .then(() => {
        alert("Book issued successfully!");
        setBarcode("");
        setBookInfo(null);
        setIssueDate("");
        setDueDate("");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">📚 Issue Book</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          {/* Left: Barcode */}
          <div className="w-1/2 pr-4">
            <label className="block font-semibold">Book Barcode</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Scan or enter barcode..."
              />
              <button
                type="button"
                onClick={fetchBookByBarcode}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right: Dates */}
          <div className="w-1/2 pl-4">
            <label className="block font-semibold">Issue Date</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-2"
            />
            <label className="block font-semibold">Due Date</label>
            <input
              type="date"
              value={dueDate}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>
        </div>

        {/* Patron Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">👤 Borrower</h2>
          <input
            type="text"
            value={patronId}
            onChange={(e) => setPatronId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-2"
            placeholder="Enter Patron ID..."
          />

          <input
            type="text"
            value={patronInfo?.name || (patronId ? "❌ Patron not found" : "")}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-red-600"
            placeholder="Patron name will appear here..."
          />
        </div>

        {/* Book Info Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">📖 Book Information</h2>
          <table className="w-full border">
            <tbody>
              <tr>
                <th className="text-left p-2 border-r w-1/3">Title</th>
                <td className="p-2">{bookInfo?.book.title || "N/A"}</td>
              </tr>
              <tr>
                <th className="text-left p-2 border-r">Call Number</th>
                <td className="p-2">{bookInfo?.book.call_number || "N/A"}</td>
              </tr>
              <tr>
                <th className="text-left p-2 border-r">Copy Number</th>
                <td className="p-2">{bookInfo?.copy_number || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full font-semibold"
        >
          ✅ Issue Book
        </button>
      </form>
    </div>
  );
};

export default IssueForm;
