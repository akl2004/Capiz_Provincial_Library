import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../LoadingSpinner";

interface BookCopy {
  id: number;
  accession_number: string;
  barcode: string;
  status: string; // 'available' or 'borrowed'
  copy_number: number;
  source: string;
  source_person: string;
  material_type?: string;
  cataloging_note: string;
  internal_note: string;
}

interface Book {
  id: number;
  title: string;
  author?: string;
  other_author_editor?: string;
  edition?: string;
  series_name?: string;
  volume?: string;
  cover_image?: string;
  topical_subject?: string[] | string;
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
  const [showModal, setShowModal] = useState(false);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCoverImageUrl = (cover_image?: string) => {
    if (!cover_image) return "/src/assets/cover_placeholder.jpg";
    // If your backend is serving images via /storage
    return `${
      import.meta.env.VITE_API_URL || "http://localhost:8000"
    }/storage/${cover_image}`;
  };


  useEffect(() => {
    document.title = "Book Details";

    const fetchBook = async () => {
      try {
        const response = await AxiosInstance.get(`/books/${id}`);
        const bookData: Book = response.data;

        // Normalize topical_subject to array
        let subjects: string[] = [];
        if (bookData.topical_subject) {
          if (Array.isArray(bookData.topical_subject)) {
            subjects = bookData.topical_subject;
          } else if (typeof bookData.topical_subject === "string") {
            try {
              subjects = JSON.parse(bookData.topical_subject);
              if (!Array.isArray(subjects))
                subjects = [bookData.topical_subject];
            } catch {
              subjects = [bookData.topical_subject];
            }
          }
        }

        setBook({ ...bookData, topical_subject: subjects });
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // Fetch dropdown options when modal opens
  useEffect(() => {
    if (showModal) {
      AxiosInstance.get("/dropdown-options")
        .then((res) => {
          setMaterialTypes(res.data.materialTypes || []);
          setSources(res.data.sources || []);
        })
        .catch((err) => console.error("Error fetching dropdowns:", err));
    }
  }, [showModal]);

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

  const displayContributor =
    book.author?.trim() || book.other_author_editor?.trim() || "N/A";

  const seriesDisplay =
    [book.series_name, book.volume].filter(Boolean).join("; ") || "N/A";

  const topicalSubjects: string[] = Array.isArray(book.topical_subject)
    ? book.topical_subject
    : [];

  const notesArray = [
    book.includes_index && "index",
    book.includes_appendix && "appendix",
    book.includes_glossary && "glossary",
    book.includes_bibliographical_references && "bibliographical references",
  ].filter(Boolean);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* <button
        onClick={() => {
          const role = localStorage.getItem("role")?.toLowerCase();
          navigate(
            role === "admin" ? "/admin/cataloging" : "/staff/cataloging"
          );
        }}
        className="py-2 px-4 mb-4 bg-gray-200 hover:bg-gray-300 rounded"
      >
        ← Back
      </button> */}
      {/* Bibliographical Record */}
      <div className="bibliographical-record">
        {/* Bibliographical Info */}
        <div className="bibliographical-info">
          <h1 className="text-xl font-semibold mb-4">
            <span
              className="me-2"
              style={{ cursor: "pointer" }}
              onClick={() => {
                const role = localStorage.getItem("role")?.toLowerCase();
                navigate(
                  role === "admin" ? "/admin/cataloging" : "/staff/cataloging"
                );
              }}
            >
              <i className="bi bi-arrow-left"></i>
            </span>
            Bibliographical Record
          </h1>
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
            {notesArray.length ? `Includes ${notesArray.join(", ")}` : "N/A"}
          </p>
          <p>
            <strong className="mb-4">Subjects:</strong>{" "}
            {topicalSubjects.length ? topicalSubjects.join(", ") : "N/A"}
          </p>
          <p>
            <strong>Call Number:</strong> {book.call_number || "N/A"}
          </p>
        </div>

        {/* Image */}
        <div className="bibliographical-image">
          <img
            src={getCoverImageUrl(book.cover_image)}
            alt={book.title}
            className="book-cover"
          />
        </div>
      </div>

      {/* Copies Info */}
      <div className="copies-info mt-6">
        <h1 className="text-xl font-semibold mb-4">Copies Information</h1>
        {book.copies.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Barcode</th>
                <th>Accession Number</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {book.copies.map((copy) => (
                <tr
                  key={copy.id}
                  onClick={() =>
                    navigate(
                      `${
                        localStorage.getItem("role")?.toLowerCase() === "staff"
                          ? `/staff/cataloging/${book.id}/${copy.id}`
                          : `/admin/cataloging/${book.id}/${copy.id}`
                      }`
                    )
                  }
                  className="book-row"
                  style={{ cursor: "pointer" }}
                >
                  <td>{copy.copy_number}</td>
                  <td>{copy.barcode}</td>
                  <td>{copy.accession_number || "N/A"}</td>
                  <td>
                    {copy.status?.toLowerCase() === "borrowed"
                      ? "Borrowed"
                      : "Available"}
                  </td>
                  <td>{copy.internal_note || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No copies available</p>
        )}

        {/* Add Copy Button */}
        <div className="mt-4 flex justify-end">
          <button onClick={() => setShowModal(true)} className="addpatron-btn">
            Add New Copy
          </button>
        </div>

        {/* Add Copy Modal */}
        {showModal && book && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2 className="mb-3">➕ Add New Copy</h2>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);

                  try {
                    await AxiosInstance.post(`/books/${book.id}/add-copy`, {
                      source: formData.get("source"),
                      material_type: formData.get("material_type"),
                      source_person: formData.get("source_person"),
                      cataloging_note: formData.get("cataloging_note"),
                      internal_note: formData.get("internal_note"),
                      copies: Number(formData.get("copies") || 1),
                    });

                    // Refresh book details
                    const response = await AxiosInstance.get(`/books/${id}`);
                    setBook(response.data);
                    setShowModal(false);
                  } catch (error) {
                    console.error("Error adding copy:", error);
                  }
                }}
                className="space-y-3"
              >
                {/* Material Type Dropdown */}
                <div className="addpatron-row mb-1">
                  <label className="addpatron-label">Material Type</label>
                  <select
                    name="material_type"
                    defaultValue={materialTypes[0] || ""}
                    className="border rounded p-2 w-full"
                  >
                    {materialTypes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Dropdown */}
                <div className="addpatron-row mb-1">
                  <label className="addpatron-label">
                    Source of Acquisition
                  </label>
                  <select
                    name="source"
                    defaultValue={sources[0] || ""}
                    className="border rounded p-2 w-full"
                  >
                    {sources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Copies */}
                <div className="addpatron-row mb-1">
                  <label className="addpatron-label">Number of Copies</label>
                  <input
                    type="number"
                    min={1}
                    name="copies"
                    defaultValue={1}
                    className="border rounded p-2 w-full"
                  />
                </div>

                {/* Source Person */}
                <div className="addpatron-row mb-1">
                  <label className="addpatron-label">Funding Source</label>
                  <input
                    type="text"
                    name="source_person"
                    className="border rounded p-2 w-full"
                    placeholder="If donated, enter donor name"
                  />
                </div>

                {/* Cataloging Note */}
                <div className="addpatron-row mb-1">
                  <label className="addpatron-label">Cataloging Note</label>
                  <textarea
                    name="cataloging_note"
                    className="border rounded p-2 w-full"
                  />
                </div>

                {/* Internal Note */}
                <div className="addpatron-row mb-1">
                  <label className="addpatron-label">Internal Note</label>
                  <textarea
                    name="internal_note"
                    className="border rounded p-2 w-full"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    Add Copy
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
