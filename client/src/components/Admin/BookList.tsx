import React, { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";
import Barcode from "react-barcode";

interface BookCopy {
  id: number;
  accession_number: string;
  barcode: string;
  status: string;
  date_added: string;
}

interface Book {
  id: number;
  title: string;
  authors: string[];
  edition: string | null;
  volume: string | null;
  publication: string | null;
  date_published: string | null;
  call_number: string;
  isbn: string | null;
  dewey_decimal: string;
  copies: BookCopy[];
}

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedBooks, setExpandedBooks] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deweyFilter, setDeweyFilter] = useState<string>("all");

  useEffect(() => {
    AxiosInstance.get("/books")
      .then((res) => {
        setBooks(res.data);
        setFilteredBooks(res.data);
      })
      .catch(() => setError("Failed to fetch books"))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedBooks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleSearchAndFilter = () => {
    let filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.authors.some((author) =>
          author.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        (book.isbn && book.isbn.includes(searchTerm))
    );

    if (deweyFilter !== "all") {
      filtered = filtered.filter((book) => {
        if (!book.dewey_decimal) return false;
        const mainNumber = parseInt(book.dewey_decimal.split(".")[0], 10);
        const filterNumber = parseInt(deweyFilter, 10);
        return Math.floor(mainNumber / 100) * 100 === filterNumber;
      });
    }

    setFilteredBooks(filtered);
  };

  useEffect(() => {
    handleSearchAndFilter();
  }, [searchTerm, deweyFilter, books]);

  if (loading) return <p>Loading books...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 950, margin: "20px auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Library Books</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 5,
            border: "1px solid #ccc",
          }}
        />
        <select
          value={deweyFilter}
          onChange={(e) => setDeweyFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: "1px solid #ccc" }}
        >
          <option value="all">All Classes</option>
          <option value="000">000 – General Works</option>
          <option value="100">100 – Philosophy & Psychology</option>
          <option value="200">200 – Religion</option>
          <option value="300">300 – Social Sciences</option>
          <option value="400">400 – Language</option>
          <option value="500">500 – Natural Sciences & Math</option>
          <option value="600">600 – Technology</option>
          <option value="700">700 – Arts & Recreation</option>
          <option value="800">800 – Literature</option>
          <option value="900">900 – History & Geography</option>
        </select>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredBooks.map((book) => {
          const callParts = book.call_number.split("\n");
          return (
            <li
              key={book.id}
              style={{
                display: "flex",
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 15,
                marginBottom: 15,
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                transition: "all 0.2s",
                alignItems: "flex-start",
              }}
            >
              {/* Left: Call Number */}
              <div
                style={{
                  flex: "0 0 80px",
                  textAlign: "center",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  lineHeight: 1.4,
                  borderRight: "1px solid #eee",
                  paddingRight: 10,
                }}
              >
                {callParts.map((part, i) => (
                  <div key={i}>{part}</div>
                ))}
              </div>

              {/* Middle: Book Details */}
              <div style={{ flex: 1, paddingLeft: 15 }}>
                <h3 style={{ margin: "0 0 5px 0" }}>{book.title}</h3>
                <p style={{ margin: "2px 0" }}>
                  <strong>Authors:</strong> {book.authors.join(", ")}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>Edition:</strong> {book.edition || "N/A"} |{" "}
                  <strong>Volume:</strong> {book.volume || "N/A"}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>Publication:</strong> {book.publication || "N/A"} |{" "}
                  <strong>Date:</strong> {book.date_published || "N/A"}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>Copies:</strong> {book.copies.length} |{" "}
                  <strong>ISBN:</strong> {book.isbn || "N/A"} |{" "}
                  <strong>Dewey:</strong> {book.dewey_decimal}
                </p>
                <button
                  onClick={() => toggleExpand(book.id)}
                  style={{
                    marginTop: 5,
                    padding: "5px 10px",
                    borderRadius: 5,
                    border: "1px solid #ccc",
                    background: "#f8f8f8",
                    cursor: "pointer",
                  }}
                >
                  {expandedBooks.includes(book.id)
                    ? "Hide Copies"
                    : "Show Copies"}
                </button>

                {/* Copies Section */}
                {expandedBooks.includes(book.id) && (
                  <div style={{ marginTop: 15, paddingLeft: 10 }}>
                    {book.copies.map((copy) => (
                      <div
                        key={copy.id}
                        style={{
                          borderTop: "1px dashed #aaa",
                          paddingTop: 10,
                          marginTop: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 15,
                        }}
                      >
                        <div>
                          <p style={{ margin: 0 }}>
                            <strong>Accession:</strong> {copy.accession_number}{" "}
                            <br />
                            <strong>Status:</strong> {copy.status} <br />
                            <strong>Date Added:</strong> {copy.date_added}
                          </p>
                        </div>
                        <Barcode
                          value={copy.barcode}
                          format="CODE128"
                          width={2}
                          height={50}
                          displayValue={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Image Placeholder */}
              <div
                style={{
                  flex: "0 0 80px",
                  marginLeft: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 130,
                    height: 150,
                    background: "#f0f0f0",
                    border: "1px dashed #ccc",
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: 12,
                  }}
                >
                  Image
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BookList;
