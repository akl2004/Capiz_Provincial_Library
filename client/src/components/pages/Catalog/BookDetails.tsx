import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../LoadingSpinner";

interface BookCopy {
  id: number;
  barcode: string;
  status: string;
  copy_number: number;
}

interface Book {
  id: number;
  title: string;
  author?: string;
  other_author_editor?: string;
  edition?: string;
  series_name?: string;
  volume?: string;
  topical_subject?: string;
  publisher?: string;
  place_of_publication?: string;
  copyright?: string;
  call_number: string;
  number_of_pages?: number;
  includes_index?: boolean;
  includes_appendix?: boolean;
  includes_glossary?: boolean;
  includes_bibliographical_references?: boolean;
  copies: BookCopy[];
}

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await AxiosInstance.get(`/books/${id}`);
        setBook(response.data);
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading)
    return (
      <div className="center-page">
        <LoadingSpinner message="Loading book details..." />
      </div>
    );

  if (!book)
    return (
      <div className="center-page">
        <p className="text-gray-600 text-lg">Book not found</p>
      </div>
    );

  // Determine contributor to display (author > editor > N/A)
  const displayContributor =
    book.author && book.author.trim() !== ""
      ? book.author
      : book.other_author_editor && book.other_author_editor.trim() !== ""
      ? book.other_author_editor
      : "N/A";

  // Combine series and volume with ";"
  const seriesDisplay =
    [book.series_name, book.volume].filter(Boolean).join("; ") || "N/A";
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/cataloging" className="text-blue-500 underline">
        ← Back to Catalog
      </Link>

      {/* Bibliographical Record */}
      <div className="bibliographical-record mt-6">
        <h1 className="text-xl font-semibold mb-4">Bibliographical Record</h1>
        <p>
          <strong>Title:</strong> {book.title || "N/A"}
        </p>
        <p>
          <strong>Contributor:</strong> {displayContributor}
        </p>
        <p>
          <strong>Edition:</strong> {book.edition || "N/A"}
        </p>
        <p>
          <strong>Published:</strong>{" "}
          {[book.publisher, book.place_of_publication, book.copyright]
            .filter(Boolean)
            .join(", ") || "N/A"}
        </p>
        <p>
          <strong>Pages:</strong> {book.number_of_pages || "N/A"}
        </p>
        <p>
          <strong>Series:</strong> {seriesDisplay}
        </p>
        <p>
          <strong>Notes:</strong>{" "}
          {[
            book.includes_index && "index",
            book.includes_appendix && "appendix",
            book.includes_glossary && "glossary",
            book.includes_bibliographical_references &&
              "bibliographical references",
          ]
            .filter(Boolean)
            .join(", ")
            ? `Includes ${[
                book.includes_index && "index",
                book.includes_appendix && "appendix",
                book.includes_glossary && "glossary",
                book.includes_bibliographical_references &&
                  "bibliographical references",
              ]
                .filter(Boolean)
                .join(", ")}`
            : "N/A"}
        </p>
        <p>
          <strong>Subject:</strong> {book.topical_subject || "N/A"}
        </p>
        <p>
          <strong>Call Number:</strong> {book.call_number || "N/A"}
        </p>
      </div>

      {/* Copies Info */}
      <div className="copies-info mt-6">
        <h1 className="text-xl font-semibold mb-4">Copies Information</h1>
        {book.copies && book.copies.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Copy Number</th>
                <th>Call No.</th>
                <th>Barcode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {book.copies.map((copy) => (
                <tr
                  key={copy.id}
                  onClick={() =>
                    navigate(`/cataloging/${book.id}/copies/${copy.id}`)
                  }
                  className="book-row"
                >
                  <td>{copy.copy_number}</td>
                  <td>{book.call_number || "N/A"}</td>
                  <td>{copy.barcode}</td>
                  <td>{copy.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No copies available</p>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
