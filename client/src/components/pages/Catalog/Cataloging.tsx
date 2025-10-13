import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner";

interface Book {
  id: number;
  title: string;
  contributor: string;
  edition: string;
  year: string | number;
  classification: string;
  cover_image?: string;
  subjects?: string[];
  section?: string;
  copies?: BookCopy[];
}

interface BookCopy {
  book_id: number;
  material_type: string;
}

const Cataloging = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [viewMode, setViewMode] = useState<"image" | "list">("image");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;

  const deweyMap: { [key: string]: string } = {
    "000": "General Works",
    "100": "Philosophy & Psychology",
    "200": "Religion",
    "300": "Social Sciences",
    "400": "Language",
    "500": "Science",
    "600": "Technology",
    "700": "Arts & Recreation",
    "800": "Literature",
    "900": "History & Geography",
  };

  const getDeweyCategory = (dewey: string): string => {
    if (!dewey) return "N/A";
    const mainClass = dewey.substring(0, 1) + "00";
    return deweyMap[mainClass] || "Unknown";
  };

  useEffect(() => {
    document.title = "Cataloging";
    fetchBooks();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBooks(books);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = books.filter((book) => {
      const title = book.title?.toLowerCase() || "";
      const contributor = book.contributor?.toLowerCase() || "";
      const edition = book.edition?.toLowerCase() || "";
      const year = book.year?.toString() || "";
      const classification = book.classification?.toLowerCase() || "";
      const material_type =
        book.copies?.map((c) => c.material_type.toLowerCase()).join(", ") || "";
      const subjects = book.subjects?.join(", ").toLowerCase() || "";
      const section = book.section?.toLowerCase() || "";

      return (
        title.includes(lowerSearch) ||
        contributor.includes(lowerSearch) ||
        edition.includes(lowerSearch) ||
        year.includes(lowerSearch) ||
        classification.includes(lowerSearch) ||
        material_type.includes(lowerSearch) ||
        subjects.includes(lowerSearch) ||
        section.includes(lowerSearch)
      );
    });

    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);

      const response = await AxiosInstance.get("/books");
      const booksData = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      const formattedBooks = booksData.map((book: any) => {
        let subjects: string[] = [];
        if (book.topical_subject) {
          if (Array.isArray(book.topical_subject)) {
            subjects = book.topical_subject;
          } else if (typeof book.topical_subject === "string") {
            try {
              subjects = JSON.parse(book.topical_subject);
            } catch {
              subjects = [book.topical_subject];
            }
          }
        }

        return {
          id: book.id,
          title: book.title,
          contributor:
            book.author?.trim() !== ""
              ? book.author
              : book.other_author_editor || "N/A",
          edition: book.edition || "N/A",
          year: book.copyright || "N/A",
          classification: getDeweyCategory(book.dewey_decimal),
          cover_image: book.cover_image || "",
          subjects,
          section: book.section || "N/A",
          copies: book.copies || [],
        };
      });

      setBooks(formattedBooks);
      setFilteredBooks(formattedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  return (
    <div className="catalog-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="text-xl font-semibold mb-0">Catalog</h1>
          <p className="mb-0">
            <i>
              This table contains all materials with their bibliographical
              details.
            </i>
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <div className="position-relative" style={{ maxWidth: "300px" }}>
            <span
              className="position-absolute top-50 translate-middle-y ps-2"
              style={{ left: "10px", color: "#6c757d" }}
            >
              <i className="bi bi-search"></i>
            </span>
            <input
              className="form-control ps-5 pe-3"
              placeholder="SEARCH BOOK"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${
                viewMode === "image" ? "btn-secondary" : "btn-outline-secondary"
              }`}
              onClick={() => setViewMode("image")}
            >
              <i className="bi bi-list-task"></i>
            </button>
            <button
              type="button"
              className={`btn ${
                viewMode === "list" ? "btn-secondary" : "btn-outline-secondary"
              }`}
              onClick={() => setViewMode("list")}
            >
              <i className="bi bi-list"></i>
            </button>
          </div>

          <button
            className="catalog-btn"
            onClick={() => {
              const role = localStorage.getItem("role")?.toLowerCase();
              if (role === "admin") {
                navigate("/admin/cataloging/addbook");
              } else if (role === "staff") {
                navigate("/staff/cataloging/addbook");
              }
            }}
          >
            Add New
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        {isLoading ? (
          <div className="text-center py-10">
            <LoadingSpinner message="Loading books..." />
          </div>
        ) : viewMode === "image" ? (
          currentBooks.length === 0 ? (
            <p className="text-center">No books found.</p>
          ) : (
            currentBooks.map((book) => (
              <div
                key={book.id}
                className="card mb-3 p-3"
                onClick={() => {
                  const role = localStorage.getItem("role")?.toLowerCase();
                  if (!book.id) return;
                  const path =
                    role === "admin"
                      ? `/admin/cataloging/${book.id}`
                      : role === "staff"
                      ? `/staff/cataloging/${book.id}`
                      : null;
                  if (path) navigate(path);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="row">
                  <div className="col-md-2">
                    <img
                      src={
                        book.cover_image
                          ? `http://localhost:8000/storage/${book.cover_image}`
                          : "/src/assets/cover_placeholder.jpg"
                      }
                      alt={book.title}
                      className="img-fluid"
                      style={{
                        maxHeight: "200px",
                        objectFit: "contain",
                        width: "80%",
                      }}
                    />
                  </div>
                  <div className="description col-md-9">
                    <p className="mb-0">
                      <strong>Material:</strong>{" "}
                      {book.copies && book.copies.length > 0
                        ? book.copies[0].material_type
                        : "N/A"}
                    </p>
                    <p className="mb-0">
                      <strong>Title:</strong> {book.title}
                    </p>
                    <p className="mb-0">
                      <strong>Author:</strong> {book.contributor}
                    </p>
                    <p className="mb-0">
                      <strong>Edition:</strong> {book.edition}
                    </p>
                    <p className="mb-0">
                      <strong>Year:</strong> {book.year}
                    </p>
                    <p className="mb-0">
                      <strong>Subjects:</strong>{" "}
                      {book.subjects?.length ? book.subjects.join(", ") : "N/A"}
                    </p>
                    <p className="mb-0">
                      <strong>Section:</strong> {book.section}
                    </p>
                    <p className="mb-0">
                      <strong>Classification:</strong> {book.classification}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          <table className="custom-table w-100 mt-3">
            <thead>
              <tr>
                <th>Material</th>
                <th>Title</th>
                <th>Contributor</th>
                <th>Edition</th>
                <th>Year</th>
                <th>Subjects</th>
                <th>Section</th>
                <th>Classification</th>
              </tr>
            </thead>
            <tbody>
              {currentBooks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">
                    No books found.
                  </td>
                </tr>
              ) : (
                currentBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="book-row"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      if (!book.id) return;
                      const role = localStorage.getItem("role")?.toLowerCase();
                      const path =
                        role === "admin"
                          ? `/admin/cataloging/${book.id}`
                          : role === "staff"
                          ? `/staff/cataloging/${book.id}`
                          : null;
                      if (path) navigate(path);
                    }}
                  >
                    <td>
                      {book.copies && book.copies.length > 0
                        ? book.copies[0].material_type
                        : "N/A"}
                    </td>
                    <td>{book.title}</td>
                    <td>{book.contributor}</td>
                    <td>{book.edition}</td>
                    <td>{book.year}</td>
                    <td>
                      {book.subjects?.length ? book.subjects.join(", ") : "N/A"}
                    </td>
                    <td>{book.section}</td>
                    <td>{book.classification}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Pagination info */}
        {filteredBooks.length > 0 && (
          <div className="pagination-info text-center mb-2 mt-3">
            Showing {indexOfFirstBook + 1} -{" "}
            {Math.min(indexOfLastBook, filteredBooks.length)} of{" "}
            {filteredBooks.length} books
          </div>
        )}

        {/* ✅ Pagination controls */}
        {totalPages > 1 && (
          <div className="pagination mt-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <i className="bi bi-chevron-double-left"></i> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next <i className="bi bi-chevron-double-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cataloging;
