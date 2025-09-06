import React, { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";

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

  // ✅ Checklist
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

  const [section, setSection] = useState(""); // will fetch from DB
  const [source, setSource] = useState("");
  const [materialType, setMaterialType] = useState("");

  const [sections, setSections] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);

  const barcode = "AUTO-GENERATED";
  const copyNumber = "AUTO-GENERATED";

  //topical subjects array handling
  const [topicalSubjects, setTopicalSubjects] = useState<string[]>([
    "",
    "",
    "",
  ]);

  // Handle change
  const handleTopicalChange = (index: number, value: string) => {
    const updated = [...topicalSubjects];
    updated[index] = value;
    setTopicalSubjects(updated);
  };

  // State for Other Authors/Editors
  const [otherAuthorsEditors, setOtherAuthorsEditors] = useState<string[]>([
    "",
  ]);

  // Function to handle changes
  const handleOtherAuthorEditorChange = (index: number, value: string) => {
    const updated = [...otherAuthorsEditors];
    updated[index] = value;
    setOtherAuthorsEditors(updated);
  };

  // Fetch dropdown options from backend
  useEffect(() => {
    AxiosInstance.get("/dropdown-options").then((res) => {
      setSections(res.data.sections);
      setSources(res.data.sources);
      setMaterialTypes(res.data.materialTypes);

      // Set default values if available
      if (res.data.sections.length) setSection(res.data.sections[0]);
      if (res.data.sources.length) setSource(res.data.sources[0]);
      if (res.data.materialTypes.length)
        setMaterialType(res.data.materialTypes[0]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      person_as_subject: personSubject,
      topical_subjects: topicalSubjects.filter((s) => s.trim() !== ""), // remove empty
      geographical_subject: geographicalSubject,
      author,
      editor,
      other_author_editor: otherAuthorsEditors,
      isbn,
      dewey_decimal: deweyDecimal,
      author_number: authorNumber,
      title,
      edition,
      place_of_publication: placeOfPublication,
      publisher,
      copyright: yearCopyright,
      series_name: seriesName,
      volume,
      book_language: languageCode,
      number_of_pages: numberOfPages,
      includes_index: includesIndex,
      includes_appendix: includesAppendix,
      includes_glossary: includesGlossary,
      includes_bibliographical_references: includesBibliographicalReferences,
      accession: {
        source_person: sourcePerson,
        cataloging_note: catalogingNote,
        internal_note: internalNote,
        copies,
        section,
        source,
        material_type: materialType,
      },
    };

    try {
      await AxiosInstance.post("/books", payload);
      alert("✅ Book saved successfully!");
    } catch (error: any) {
      console.error(
        "❌ Error saving book:",
        error.response?.data || error.message
      );
      alert("Failed to save book.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="book-form">
      <h1>📚 Add New Book</h1>

      {/* ===== Catalog Record ===== */}
      <fieldset>
        <legend className="record">Catalog Record</legend>

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

        <hr />

        {/* Identifiers */}
        <fieldset>
          <legend>Identifiers</legend>
          <div className="flex-col">
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
            <select value={source} onChange={(e) => setSource(e.target.value)}>
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
        <div className="flex-row" style={{ gap: "20px" }}>
          <div className="flex-row flex-grow">
            <label>Funding Source</label>
            <input
              type="text"
              value={sourcePerson}
              onChange={(e) => setSourcePerson(e.target.value)}
            />
          </div>

          <div className="flex-row flex-grow">
            <label>Copy Number</label>
            <input
              className="text-muted"
              type="text"
              value={copyNumber}
              readOnly
            />
          </div>
        </div>

        {/* Row 4: Barcode */}
        <div className="flex-row flex-grow">
          <label>Barcode</label>
          <input className="text-muted" type="text" value={barcode} readOnly />
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
  );
};

export default BookForm;
