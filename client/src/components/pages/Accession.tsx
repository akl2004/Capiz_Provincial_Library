import { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/LoadingSpinner";

interface BookCopy {
  id: number;
  accession_number: string;
}

interface Book {
  id: number;
  title: string;
  authors: string[];
  edition: string | null;
  volume: string | null;
  number_of_pages: number | null;
  source: string;
  section: string;
  dewey_decimal: string;
  created_at: string;
  copies: BookCopy[];
}

const Accession = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  useEffect(() => {
    document.title = "Accession";
    fetchBooks();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBooks(books);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();

    const filtered = books.filter((book) => {
      const author = book.authors?.join(", ").toLowerCase() || "";
      const title = book.title?.toLowerCase() || "";
      const edition = book.edition?.toLowerCase() || "";
      const volume = book.volume?.toLowerCase() || "";
      const source = book.source?.toLowerCase() || "";
      const pages = book.number_of_pages?.toString() || "";

      return (
        author.includes(lowerSearch) ||
        title.includes(lowerSearch) ||
        edition.includes(lowerSearch) ||
        volume.includes(lowerSearch) ||
        source.includes(lowerSearch) ||
        pages.includes(lowerSearch)
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
        : response.data.data;

      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Accession Page</h1>
        <p>Welcome to the accession page!</p>
      </div>
      <div className="catalog-container">
        <form className="row g-2" onSubmit={(e) => e.preventDefault()}>
          <div className="col-md-8 position-relative">
            <input
              className="form-control text-center ps-5 pe-5"
              placeholder="SEARCH ACCESSION"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
        <div className="mt-3">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Accession No.</th>
                <th>Date Added</th>
                <th>Class Number</th>
                <th>Author</th>
                <th>Title</th>
                <th>Edition</th>
                <th>Volume</th>
                <th>Source</th>
                <th>Pages</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    <LoadingSpinner message="Loading accession records..." />
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredBooks.flatMap((book) =>
                  book.copies.map((copy) => (
                    <tr key={copy.id} className="book-row">
                      <td>{copy.accession_number}</td>
                      <td>{new Date(book.created_at).toLocaleDateString()}</td>
                      <td>
                        {book.section} {book.dewey_decimal}
                      </td>
                      <td>{book.authors?.join(", ")}</td>
                      <td>{book.title}</td>
                      <td>{book.edition || "-"}</td>
                      <td>{book.volume || "-"}</td>
                      <td>{book.source}</td>
                      <td>{book.number_of_pages || "-"}</td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Accession;
