import React, { useState } from "react";
import AxiosInstance from "../../AxiosInstance";
import Barcode from "react-barcode";

interface BookFormProps {
  onSuccess?: () => void;
}

interface BookCopy {
  accession_number: string;
  barcode: string;
}

interface AddedBook {
  title: string;
  authors: string[];
  editors: string[];
  edition: string | null;
  volume: string | null;
  date_published: string | null;
  publication: string | null;
  copyright: string | null;
  number_of_pages: number | null;
  includes_index: boolean;
  includes_appendix: boolean;
  includes_glossary: boolean;
  includes_bibliographical_references: boolean;
  isbn: string | null;
  subjects: string | null;
  class_section: string;
  dewey_decimal: string;
  author_number: string | null;
  source: "library" | "donated";
  copies: BookCopy[];
}

const BookFormSample: React.FC<BookFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [editors, setEditors] = useState("");
  const [edition, setEdition] = useState("");
  const [volume, setVolume] = useState("");
  const [datePublished, setDatePublished] = useState("");
  const [publication, setPublication] = useState("");
  const [copyright, setCopyright] = useState("");
  const [numberOfPages, setNumberOfPages] = useState<number | "">("");
  const [includesIndex, setIncludesIndex] = useState(false);
  const [includesAppendix, setIncludesAppendix] = useState(false);
  const [includesGlossary, setIncludesGlossary] = useState(false);
  const [
    includesBibliographicalReferences,
    setIncludesBibliographicalReferences,
  ] = useState(false);
  const [isbn, setIsbn] = useState("");
  const [subjects, setSubjects] = useState("");
  const [classSection, setClassSection] = useState("");
  const [deweyDecimal, setDeweyDecimal] = useState("");
  const [authorNumber, setAuthorNumber] = useState("");
  const [source, setSource] = useState<"library" | "donated">("library");
  const [copies, setCopies] = useState(1);
  const [message, setMessage] = useState("");
  const [addedBook, setAddedBook] = useState<AddedBook | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      authors: authors ? authors.split(",").map((a) => a.trim()) : [],
      editors: editors ? editors.split(",").map((e) => e.trim()) : [],
      edition: edition || null,
      volume: volume || null,
      date_published: datePublished || null,
      publication: publication || null,
      copyright: copyright || null,
      number_of_pages: numberOfPages || null,
      includes_index: includesIndex,
      includes_appendix: includesAppendix,
      includes_glossary: includesGlossary,
      includes_bibliographical_references: includesBibliographicalReferences,
      isbn: isbn || null,
      subjects: subjects || null,
      class_section: classSection,
      dewey_decimal: deweyDecimal,
      author_number: authorNumber || null,
      source,
      copies,
    };

    try {
      const res = await AxiosInstance.post("/books", payload);
      setMessage("Book added successfully! ✅");
      setAddedBook(res.data.book); // store returned book with copies

      // Reset form fields
      setTitle("");
      setAuthors("");
      setEditors("");
      setEdition("");
      setVolume("");
      setDatePublished("");
      setPublication("");
      setCopyright("");
      setNumberOfPages("");
      setIncludesIndex(false);
      setIncludesAppendix(false);
      setIncludesGlossary(false);
      setIncludesBibliographicalReferences(false);
      setIsbn("");
      setSubjects("");
      setClassSection("");
      setDeweyDecimal("");
      setAuthorNumber("");
      setSource("library");
      setCopies(1);

      if (onSuccess) onSuccess();

      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error adding book ❌");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const closeModal = () => setAddedBook(null);

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 900,
          margin: "20px auto",
          display: "flex",
          flexDirection: "column",
          gap: 15,
        }}
      >
        <h2>Add New Book</h2>

        <div style={{ display: "flex", gap: 20 }}>
          {/* Left Column */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <label>Section</label>
            <input
              value={classSection}
              onChange={(e) => setClassSection(e.target.value)}
              required
            />

            <label>Dewey Decimal</label>
            <input
              value={deweyDecimal}
              onChange={(e) => setDeweyDecimal(e.target.value)}
              required
            />

            <label>Author Number</label>
            <input
              value={authorNumber}
              onChange={(e) => setAuthorNumber(e.target.value)}
            />

            <label>Copyright</label>
            <input
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
            />
          </div>

          {/* Right Column */}
          <div
            style={{
              flex: 2,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <label>Authors (comma-separated)</label>
            <input
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
            />

            <label>Edition</label>
            <input
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
            />

            <label>Volume</label>
            <input value={volume} onChange={(e) => setVolume(e.target.value)} />

            <label>Publication</label>
            <input
              value={publication}
              onChange={(e) => setPublication(e.target.value)}
            />

            <label>Date Published</label>
            <input
              type="date"
              value={datePublished}
              onChange={(e) => setDatePublished(e.target.value)}
            />

            <label>Number of Pages</label>
            <input
              type="number"
              min={1}
              value={numberOfPages}
              onChange={(e) => setNumberOfPages(Number(e.target.value))}
            />

            {/* Includes checkboxes */}
            <label>
              <input
                type="checkbox"
                checked={includesIndex}
                onChange={() => setIncludesIndex(!includesIndex)}
              />{" "}
              Includes Index
            </label>
            <label>
              <input
                type="checkbox"
                checked={includesAppendix}
                onChange={() => setIncludesAppendix(!includesAppendix)}
              />{" "}
              Includes Appendix
            </label>
            <label>
              <input
                type="checkbox"
                checked={includesGlossary}
                onChange={() => setIncludesGlossary(!includesGlossary)}
              />{" "}
              Includes Glossary
            </label>
            <label>
              <input
                type="checkbox"
                checked={includesBibliographicalReferences}
                onChange={() =>
                  setIncludesBibliographicalReferences(
                    !includesBibliographicalReferences
                  )
                }
              />{" "}
              Includes Bibliographical References
            </label>

            <label>ISBN</label>
            <input value={isbn} onChange={(e) => setIsbn(e.target.value)} />

            <label>Subjects</label>
            <input
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
            />

            <label>Source</label>
            <select
              value={source}
              onChange={(e) =>
                setSource(e.target.value as "library" | "donated")
              }
            >
              <option value="library">Library</option>
              <option value="donated">Donated</option>
            </select>

            <label>Copies</label>
            <input
              type="number"
              min={1}
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
            />
          </div>
        </div>

        <button type="submit" style={{ marginTop: 15 }}>
          Add Book
        </button>
        {message && <p>{message}</p>}
      </form>

      {/* Modal for added book */}
      {addedBook && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              maxWidth: 600,
              width: "90%",
              maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <h3>Book Added Successfully ✅</h3>
            <button onClick={closeModal} style={{ float: "right" }}>
              Close
            </button>

            <p>
              <strong>Title:</strong> {addedBook.title}
            </p>
            {addedBook.authors.length > 0 && (
              <p>
                <strong>Authors:</strong> {addedBook.authors.join(", ")}
              </p>
            )}
            {addedBook.editors.length > 0 && (
              <p>
                <strong>Editors:</strong> {addedBook.editors.join(", ")}
              </p>
            )}
            {addedBook.edition && (
              <p>
                <strong>Edition:</strong> {addedBook.edition}
              </p>
            )}
            {addedBook.volume && (
              <p>
                <strong>Volume:</strong> {addedBook.volume}
              </p>
            )}
            {addedBook.publication && (
              <p>
                <strong>Publication:</strong> {addedBook.publication}
              </p>
            )}
            {addedBook.date_published && (
              <p>
                <strong>Date Published:</strong> {addedBook.date_published}
              </p>
            )}
            {addedBook.copyright && (
              <p>
                <strong>Copyright:</strong> {addedBook.copyright}
              </p>
            )}
            {addedBook.number_of_pages && (
              <p>
                <strong>Pages:</strong> {addedBook.number_of_pages}
              </p>
            )}
            {addedBook.isbn && (
              <p>
                <strong>ISBN:</strong> {addedBook.isbn}
              </p>
            )}
            {addedBook.subjects && (
              <p>
                <strong>Subjects:</strong> {addedBook.subjects}
              </p>
            )}
            <p>
              <strong>Class Section:</strong> {addedBook.class_section}
            </p>
            <p>
              <strong>Dewey Decimal:</strong> {addedBook.dewey_decimal}
            </p>
            {addedBook.author_number && (
              <p>
                <strong>Author Number:</strong> {addedBook.author_number}
              </p>
            )}
            <p>
              <strong>Source:</strong> {addedBook.source}
            </p>

            {/* Only checked includes */}
            {addedBook.includes_index && <p>Includes Index ✅</p>}
            {addedBook.includes_appendix && <p>Includes Appendix ✅</p>}
            {addedBook.includes_glossary && <p>Includes Glossary ✅</p>}
            {addedBook.includes_bibliographical_references && (
              <p>Includes Bibliographical References ✅</p>
            )}

            <h4>Copies:</h4>
            <ul>
              {addedBook.copies?.map((copy) => (
                <li key={copy.accession_number}>
                  Accession: {copy.accession_number},{" "}
                  <Barcode
                    value={copy.barcode}
                    format="CODE128"
                    width={2}
                    height={50}
                    displayValue={true}
                  />
                </li>
              ))}
            </ul>
            <button onClick={() => window.print()}>Print</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookFormSample;
