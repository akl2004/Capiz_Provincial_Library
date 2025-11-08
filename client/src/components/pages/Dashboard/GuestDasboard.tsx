import { useState, useEffect } from "react";
import AxiosInstance from "../../../AxiosInstance";
import guestHome1 from "../../../assets/carousel/guest-home1.png";
import guestHome2 from "../../../assets/carousel/guest-home2.jpg";
import guestHome3 from "../../../assets/carousel/guest-home3.png";
import guestHome4 from "../../../assets/carousel/guest-home4.png";
import guestHome5 from "../../../assets/carousel/guest-home5.png";
import placeholder from "../../../assets/cover_placeholder.jpg";
import { useNavigate } from "react-router-dom";

// Carousel images
const images = [guestHome1, guestHome2, guestHome3, guestHome4, guestHome5];

interface Book {
  id: number;
  title: string;
  cover_image?: string | null;
  copyright?: string | null;
}

const GuestDashboard = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [latestBooks, setLatestBooks] = useState<Book[]>([]);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  // Carousel effect
  useEffect(() => {
    document.title = "Guest Dashboard";
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch latest 7 books from backend
  useEffect(() => {
    AxiosInstance.get("/books/latest")
      .then((res) => setLatestBooks(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(() => {
      AxiosInstance.get(`/books/search?query=${searchTerm}`)
        .then((res) => {
          setSearchResults(res.data);
          setShowDropdown(true);
        })
        .catch((err) => console.error(err));
    }, 400); // debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div className="guest-dashboard">
      {/* Carousel */}
      <div className="carousel">
        <img
          src={images[currentImage]}
          alt={`Slide ${currentImage + 1}`}
          className="carousel-image"
        />
        <div className="carousel-dots">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${currentImage === idx ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="search-container">
        <div
          className="position-relative"
          style={{ maxWidth: "85%", margin: "0 auto" }}
        >
          <span
            className="position-absolute top-50 translate-middle-y ps-2"
            style={{ left: "10px", color: "#6c757d" }}
          >
            <i className="bi bi-search"></i>
          </span>
          <input
            className="form-control ps-5 pe-5"
            style={{ padding: "12px" }}
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchTerm.trim() !== "") {
                setShowDropdown(false); // ✅ Hide dropdown
                setSearchResults([]); // ✅ Clear old suggestions (for GuestDashboard)
                navigate(
                  `/guest/guestdashboard/search?query=${encodeURIComponent(
                    searchTerm
                  )}`
                );
              }
            }}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />

          {/* Dropdown for suggestions */}
          {showDropdown && searchResults.length > 0 && (
            <ul
              className="list-group position-absolute w-100"
              style={{
                top: "100%",
                left: 0,
                zIndex: 1000,
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {searchResults.map((book) => (
                <li
                  key={book.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    setSearchTerm(book.title);
                    setShowDropdown(false);
                    navigate(
                      `/guest/guestdashboard/search?query=${encodeURIComponent(
                        book.title
                      )}`
                    );
                  }}
                >
                  {book.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Latest Books */}
      <div className="guestdashboard">
        <h1>Recommended</h1>
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

export default GuestDashboard;
