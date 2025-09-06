import { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner"; // <-- import spinner

interface Book {
  id: number;
  title: string;
  contributor: string;
  edition: string;
  year: string | number;
  classification: string;
}

const Cataloging = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

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
    const mainClass = dewey.substring(0, 1) + "00"; // e.g. "3" → "300"
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

      return (
        title.includes(lowerSearch) ||
        contributor.includes(lowerSearch) ||
        edition.includes(lowerSearch) ||
        year.includes(lowerSearch) ||
        classification.includes(lowerSearch)
      );
    });

    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);

      const response = await AxiosInstance.get("/books");

      const booksData = Array.isArray(response.data)
        ? response.data
        : response.data.data; // fallback if wrapped in { data: [...] }

      const formattedBooks = booksData.map((book: any) => {
        // Use author if exists, otherwise fallback to other_author_editor
        const contributor =
          book.author && book.author.trim() !== ""
            ? book.author
            : book.other_author_editor || "N/A";

        return {
          id: book.id,
          title: book.title,
          contributor: contributor,
          edition: book.edition,
          year: book.copyright || "N/A",
          classification: getDeweyCategory(book.dewey_decimal),
        };
      });

      setBooks(formattedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Cataloging Page</h1>
        <p>Welcome to the cataloging page!</p>
      </div>
      <div className="catalog-container">
        <form className="row g-2" onSubmit={(e) => e.preventDefault()}>
          <div className="col-md-8 position-relative">
            <input
              className="form-control text-center ps-5 pe-5"
              placeholder="SEARCH BOOK"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <button
              type="button"
              className="btn w-100"
              style={{ backgroundColor: "#F5C839" }}
              // onClick={handleClick}
            >
              Add New
            </button>
          </div>
        </form>
        <div className="mt-3">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Contributor</th>
                <th>Edition</th>
                <th>Year</th>
                <th>Classification</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <LoadingSpinner message="Loading books..." />
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">
                    No books found.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="book-row"
                    onClick={() => navigate(`/cataloging/${book.id}`)}
                  >
                    <td>{book.title}</td>
                    <td>{book.contributor}</td>
                    <td>{book.edition}</td>
                    <td>{book.year}</td>
                    <td>{book.classification}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Cataloging;
