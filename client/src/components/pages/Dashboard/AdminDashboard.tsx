import { useEffect, useState } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import AxiosInstance from "../../../AxiosInstance";
import attendance from "../../../assets/icons/g-green.png";
import borrow from "../../../assets/icons/g-blue.png";
import returned from "../../../assets/icons/g-orange.png";
import overdue from "../../../assets/icons/g-red.png";
import placeholder from "../../../assets/cover_placeholder.jpg";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface AdminDashboardProps {
  user?: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    suffix?: string | null;
    avatar?: string;
    role?: string;
    name?: string | null;
  };
}

interface PatronVisit {
  name: string;
  visits: number;
}

interface BorrowedBook {
  title: string;
  borrowed_count: number;
}

interface TallyWithPercentage {
  count: number;
  percent: number;
}

interface CirculationTally {
  borrowed: TallyWithPercentage;
  returned: TallyWithPercentage;
  overdue: TallyWithPercentage;
}

interface Book {
  id: number;
  title: string;
  cover_image?: string | null;
  copyright?: string | null;
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [attendanceToday, setAttendanceToday] = useState<TallyWithPercentage>({
    count: 0,
    percent: 0,
  });
  const [circulationToday, setCirculationToday] = useState<CirculationTally>({
    borrowed: { count: 0, percent: 0 },
    returned: { count: 0, percent: 0 },
    overdue: { count: 0, percent: 0 },
  });
  const [topPatrons, setTopPatrons] = useState<PatronVisit[]>([]);
  const [topBooks, setTopBooks] = useState<BorrowedBook[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [loadingUser, setLoadingUser] = useState(true);
  const [latestBooks, setLatestBooks] = useState<Book[]>([]);

  // -------------------------------
  // Fetch current user info
  // -------------------------------
  useEffect(() => {
    document.title = "Admin Dashboard";
    const token = localStorage.getItem("authToken");
    if (!token) return;

    AxiosInstance.get("/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const u = res.data;
        const name = [u.first_name, u.middle_name, u.last_name, u.suffix]
          .filter(Boolean)
          .join(" ");
        setUserName(name || "Guest");
      })
      .catch((err) => console.error("Failed to fetch user:", err))
      .finally(() => setLoadingUser(false));
  }, []);

