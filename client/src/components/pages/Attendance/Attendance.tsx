import { useEffect, useState, useRef } from "react";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../LoadingSpinner";

interface Attendance {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  email?: string;
  province?: string;
  city?: string;
  barangay?: string;
  number?: string;
  affiliation?: string;
  purpose_of_visit?: string;
  time_in: string | null;
  time_out: string | null;
}

const Attendance = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false); // <-- loading state

  // Filter dropdown state
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [statusValue, setStatusValue] = useState<"all" | "in" | "out">("all");

  const filterRef = useRef<HTMLDivElement>(null);

  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [filterWeek, setFilterWeek] = useState<number | null>(null);
  const [showDateOptions, setShowDateOptions] = useState(false);

  useEffect(() => {
    fetchAttendances();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchAttendances = async () => {
    setLoading(true); // start loading
    try {
      const res = await AxiosInstance.get("/attendances");
      setAttendances(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleTimeOut = async (id: number) => {
    setLoading(true);
    try {
      await AxiosInstance.post(`/attendances/${id}/timeout`);
      fetchAttendances();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const matchesDate = (att: Attendance) => {
    if (!filterYear) return true;

    const attDate = new Date(att.time_in || "");
    const yearMatch = attDate.getFullYear() === filterYear;
    const monthMatch =
      filterMonth !== null ? attDate.getMonth() === filterMonth : true;
    const weekMatch =
      filterWeek !== null
        ? Math.ceil(attDate.getDate() / 7) === filterWeek
        : true;

    return yearMatch && monthMatch && weekMatch;
  };

  // Then in filteredAttendances:
  const filteredAttendances = attendances.filter((att) => {
    const matchesSearch =
      `${att.first_name} ${att.middle_name || ""} ${att.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      att.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${att.province || ""} ${att.city || ""} ${att.barangay || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      att.purpose_of_visit?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusValue === "all"
        ? true
        : statusValue === "in"
        ? !att.time_out
        : !!att.time_out;

    return matchesSearch && matchesStatus && matchesDate(att);
  });


  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Address",
      "Number",
      "Affiliation",
      "Purpose",
      "Time In",
      "Time Out",
      "Status",
    ];
    const rows = filteredAttendances.map((att) => [
      `"${att.first_name} ${att.middle_name || ""} ${att.last_name} ${
        att.suffix || ""
      }"`,
      `"${att.email || "-"}"`,
      `"${att.province || "-"}, ${att.city || "-"}, ${att.barangay || "-"}"`,
      `"${att.number || "-"}"`,
      `"${att.affiliation || "-"}"`,
      `"${att.purpose_of_visit || "-"}"`,
      `"${att.time_in ? new Date(att.time_in).toLocaleString() : "-"}"`,
      `"${att.time_out ? new Date(att.time_out).toLocaleString() : "-"}"`,
      `"${att.time_out ? "Timed Out" : "Timed In"}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "attendance_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="attendance-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="text-xl font-semibold mb-0">Library Attendance</h1>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          {/* Search */}
          <div className="position-relative" style={{ maxWidth: "300px" }}>
            <span
              className="position-absolute top-50 translate-middle-y ps-2"
              style={{ left: "10px", color: "#6c757d" }}
            >
              <i className="bi bi-search"></i>
            </span>
            <input
              className="form-control ps-5 pe-5"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="position-relative" ref={filterRef}>
            <button
              className="btn btn-outline-secondary d-flex align-items-center"
              onClick={(e) => {
                e.stopPropagation();
                setFilterMenuOpen(!filterMenuOpen);
              }}
            >
              <i className="bi bi-sliders me-2"></i> Filter
            </button>

            {filterMenuOpen && (
              <div className="filter-dropdown p-2 bg-white border shadow-sm">
                {/* Status Filter */}
                <div
                  className={`filter-section-header ${
                    statusValue !== "all" ? "active" : ""
                  }`}
                  onClick={() => setShowStatusOptions(!showStatusOptions)}
                >
                  Status{" "}
                  <i
                    className={`bi ${
                      showStatusOptions ? "bi-chevron-down" : "bi-chevron-right"
                    } ms-2`}
                  ></i>
                </div>
                {showStatusOptions && (
                  <div className="d-flex flex-column">
                    {["all", "in", "out"].map((opt) => (
                      <div
                        key={opt}
                        className={`filter-item px-2 py-1 ${
                          statusValue === opt
                            ? "active bg-primary text-white"
                            : "cursor-pointer"
                        }`}
                        onClick={() =>
                          setStatusValue(opt as "all" | "in" | "out")
                        }
                      >
                        {opt === "all"
                          ? "All Status"
                          : opt === "in"
                          ? "Timed In"
                          : "Timed Out"}
                      </div>
                    ))}
                  </div>
                )}

                {/* Date Filter */}
                <div
                  className={`filter-section-header ${
                    filterYear || filterMonth !== null || filterWeek !== null
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    if (showDateOptions) {
                      setFilterYear(null);
                      setFilterMonth(null);
                      setFilterWeek(null);
                    }
                    setShowDateOptions(!showDateOptions);
                  }}
                >
                  Date Added{" "}
                  <i
                    className={`bi ${
                      showDateOptions ? "bi-chevron-down" : "bi-chevron-right"
                    } ms-2`}
                  ></i>
                </div>

                {showDateOptions && (
                  <div
                    className="filter-date-options d-flex"
                    style={{ gap: "2px" }}
                  >
                    {/* Year */}
                    <select
                      value={filterYear ?? ""}
                      onChange={(e) =>
                        setFilterYear(e.target.value ? +e.target.value : null)
                      }
                      className="form-select form-select-sm"
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>

                    {/* Month */}
                    <select
                      value={filterMonth ?? ""}
                      onChange={(e) =>
                        setFilterMonth(e.target.value ? +e.target.value : null)
                      }
                      className="form-select form-select-sm"
                      disabled={!filterYear}
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(0, i).toLocaleString("default", {
                            month: "short",
                          })}
                        </option>
                      ))}
                    </select>

                    {/* Week */}
                    <select
                      value={filterWeek ?? ""}
                      onChange={(e) =>
                        setFilterWeek(e.target.value ? +e.target.value : null)
                      }
                      className="form-select form-select-sm"
                      disabled={!filterYear || !filterMonth}
                    >
                      <option value="">Week</option>
                      {Array.from({ length: 5 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="btn btn-secondary" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Number</th>
              <th>Affiliation</th>
              <th>Purpose</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-4">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredAttendances.length > 0 ? (
              filteredAttendances.map((att) => (
                <tr key={att.id}>
                  <td>{`${att.first_name} ${att.middle_name || ""} ${
                    att.last_name
                  } ${att.suffix || ""}`}</td>
                  <td>{att.email || "-"}</td>
                  <td>{`${att.barangay || "-"}, ${att.city || "-"}, ${
                    att.province || "-"
                  }`}</td>
                  <td>{att.number || "-"}</td>
                  <td>{att.affiliation || "-"}</td>
                  <td>{att.purpose_of_visit || "-"}</td>
                  <td>
                    {att.time_in ? new Date(att.time_in).toLocaleString() : "-"}
                  </td>
                  <td>
                    {att.time_out
                      ? new Date(att.time_out).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        att.time_out ? "status-out" : "status-in"
                      }`}
                    >
                      {att.time_out ? "Timed Out" : "Timed In"}
                    </span>
                  </td>
                  <td>
                    {!att.time_out && (
                      <button
                        onClick={() => handleTimeOut(att.id)}
                        className="timeout-btn"
                      >
                        Time Out
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-4">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
