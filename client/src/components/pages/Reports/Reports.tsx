import { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import * as XLSX from "xlsx";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const Reports = () => {
  useEffect(() => {
    document.title = "Reports";
    fetchCollectionReports();
  }, []);

  const [activeTab, setActiveTab] = useState("collection");
  const [loading, setLoading] = useState(true);
  const [loadingMasterlist, setLoadingMasterlist] = useState(false);

  type ReportData = {
    materialsByType: { name: string; value: number }[];
    booksPerMonth: { month: string; books: number }[];
    sourcesPercentage: { name: string; value: number }[];
    booksPerDDC: { category: string; books: number }[];
  };

  const [reportData, setReportData] = useState<ReportData>({
    materialsByType: [],
    booksPerMonth: [],
    sourcesPercentage: [],
    booksPerDDC: [],
  });

  const [masterlist, setMasterlist] = useState<any[]>([]);

  const [circulationData, setCirculationData] = useState<any[]>([]);
  const [totals, setTotals] = useState({
    borrowed: 0,
    returned: 0,
    renewed: 0,
    overdue: 0,
    fines: 0,
  });
  const [loadingCirculation, setLoadingCirculation] = useState(false);

  const DDC_COLORS: Record<string, string> = {
    Technology: "#3B82F6",
    Religion: "#10B981",
    Philosophy: "#F59E0B",
    "General Works": "#EF4444",
    Arts: "#8B5CF6",
    Languages: "#EC4899",
    Literature: "#14B8A6",
    "Social Sciences": "#F87171",
    Science: "#FBBF24",
    "History and geography": "#60A5FA",
  };

  const fetchCollectionReports = async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance.get("/reports/collection");

      const ddcCategories: Record<string, string> = {
        "000": "Technology",
        "100": "Religion",
        "200": "Philosophy",
        "300": "General Works",
        "400": "Arts",
        "500": "Languages",
        "600": "Literature",
        "700": "Social Sciences",
        "800": "Science",
        "900": "History and geography",
      };

      // Initialize counts
      const counts: Record<string, number> = {};
      Object.values(ddcCategories).forEach((cat) => (counts[cat] = 0));

      res.data.booksByCategory.forEach((item: any) => {
        const category = item.category || "Other";
        const total = Number(item.total) || 0;
        counts[category] += total;
      });

      const booksPerDDC = Object.values(ddcCategories).map((name) => ({
        category: name,
        books: counts[name] || 0,
      }));

      setReportData({
        materialsByType: res.data.materialsByType.map((item: any) => ({
          name: item.material_type || item.name,
          value: item.total || item.value,
        })),
        booksPerMonth: res.data.booksPerMonth.map((item: any) => ({
          month: item.month,
          books: item.total,
        })),
        sourcesPercentage: res.data.sources.map((item: any) => ({
          name: item.source || item.name,
          value: item.total || item.value,
        })),
        booksPerDDC,
      });

      // Fetch masterlist
      fetchMasterlist();
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export masterlist to Excel
  const exportMasterlistToExcel = () => {
    if (!masterlist.length) return;

    // Map data for Excel
    const data = masterlist.map((copy) => ({
      "Accession #": copy.accession_number,
      Barcode: copy.barcode,
      "Copy #": copy.copy_number,
      Title: copy.book?.title,
      Contributor: [
        copy.book?.author,
        copy.book?.editor,
        copy.book?.other_author_editor,
      ]
        .filter(Boolean)
        .join(", "),
      Edition: copy.book?.edition,
      Series: copy.book?.series_name,
      Volume: copy.book?.volume,
      Publisher: copy.book?.publisher,
      "Place of Publication": copy.book?.place_of_publication,
      Copyright: copy.book?.copyright,
      Pages: copy.book?.number_of_pages,
      Language: copy.book?.book_language,
      Subjects: (() => {
        if (!copy.book?.topical_subject) return "N/A";
        try {
          // Try parsing if it's a stringified array
          const subjects = Array.isArray(copy.book.topical_subject)
            ? copy.book.topical_subject
            : JSON.parse(copy.book.topical_subject);
          return subjects.length ? subjects.join(", ") : "N/A";
        } catch {
          // Fallback if it's just a string
          return copy.book.topical_subject || "N/A";
        }
      })(),
      "Person as Subject": copy.book?.person_as_subject,
      ISBN: copy.book?.isbn,
      DDC: copy.book?.dewey_decimal,
      "Call Number": copy.book?.call_number,
      "Material Type": copy.material_type,
      "Cataloging Note": copy.cataloging_note,
      Source: copy.source,
      "Source Person": copy.source_person,
      Status: copy.status,
      "Date Added": copy.date_added,
    })) as Record<string, any>[];

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-adjust column widths based on content
    const cols = Object.keys(data[0]).map((key) => {
      const maxLength = Math.max(
        key.length, // header length
        ...data.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: Math.min(maxLength + 2, 50) }; // optional max width 50
    });
    worksheet["!cols"] = cols;

    // Style header row (first row)
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true, sz: 20 }, // bold + larger font
        alignment: { horizontal: "center" },
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Masterlist");

    // Directly download Excel file
    XLSX.writeFile(workbook, "masterlist.xlsx");
  };

  const fetchMasterlist = async () => {
    setLoadingMasterlist(true);
    try {
      const res = await AxiosInstance.get("/reports/collection-masterlist");
      setMasterlist(res.data);
    } catch (error) {
      console.error("Error fetching masterlist:", error);
    } finally {
      setLoadingMasterlist(false);
    }
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // For the circulation tab
  useEffect(() => {
    if (activeTab === "circulation") {
      const fetchCirculationReports = async () => {
        setLoadingCirculation(true);
        try {
          const res = await AxiosInstance.get("/reports/circulation");
          setCirculationData(res.data.rows);
          setTotals(res.data.summary);
          console.log(res.data.rows);
        } catch (error) {
          console.error("Error fetching circulation reports:", error);
        } finally {
          setLoadingCirculation(false);
        }
      };

      fetchCirculationReports();
    }
  }, [activeTab]);

  // Sort descending by year_month
  const sortedCirculation = [...circulationData].sort((a, b) =>
    b.year_month > a.year_month ? 1 : -1
  );

  const renderTabContent = () => {
    if (loading) {
      return <div className="loading">Loading report data...</div>;
    }

    switch (activeTab) {
      case "collection":
        return (
          <>
            <div className="charts-grid">
              {/* Donut Graph */}
              <div className="chart-card">
                <h2 className="chart-title">Composition by Material Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.materialsByType}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      label
                    >
                      {reportData.materialsByType.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Line Graph */}
              <div className="chart-card">
                <h2 className="chart-title">Collection of Growth Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.booksPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      type="number"
                      tickFormatter={(value) => Math.round(value).toString()}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="books"
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Graph */}
              <div className="chart-card">
                <h2 className="chart-title">Inventory Control</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.sourcesPercentage}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {reportData.sourcesPercentage.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Graph */}
              <div className="chart-card">
                <h2 className="chart-title">Books per Category</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    layout="vertical"
                    data={reportData.booksPerDDC}
                    margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => Math.round(value).toString()}
                    />
                    <YAxis
                      dataKey="category"
                      type="category"
                      tick={{ width: 160 }}
                    />
                    <Tooltip />
                    <Bar dataKey="books">
                      {reportData.booksPerDDC.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={DDC_COLORS[entry.category] || "#10B981"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 📊 Collection Overview Summary */}
            <div className="collection-summary-section">
              <h2 className="summary-title">Collection Overview Summary</h2>
              <div className="summary-table-container">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Material Type</th>
                      <th>Total Materials</th>
                      <th>Total Collection</th>
                      <th>Active Circulation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Calculate total materials
                      const total = reportData.materialsByType.reduce(
                        (sum, item) => sum + item.value,
                        0
                      );

                      return reportData.materialsByType.map((item) => {
                        const activePercent =
                          Math.floor(Math.random() * 50) + 20;

                        return (
                          <tr key={item.name}>
                            <td>{item.name}</td>
                            <td>{item.value}</td>
                            <td>{((item.value / total) * 100).toFixed(2)}%</td>
                            <td>{activePercent}%</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Masterlist Table */}
            <div className="masterlist-section">
              <div className="masterlist-header">
                <h2 className="masterlist-title">Collection Masterlist</h2>
                <button
                  className="print-button"
                  onClick={exportMasterlistToExcel}
                >
                  📄 Export to Excel
                </button>
              </div>
              {loadingMasterlist ? (
                <div>Loading masterlist...</div>
              ) : (
                <div className="masterlist-container">
                  <table className="masterlist-table">
                    <thead>
                      <tr>
                        <th>Accession Number</th>
                        <th>Barcode</th>
                        <th>Copy Number</th>
                        <th>Title</th>
                        <th>Contributor</th>
                        <th>Edition</th>
                        <th>Series</th>
                        <th>Volume</th>
                        <th>Publisher</th>
                        <th>Place of Publication</th>
                        <th>Copyright</th>
                        <th>Pages</th>
                        <th>Language</th>
                        <th>Subjects</th>
                        <th>Person as Subject</th>
                        <th>ISBN</th>
                        <th>DDC</th>
                        <th>Call Number</th>
                        <th>Material Type</th>
                        <th>Cataloging Note</th>
                        <th>Source</th>
                        <th>Source Person</th>
                        <th>Status</th>
                        <th>Date Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masterlist.map((copy, i) => (
                        <tr key={i}>
                          <td>{copy.accession_number}</td>
                          <td>{copy.barcode}</td>
                          <td>{copy.copy_number}</td>
                          <td>{copy.book?.title}</td>
                          <td>
                            {[
                              copy.book?.author,
                              copy.book?.editor,
                              copy.book?.other_author_editor,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </td>
                          <td>{copy.book?.edition}</td>
                          <td>{copy.book?.series_name}</td>
                          <td>{copy.book?.volume}</td>
                          <td>{copy.book?.publisher}</td>
                          <td>{copy.book?.place_of_publication}</td>
                          <td>{copy.book?.copyright}</td>
                          <td>{copy.book?.number_of_pages}</td>
                          <td>{copy.book?.book_language}</td>
                          <td>
                            {(() => {
                              if (!copy.book?.topical_subject) return "N/A";
                              try {
                                const subjects = Array.isArray(
                                  copy.book.topical_subject
                                )
                                  ? copy.book.topical_subject
                                  : JSON.parse(copy.book.topical_subject);
                                return subjects.length
                                  ? subjects.join(", ")
                                  : "N/A";
                              } catch {
                                return copy.book.topical_subject || "N/A";
                              }
                            })()}
                          </td>
                          <td>{copy.book?.person_as_subject}</td>
                          <td>{copy.book?.isbn}</td>
                          <td>{copy.book?.dewey_decimal}</td>
                          <td>{copy.book?.call_number}</td>
                          <td>{copy.material_type}</td>
                          <td>{copy.cataloging_note}</td>
                          <td>{copy.source}</td>
                          <td>{copy.source_person}</td>
                          <td>{copy.status}</td>
                          <td>{copy.date_added}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        );

      case "circulation":
        if (loadingCirculation) {
          return <div>Loading circulation data...</div>;
        }

        return (
          <div className="circulation-section">
            {/* ===== Row 1: Chart + Tally Cards ===== */}
            <div className="circulation-top">
              {/* Left: Bar Chart */}
              <div className="circulation-chart">
                <h2 className="chart-title">Monthly Circulation Report</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={circulationData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="borrowed" fill="#3B82F6" name="Borrowed" />
                    <Bar dataKey="returned" fill="#10B981" name="Returned" />
                    <Bar dataKey="renewed" fill="#F59E0B" name="Renewed" />
                    <Bar dataKey="overdue" fill="#EF4444" name="Overdue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Right: Tally Cards */}
              <div className="circulation-tallies">
                {[
                  {
                    label: "Borrowed",
                    value: totals.borrowed,
                    color: "#3B82F6",
                  },
                  {
                    label: "Returned",
                    value: totals.returned,
                    color: "#10B981",
                  },
                  { label: "Renewed", value: totals.renewed, color: "#F59E0B" },
                  { label: "Overdue", value: totals.overdue, color: "#EF4444" },
                ].map((tally) => (
                  <div
                    className="tally-card-circ"
                    key={tally.label}
                    style={{ borderLeft: `6px solid ${tally.color}` }}
                  >
                    <div className="label">{tally.label}</div>
                    <div className="value">{tally.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== Row 2: Summary Table ===== */}
            <div className="circulation-table-section">
              <h2 className="summary-title">Circulation Summary Table</h2>
              <div className="table-wrapper">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Borrowed</th>
                      <th>Returned</th>
                      <th>Renewed</th>
                      <th>Overdue</th>
                      <th>Fines</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCirculation.length > 0 ? (
                      sortedCirculation.map((row, i) => (
                        <tr key={i}>
                          <td>{row.month}</td>
                          <td>{row.borrowed}</td>
                          <td>{row.returned}</td>
                          <td>{row.renewed}</td>
                          <td>{row.overdue}</td>
                          <td>₱{Number(row.fines ?? 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center" }}>
                          No circulation data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "attendance":
        return (
          <div className="placeholder">
            🧍 Attendance reports coming soon...
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="reports-container">
      <h1 className="reports-title">Reports</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "collection" ? "active" : ""}`}
          onClick={() => setActiveTab("collection")}
        >
          Collection Reports
        </button>
        <button
          className={`tab-button ${
            activeTab === "circulation" ? "active" : ""
          }`}
          onClick={() => setActiveTab("circulation")}
        >
          Circulation Reports
        </button>
        <button
          className={`tab-button ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance Reports
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Reports;
