import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../../components/LoadingSpinner";
import placeholder from "../../../assets/cover_placeholder.jpg";

interface Book {
  id: number;
  title: string;
  contributor?: string;
  edition?: string;
  year?: string | number;
  classification?: string;
  cover_image?: string | null;
  // material_type?: string;
  topical_subject?: string[];
  section?: string;
  copies: BookCopy[];
}

interface BookCopy {
  material_type?: string;
}

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

const getDeweyCategory = (dewey: string | undefined): string => {
  if (!dewey) return "Unknown";
  const mainClass = dewey.substring(0, 1) + "00";
  return deweyMap[mainClass] || "Unknown";
};

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

//   const [results, setResults] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"image" | "list">("image");
  const [hasTyped, setHasTyped] = useState(false);

  // Get query from URL
  const params = new URLSearchParams(location.search);
  const query = params.get("query") || "";

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query.trim() === "") {
        setFilteredBooks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await AxiosInstance.get(
          `/books/search?query=${encodeURIComponent(query)}`
        );
        const booksData = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        const formattedBooks = booksData.map((book: any) => ({
          id: book.id,
          title: book.title,
          contributor: book.author || book.other_author_editor || "N/A",
          edition: book.edition || "N/A",
          year: book.copyright || "N/A",
          classification: getDeweyCategory(book.dewey_decimal),
          cover_image: book.cover_image || null,
          // material_type: book.material_type || "N/A",
          topical_subject: Array.isArray(book.topical_subject)
            ? book.topical_subject
            : book.topical_subject
            ? [book.topical_subject]
            : [],
          section: book.section || "N/A",
          copies: book.copies || [],
        }));

        setFilteredBooks(formattedBooks);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setFilteredBooks([]); // show "No books found"
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);


  // Set initial search term if URL has query
  useEffect(() => {
    if (query.trim() !== "") setSearchTerm(query);
  }, [query]);


  // Dropdown search suggestions
  useEffect(() => {
    if (!hasTyped || searchTerm.trim() === "") {
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(() => {
      AxiosInstance.get(`/books/search?query=${searchTerm}`)
        .then((res) => {
          const booksData = Array.isArray(res.data) ? res.data : res.data.data;
          const formattedBooks = booksData.map((book: any) => ({
            id: book.id,
            title: book.title,
            contributor: book.author || book.other_author_editor || "N/A",
            edition: book.edition || "N/A",
            year: book.copyright || "N/A",
            classification: getDeweyCategory(book.dewey_decimal),
            cover_image: book.cover_image || null,
            // material_type: book.material_type || "N/A",
            topical_subject: Array.isArray(book.topical_subject)
              ? book.topical_subject
              : book.topical_subject
              ? [book.topical_subject]
              : [],

            section: book.section || "N/A",
            copies: book.copies || [],
          }));

          setFilteredBooks(formattedBooks);
          setShowDropdown(formattedBooks.length > 0);
        })
        .catch((err) => console.error(err));

    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div className="catalog-container">
      {/* Header: Search + View Toggle */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="text-xl font-semibold mb-0">Search Results</h1>
          <p className="mb-0">
            <i>Search results for "{searchTerm}"</i>
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
              placeholder="Search Book..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHasTyped(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm.trim() !== "") {
                  setShowDropdown(false); // ✅ Hide dropdown
                  navigate(
                    `/guest/guestdashboard/search?query=${encodeURIComponent(
                      searchTerm
                    )}`
                  );
                }
              }}
              onFocus={() => filteredBooks.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />

            {showDropdown && filteredBooks.length > 0 && (
              <ul
                className="list-group position-absolute w-100"
                style={{
                  top: "100%",
                  left: 0,
                  zIndex: 1000,
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {filteredBooks.map((book) => (
                  <li
                    key={book.id}
                    className="list-group-item list-group-item-action"
                    onClick={() => {
                      setSearchTerm(book.title);
                      setShowDropdown(false);
                      navigate(
                        `/guest/guestdashboard/search?query=${encodeURIComponent(
                          book.title
                        )}`
                      );
                    }}
                  >
                    {book.title}
                  </li>
                ))}
              </ul>
            )}
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
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        {loading ? (
          <div className="text-center py-10">
            <LoadingSpinner message="Loading books..." />
          </div>
        ) : filteredBooks.length === 0 ? (
          <p className="text-center">No books found.</p>
        ) : viewMode === "image" ? (
          filteredBooks.map((book) => (
            <div key={book.id} className="card mb-3 p-3">
              <div className="row">
                <div className="col-md-2">
                  <img
                    src={
                      book.cover_image
                        ? `http://127.0.0.1:8000/storage/${book.cover_image}`
                        : placeholder
                    }
                    alt={book.title}
                    className="img-fluid"
                    style={{ maxHeight: "200px", objectFit: "contain" }}
                  />
                </div>
                <div className="description col-md-9">
                  <p className="mb-0">
                    <strong>Material:</strong>{" "}
                    {book.copies?.length
                      ? book.copies[0].material_type || "N/A"
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
                    {Array.isArray(book.topical_subject) &&
                    book.topical_subject.length
                      ? book.topical_subject.join(", ")
                      : "N/A"}
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
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    {book.copies?.length
                      ? book.copies[0].material_type || "N/A"
                      : "N/A"}
                  </td>
                  <td>{book.title}</td>
                  <td>{book.contributor}</td>
                  <td>{book.edition}</td>
                  <td>{book.year}</td>
                  <td>
                    {book.topical_subject?.length
                      ? book.topical_subject.join(", ")
                      : "N/A"}
                  </td>
                  <td>{book.section}</td>
                  <td>{book.classification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
