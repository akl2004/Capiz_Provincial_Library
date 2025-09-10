import React, { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import Barcode from "react-barcode";

interface Copy {
  copy_number: number;
  barcode: string;
}

const BookForm: React.FC = () => {
  // ===== Catalog Record =====
  const [personSubject, setPersonSubject] = useState("");
  const [geographicalSubject, setGeographicalSubject] = useState("");
  const [author, setAuthor] = useState("");
  const [editor, setEditor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [deweyDecimal, setDeweyDecimal] = useState("");
  const [authorNumber, setAuthorNumber] = useState("");
  const [title, setTitle] = useState("");
  const [edition, setEdition] = useState("");
  const [placeOfPublication, setPlaceOfPublication] = useState("");
  const [publisher, setPublisher] = useState("");
  const [yearCopyright, setYearCopyright] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [volume, setVolume] = useState("");
  const [languageCode, setLanguageCode] = useState("");
  const [numberOfPages, setNumberOfPages] = useState<number | "">("");

  // Checklist
  const [includesIndex, setIncludesIndex] = useState(false);
  const [includesAppendix, setIncludesAppendix] = useState(false);
  const [includesGlossary, setIncludesGlossary] = useState(false);
  const [
    includesBibliographicalReferences,
    setIncludesBibliographicalReferences,
  ] = useState(false);

  // ===== Accession Record =====
  const [sourcePerson, setSourcePerson] = useState("");
  const [catalogingNote, setCatalogingNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [copies, setCopies] = useState(1);
  const [section, setSection] = useState("");
  const [source, setSource] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Barcode modal
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [bookCopies, setBookCopies] = useState<Copy[]>([]);

  // Topical subjects
  const [topicalSubjects, setTopicalSubjects] = useState<string[]>([
    "",
    "",
    "",
  ]);
  const handleTopicalChange = (index: number, value: string) => {
    const updated = [...topicalSubjects];
    updated[index] = value;
    setTopicalSubjects(updated);
  };

  // Other Authors/Editors
  const [otherAuthorsEditors, setOtherAuthorsEditors] = useState<string[]>([
    "",
  ]);
  const handleOtherAuthorEditorChange = (index: number, value: string) => {
    const updated = [...otherAuthorsEditors];
    updated[index] = value;
    setOtherAuthorsEditors(updated);
  };

  // Fetch dropdown options
  useEffect(() => {
    AxiosInstance.get("/dropdown-options").then((res) => {
      setSections(res.data.sections || []);
      setSources(res.data.sources || []);
      setMaterialTypes(res.data.materialTypes || []);
      if (res.data.sections?.length) setSection(res.data.sections[0]);
      if (res.data.sources?.length) setSource(res.data.sources[0]);
      if (res.data.materialTypes?.length)
        setMaterialType(res.data.materialTypes[0]);
    });
  }, []);

  // Helper: generate random barcode
  const generateBarcode = () => {
    const randomNumbers = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
    return `BC${randomNumbers}`;
  };

  // Generate copies with random barcodes when 'copies' changes
  useEffect(() => {
    const generatedCopies: Copy[] = Array.from({ length: copies }, (_, i) => ({
      copy_number: i + 1,
      barcode: generateBarcode(),
    }));
    setBookCopies(generatedCopies);
  }, [copies]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare FormData
    const formData = new FormData();
    formData.append("person_as_subject", personSubject);
    topicalSubjects
      .filter((s) => s.trim() !== "")
      .forEach((s, i) => formData.append(`topical_subjects[${i}]`, s));
    formData.append("geographical_subject", geographicalSubject);
    formData.append("author", author);
    formData.append("editor", editor);
    otherAuthorsEditors
      .filter((oae) => oae != null && oae.toString().trim() !== "")
      .forEach((oae) =>
        formData.append("other_author_editor[]", oae.toString().trim())
      );
    formData.append("isbn", isbn);
    formData.append("dewey_decimal", deweyDecimal);
    formData.append("author_number", authorNumber);
    formData.append("title", title);
    formData.append("edition", edition);
    formData.append("place_of_publication", placeOfPublication);
    formData.append("publisher", publisher);
    formData.append("copyright", yearCopyright);
    formData.append("series_name", seriesName);
    formData.append("volume", volume);
    formData.append("book_language", languageCode);
    formData.append("number_of_pages", numberOfPages.toString());
    formData.append("includes_index", includesIndex ? "1" : "0");
    formData.append("includes_appendix", includesAppendix ? "1" : "0");
    formData.append("includes_glossary", includesGlossary ? "1" : "0");
    formData.append(
      "includes_bibliographical_references",
      includesBibliographicalReferences ? "1" : "0"
    );
    formData.append("source_person", sourcePerson);
    formData.append("cataloging_note", catalogingNote);
    formData.append("internal_note", internalNote);
    formData.append("copies", copies.toString());
    formData.append("class_section", section);
    formData.append("source", source.toLowerCase().trim());
    formData.append("material_type", materialType);
    if (coverImage) formData.append("cover_image", coverImage);

    console.log("Selected source:", source);


    // Append each copy with its barcode
    bookCopies.forEach((c, i) => {
      formData.append(
        `copies_data[${i}][copy_number]`,
        c.copy_number.toString()
      );
      formData.append(`copies_data[${i}][barcode]`, c.barcode);
    });

    try {
      const res = await AxiosInstance.post("/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Book saved successfully!");
      setShowBarcodeModal(true);
      setBookCopies(res.data.copies || bookCopies);
    } catch (error: any) {
      console.error(
        "❌ Error saving book:",
        error.response?.data || error.message
      );
      alert("Failed to save book.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="book-form">
        <h1>📚 Add New Book</h1>

        {/* ===== Catalog Record ===== */}
        <fieldset>
          <legend className="record">Catalog Record</legend>

          {/* Identifiers */}
          <fieldset>
            <legend>Identifiers</legend>
            <div className="flex-row" style={{ gap: "40px" }}>
              {/* Left Column: existing input fields */}
              <div className="flex-col" style={{ flex: 1, gap: "10px" }}>
                <div className="flex-row">
                  <label>ISBN</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                  />
                </div>
                <div className="flex-row">
                  <label>Dewey Decimal</label>
                  <input
                    type="text"
                    value={deweyDecimal}
                    onChange={(e) => setDeweyDecimal(e.target.value)}
                  />
                </div>
                <div className="flex-row">
                  <label>Author Number</label>
                  <input
                    type="text"
                    value={authorNumber}
                    onChange={(e) => setAuthorNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column: cover image input */}
              <div className="cover-image-container">
                <label className="cover-image-label">Cover Image</label>
                <div
                  className="cover-image-box"
                  onClick={() => document.getElementById("coverInput")?.click()}
                >
                  {coverImage ? (
                    <img
                      src={URL.createObjectURL(coverImage)}
                      alt="Cover Preview"
                    />
                  ) : (
                    <span className="cover-image-placeholder">Add Image</span>
                  )}
                  <button
                    type="button"
                    className="cover-image-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("coverInput")?.click();
                    }}
                  >
                    Choose File
                  </button>
                  <input
                    type="file"
                    id="coverInput"
                    className="cover-image-input"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCoverImage(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <hr />

          {/* ===== Description ===== */}
          <fieldset>
            <legend>Description</legend>

            {/* Top Rows: Title, Edition */}
            <div className="flex-col" style={{ gap: "10px" }}>
              <div className="flex-row">
                <label>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex-row">
                <label>Edition</label>
                <input
                  type="text"
                  className="small"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                />
              </div>

              {/* Publication Row */}
              <div className="flex-row">
                <label>Publication</label>
                <div className="flex-col flex-grow">
                  <input
                    type="text"
                    value={placeOfPublication}
                    onChange={(e) => setPlaceOfPublication(e.target.value)}
                  />
                  <span className="sub-label">
                    <i>Place</i>
                  </span>
                </div>
                <div className="flex-col flex-grow">
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                  />
                  <span className="sub-label">
                    <i>Publisher</i>
                  </span>
                </div>
                <div className="flex-col" style={{ width: "100px" }}>
                  <input
                    type="text"
                    className="small"
                    value={yearCopyright}
                    onChange={(e) => setYearCopyright(e.target.value)}
                  />
                  <span className="sub-label">
                    <i>Year</i>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Two-Column Layout: Left = Series, Language Code, Pages; Right = Checklist */}
            <div className="flex-row" style={{ gap: "40px" }}>
              {/* Left Column */}
              <div className="flex-col flex-grow" style={{ gap: "10px" }}>
                <div
                  className="flex-row"
                  style={{ gap: "10px", marginTop: "10px" }}
                >
                  <label>Series</label> {/* single main label for the row */}
                  <div className="flex-col flex-grow">
                    <input
                      type="text"
                      value={seriesName}
                      onChange={(e) => setSeriesName(e.target.value)}
                    />
                    <span className="sub-label">
                      <i>Series Name</i>
                    </span>
                  </div>
                  <div className="flex-col" style={{ width: "100px" }}>
                    <input
                      type="text"
                      className="small"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                    />
                    <span className="sub-label">
                      <i>Volume</i>
                    </span>
                  </div>
                </div>

                <div className="flex-row">
                  <label>Language Code</label>
                  <input
                    type="text"
                    value={languageCode}
                    onChange={(e) => setLanguageCode(e.target.value)}
                  />
                </div>

                <div className="flex-row">
                  <label>Number of Pages</label>
                  <input
                    type="number"
                    className="small"
                    value={numberOfPages}
                    onChange={(e) => setNumberOfPages(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Right Column: Checklist aligned to top of Series */}
              <div className="right-column">
                <label>General Notes</label>
                <div className="checklist">
                  <label>
                    <input
                      type="checkbox"
                      checked={includesIndex}
                      onChange={() => setIncludesIndex(!includesIndex)}
                    />
                    Includes Index
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={includesAppendix}
                      onChange={() => setIncludesAppendix(!includesAppendix)}
                    />
                    Includes Appendix
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={includesGlossary}
                      onChange={() => setIncludesGlossary(!includesGlossary)}
                    />
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
                    />
                    Includes Bibliographical References
                  </label>
                </div>
              </div>
            </div>
          </fieldset>

          <hr />

          {/* Subjects */}
          <fieldset>
            <legend>Subjects</legend>
            <div className="flex-col">
              <div className="flex-row">
                <label>Person as Subject</label>
                <input
                  type="text"
                  value={personSubject}
                  onChange={(e) => setPersonSubject(e.target.value)}
                />
              </div>

              {topicalSubjects.map((subject, index) => (
                <div className="flex-row" key={index}>
                  {index === 0 ? (
                    <label>Topical Subject</label>
                  ) : (
                    <div style={{ width: "120px" }} />
                  )}
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => handleTopicalChange(index, e.target.value)}
                  />
                </div>
              ))}

              <button
                type="button"
                className="add-more"
                onClick={() => setTopicalSubjects([...topicalSubjects, ""])}
              >
                + Add More
              </button>

              <div className="flex-row">
                <label>Geographical Subject</label>
                <input
                  type="text"
                  value={geographicalSubject}
                  onChange={(e) => setGeographicalSubject(e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <hr />

          {/* Contributors */}
          <fieldset>
            <legend>Contributors</legend>
            <div className="flex-col">
              <div className="flex-row">
                <label>Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="flex-row">
                <label>Editor</label>
                <input
                  type="text"
                  value={editor}
                  onChange={(e) => setEditor(e.target.value)}
                />
              </div>

              {otherAuthorsEditors.map((person, index) => (
                <div className="flex-row" key={index}>
                  {index === 0 ? (
                    <label>Other Author/Editor</label>
                  ) : (
                    <div style={{ width: "120px" }} />
                  )}
                  <input
                    type="text"
                    value={person}
                    onChange={(e) =>
                      handleOtherAuthorEditorChange(index, e.target.value)
                    }
                  />
                </div>
              ))}

              <button
                type="button"
                className="add-more"
                onClick={() =>
                  setOtherAuthorsEditors([...otherAuthorsEditors, ""])
                }
              >
                + Add More
              </button>
            </div>
          </fieldset>
        </fieldset>

        {/* ===== Accession Record ===== */}
        <fieldset>
          <legend className="record">Accession Record</legend>

          {/* Row 1: Section and Material Type */}
          <div className="flex-row" style={{ gap: "20px" }}>
            <div className="flex-row flex-grow">
              <label>Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
              >
                {sections.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-row flex-grow">
              <label>Material Type</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
              >
                {materialTypes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Source and Copies */}
          <div className="flex-row" style={{ gap: "20px" }}>
            <div className="flex-row flex-grow">
              <label>Source of Acquisition</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-row flex-grow">
              <label>Number of Copies</label>
              <input
                type="number"
                min={1}
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Row 3: Funding Source and Copy Number */}
          {bookCopies.map((c) => (
            <div
              key={c.copy_number}
              className="flex-row"
              style={{ gap: "20px", marginTop: "10px" }}
            >
              <div className="flex-row flex-grow">
                <label>Copy Number</label>
                <input
                  type="text"
                  value={c.copy_number}
                  readOnly
                  className="text-muted"
                />
              </div>
              <div className="flex-row flex-grow">
                <label>Barcode</label>
                <input
                  type="text"
                  value={c.barcode}
                  readOnly
                  className="text-muted"
                />
              </div>
            </div>
          ))}

          {/* Row 4: Barcode */}
          <div className="flex-row flex-grow">
            <label>Funding Source</label>
            <input
              type="text"
              value={sourcePerson}
              onChange={(e) => setSourcePerson(e.target.value)}
            />
          </div>

          {/* Row 5: Cataloging Note */}
          <div className="flex-row flex-grow">
            <label>Cataloging Note</label>
            <textarea
              value={catalogingNote}
              onChange={(e) => setCatalogingNote(e.target.value)}
            />
          </div>

          {/* Row 6: Internal Note */}
          <div className="flex-row flex-grow">
            <label>Internal Note</label>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
            />
          </div>
        </fieldset>

        <button type="submit" className="submit-btn">
          💾 Save Book
        </button>
      </form>

      {/* ===== Barcode Modal ===== */}
      {showBarcodeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Generated Barcodes</h2>
            {bookCopies.map((c) => (
              <div
                key={c.copy_number}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span>Copy {c.copy_number}</span>
                <Barcode value={c.barcode} />
              </div>
            ))}
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                onClick={() => window.print()}
                style={{ marginRight: "10px" }}
              >
                🖨 Print All
              </button>
              <button onClick={() => setShowBarcodeModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookForm;