  // -------------------------------
  // Update dashboard data
  // -------------------------------
  const fetchDashboardData = () => {
    // Attendance today
    AxiosInstance.get("/attendances/today-tally")
      .then((res) => {
        setAttendanceToday({
          count: res.data.attendanceToday ?? 0,
          percent: res.data.percent ?? 0,
        });
      })
      .catch((err) => console.error("Failed to fetch attendance tally:", err));

    // Top patrons this week
    AxiosInstance.get("/attendances/patrons-this-week")
      .then((res) => {
        const startOfWeek = dayjs().startOf("isoWeek"); // Monday
        const endOfWeek = dayjs().endOf("isoWeek"); // Sunday

        const weekly = res.data.filter((a: any) => {
          const date = dayjs(a.time_in);
          return (
            date.isSameOrAfter(startOfWeek) && date.isSameOrBefore(endOfWeek)
          );
        });

        const patronMap: Record<string, number> = {};
        weekly.forEach((att: any) => {
          const name = [
            att.first_name,
            att.middle_name,
            att.last_name,
            att.suffix,
          ]
            .filter(Boolean)
            .join(" ");
          patronMap[name] = (patronMap[name] || 0) + 1;
        });

        const top = Object.entries(patronMap)
          .map(([name, visits]) => ({ name, visits }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 5);

        setTopPatrons(top);
      })
      .catch((err) => console.error("Failed to fetch top patrons:", err));

    // Borrowed/Returned/Overdue today
    AxiosInstance.get("/circulations/today-tally")
      .then((res) => {
        setCirculationToday({
          borrowed: {
            count: res.data.borrowed.count,
            percent: res.data.borrowed.percent,
          },
          returned: {
            count: res.data.returned.count,
            percent: res.data.returned.percent,
          },
          overdue: {
            count: res.data.overdue.count,
            percent: res.data.overdue.percent,
          },
        });
      })
      .catch((err) => console.error(err));

    // Top borrowed books this week
    AxiosInstance.get("/circulation/top-books-week")
      .then((res) => setTopBooks(res.data))
      .catch((err) => console.error("Failed to fetch top books:", err));
  };

  // Fetch latest 7 books from backend
  useEffect(() => {
    AxiosInstance.get("/books/latest")
      .then((res) => setLatestBooks(res.data))
      .catch((err) => console.error(err));
  }, []);

  // -------------------------------
  // Initial fetch + auto-refresh
  // -------------------------------
  useEffect(() => {
    fetchDashboardData();

    // Update currentDate every minute
    const interval = setInterval(() => {
      setCurrentDate(dayjs());
      fetchDashboardData(); // auto-refresh dashboard
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Top Row */}
      <div className="top-row">
        <div className="welcome-section">
          <h2>
            Welcome Back,{" "}
            {loadingUser ? (
              <span
                style={{
                  display: "inline-block",
                  width: "150px",
                  height: "30px",
                  background: "#e0e0e0",
                  borderRadius: "4px",
                  animation: "pulse 1.5s infinite",
                }}
              ></span>
            ) : (
              userName
            )}
            !
          </h2>
          {/* Current Date/Time */}
          <p>{currentDate.format("MMMM D, YYYY | dddd, h:mm a")}</p>
        </div>
        {/* Search Bar */}
        <div className="position-relative" style={{ maxWidth: "900px" }}>
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
      </div>

      {/* Tally Row */}
      <div className="tally-rows">
        <div className="tally-cards blue">
          <div className="top mb-0">
            <img src={attendance} />
            <span className="value mb-0">{attendanceToday.count}</span>
          </div>
          <div className="label mb-0">Visitors Today</div>
          <div className="percent">
            {attendanceToday.percent}%<span> from yesterday</span>
          </div>
        </div>

        <div className="tally-cards green">
          <div className="top mb-0">
            <img src={borrow} />
            <span className="value mb-0">
              {circulationToday.borrowed.count}
            </span>
          </div>
          <div className="label mb-0">Materials Borrowed Today</div>
          <div className="percent">
            {circulationToday.borrowed.percent}%<span> from yesterday</span>
          </div>
        </div>

        <div className="tally-cards yellow">
          <div className="top mb-0">
            <img src={returned} />
            <span className="value mb-0">
              {circulationToday.returned.count}
            </span>
          </div>
          <div className="label mb-0">Book Returned Today</div>
          <div className="percent">
            {circulationToday.returned.percent}%<span> from yesterday</span>
          </div>
        </div>

        <div className="tally-cards red">
          <div className="top mb-0">
            <img src={overdue} />
            <span className="value mb-0">{circulationToday.overdue.count}</span>
          </div>
          <div className="label mb-0">Overdue Books</div>
          <div className="percent">
            {circulationToday.overdue.percent}%<span> from yesterday</span>
          </div>
        </div>
      </div>

      {/* Top 5 Row */}
      <div className="top5-row">
        <div className="top5-card">
          <h2>Top 5 Patrons This Week</h2>
          <ul>
            <li>
              <span className="text-muted">Name</span>
              <span className="text-muted">Visits</span>
            </li>
            {topPatrons.map((patron, idx) => (
              <li key={idx}>
                <span>{patron.name}</span>
                <span>{patron.visits}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="top5-card">
          <h2>Top 5 Borrowed Books</h2>
          <ul>
            <li>
              <span className="text-muted">Title</span>
              <span className="text-muted">Borrow Count</span>
            </li>
            {topBooks.map((book, idx) => (
              <li key={idx}>
                <span>{book.title}</span>
                <span>{book.borrowed_count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Latest Books */}
      <div className="guestdashboard">
        <h1>Circulation</h1>
        <div className="book-cards">
          {latestBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <img
                src={
                  book.cover_image
                    ? `http://127.0.0.1:8000/storage/${book.cover_image}`
                    : placeholder
                }
                alt={book.title}
                className="book-image"
              />
              <p className="book-title">{book.title}</p>
              <small className="book-copyright">
                {book.copyright || "Unknown"}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
