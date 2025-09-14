import { Fragment, useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { useNavigate } from "react-router-dom";

interface Circulation {
  id: number;
  patron: {
    patron_id: number;
    name: string;
  };
  book_copy: {
    id: number;
    barcode: string;
    book: {
      title: string;
    };
  };
  issue_date: string;
  due_date: string;
  date_returned: string | null;
  status: string;
  renewed?: boolean;
}

const CirculationPage = () => {
  const [records, setRecords] = useState<Circulation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]); // Track expanded rows

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Circulation";
    AxiosInstance.get("/circulations")
      .then((res) => setRecords(res.data))
      .catch((err) => console.error(err));
  }, []);

  const getStatus = (record: Circulation) => {
    if (record.status === "returned") return "Returned";
    if (record.status === "lost") return "Lost";
    if (record.status === "borrowed") {
      return new Date(record.due_date) < new Date() ? "Overdue" : "Borrowed";
    }
    return record.status;
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.patron?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.book_copy?.book?.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      rec.book_copy?.barcode.includes(searchTerm);

    const matchesStatus =
      !filterStatus ||
      (filterStatus === "Renewed"
        ? rec.renewed
        : getStatus(rec) === filterStatus);

    return matchesSearch && matchesStatus;
  });

  // Tally counts
  const tally = {
    Borrowed: records.filter((r) => getStatus(r) === "Borrowed").length,
    Returned: records.filter((r) => getStatus(r) === "Returned").length,
    Overdue: records.filter((r) => getStatus(r) === "Overdue").length,
    Renewed: records.filter((r) => r.renewed).length,
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Circulation Records</h1>
        <p>Manage book borrowings, returns, and renewals.</p>
      </div>

      {/* Tally Panel */}
      <div className="circulation-tally">
        {Object.entries(tally).map(([key, count]) => {
          let cardClass = "";
          if (key === "Borrowed") cardClass = "tally-borrowed";
          else if (key === "Returned") cardClass = "tally-returned";
          else if (key === "Overdue") cardClass = "tally-overdue";
          else if (key === "Renewed") cardClass = "tally-renewed";

          return (
            <div
              key={key}
              className={`tally-card ${cardClass} ${
                filterStatus === key ? "tally-active" : ""
              }`}
              onClick={() => setFilterStatus(filterStatus === key ? null : key)}
            >
              {key}: {count}
            </div>
          );
        })}
      </div>

      <div className="circulation-container">
        {/* Search & Issue Button */}
        <form className="row g-2" onSubmit={(e) => e.preventDefault()}>
          <div className="col-md-8 position-relative">
            <input
              className="form-control text-center ps-5 pe-5"
              placeholder="SEARCH BY PATRON / BOOK / BARCODE"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <button
              className="btn btn-primary w-100"
              onClick={() => navigate("/circulation/issue")}
            >
              ➕ Issue Book
            </button>
          </div>
        </form>

        {/* Records Table */}
        <div className="mt-3">
          <table className="circulation-table">
            <thead>
              <tr>
                <th>Patron ID</th>
                <th>Patron</th>
                <th>Book Title</th>
                <th>Barcode</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Returned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No circulation records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <Fragment key={rec.id}>
                    <tr
                      className="circulation-row"
                      onClick={() => toggleRow(rec.id)}
                    >
                      <td>{rec.patron?.patron_id}</td>
                      <td>{rec.patron?.name}</td>
                      <td>{rec.book_copy?.book?.title}</td>
                      <td>{rec.book_copy?.barcode}</td>
                      <td>{rec.issue_date}</td>
                      <td>{rec.due_date}</td>
                      <td>{rec.date_returned || "-"}</td>
                      <td className="fw-semibold">{getStatus(rec)}</td>
                    </tr>

                    {expandedRows.includes(rec.id) && (
                      <tr className="expanded-row">
                        <td colSpan={8}>
                          <div className="expanded-content">
                            <p>
                              <strong>Book ID:</strong> {rec.book_copy?.id}
                            </p>
                            <p>
                              <strong>Status:</strong> {getStatus(rec)}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/circulation/return/${rec.id}`);
                                }}
                              >
                                ✅ Return
                              </button>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert("Renew Book");
                                }}
                              >
                                🔄 Renew
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CirculationPage;
