import React, { useState, useEffect, useRef } from "react";
import AxiosInstance from "../../../AxiosInstance";
import LoadingSpinner from "../../LoadingSpinner";
import { useNavigate } from "react-router-dom";

interface Staff {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_login_at: string | null;
}

interface Patron {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  email: string;
  status: string;
  created_at: string;
  last_login_at: string | null;
}

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [patronList, setPatronList] = useState<Patron[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Initialize all fields
  const [formData, setFormData] = useState({
    role: "staff",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    phone: "",
    email: "",
    password: "",
    status: "active",
  });

  const fetchStaff = async () => {
    try {
      setLoading(true); // start loading
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      const res = await AxiosInstance.get("/staff", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStaffList(res.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const fetchPatrons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      const res = await AxiosInstance.get("/patrons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatronList(res.data);
    } catch (err) {
      console.error("Error fetching patrons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchPatrons();
  }, []);

  // Combine all users for searching, filtering, and sorting
  const allUsers = [...staffList, ...patronList];

  useEffect(() => {
    setCurrentPage(1); // Reset page when searching
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Combine name fields into a single name for backend
    const fullName = [
      formData.first_name,
      formData.middle_name,
      formData.last_name,
      formData.suffix,
    ]
      .filter(Boolean)
      .join(" ");

    try {
      await AxiosInstance.post("/staff", {
        name: fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: formData.status,
        phone: formData.phone, // optional, backend needs to support this later
      });

      setShowModal(false);
      setFormData({
        role: "staff",
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        phone: "",
        email: "",
        password: "",
        status: "active",
      });

      fetchStaff();
    } catch (err) {
      console.error("Error saving staff:", err);
    }
  };

  // Close filter menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterMenuOpen(false);
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered & Sorted Staff
  const filteredUsers = allUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.first_name} ${u.middle_name ?? ""} ${u.last_name} ${u.suffix ?? ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOption === "name_asc")
      return a.first_name.localeCompare(b.first_name);
    if (sortOption === "name_desc")
      return b.first_name.localeCompare(a.first_name);
    if (sortOption === "date_asc")
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    if (sortOption === "date_desc")
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="user-page mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="text-xl font-semibold mb-0">Staff Accounts</h1>
          <p className="mb-0">
            <i>Manage and view all registered staff accounts.</i>
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center">
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

          {/* Filter */}
          <div className="position-relative" ref={filterRef}>
            <button
              className="btn btn-outline-secondary d-flex align-items-center"
              onClick={(e) => {
                e.stopPropagation();
                setFilterMenuOpen(!filterMenuOpen);
                setActiveFilter(null);
              }}
            >
              <i className="bi bi-sliders me-2"></i> Filter
            </button>

            {filterMenuOpen && (
              <div
                className="dropdown-menu show"
                style={{ position: "absolute", zIndex: 9999 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="dropdown-item"
                  onClick={() =>
                    setActiveFilter(activeFilter === "name" ? null : "name")
                  }
                >
                  Name
                </button>
                {activeFilter === "name" && (
                  <div className="ms-3">
                    <button
                      className="dropdown-item"
                      onClick={() => setSortOption("name_asc")}
                    >
                      <i className="bi bi-sort-alpha-down"></i> Asc
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => setSortOption("name_desc")}
                    >
                      <i className="bi bi-sort-alpha-up"></i> Desc
                    </button>
                  </div>
                )}
                <button
                  className="dropdown-item"
                  onClick={() =>
                    setActiveFilter(activeFilter === "date" ? null : "date")
                  }
                >
                  Date
                </button>
                {activeFilter === "date" && (
                  <div className="ms-3">
                    <button
                      className="dropdown-item"
                      onClick={() => setSortOption("date_asc")}
                    >
                      <i className="bi bi-sort-numeric-down"></i> Asc
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => setSortOption("date_desc")}
                    >
                      <i className="bi bi-sort-numeric-down"></i> Desc
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="user-btn" onClick={() => setShowModal(true)}>
            + Add Staff
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : currentUsers.length > 0 ? (
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date Created</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr
                key={`${user.id}-${index}`}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  // 👇 Navigate based on user type
                  if ("role" in user) {
                    navigate(`/admin/accounts/staff/${user.id}`);
                  } else {
                    navigate(`/admin/accounts/patron/${user.id}`);
                  }
                }}
              >
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{user.email}</td>
                <td>
                  {[
                    user.first_name,
                    user.middle_name,
                    user.last_name,
                    user.suffix,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </td>
                <td>
                  {"role" in user && typeof user.role === "string"
                    ? user.role
                    : "patron"}
                </td>

                <td>
                  <span
                    className={`status-pill status-${
                      user.status?.toLowerCase() ?? ""
                    }`}
                  >
                    {user.status ?? "N/A"}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString()
                    : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p>
      )}

      {/* Pagination info */}
      {sortedUsers.length > 0 && (
        <div className="pagination-info text-center mb-2 mt-3">
          Showing {indexOfFirstItem + 1} -{" "}
          {Math.min(indexOfLastItem, sortedUsers.length)} of{" "}
          {sortedUsers.length} user
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination mt-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <i className="bi bi-chevron-double-left"></i> Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next <i className="bi bi-chevron-double-right"></i>
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="mb-0">ADD NEW USER</h2>
            <p>
              <i>Fill out the details below to create a new user.</i>
            </p>
            <hr />

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Role */}
                <div className="name-row mb-1">
                  <label className="row-label">Role</label>
                  <select
                    className="form-control"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* ✅ Full Name Row */}
                <div className="name-row mb-1">
                  <label className="row-label">Full Name</label>
                  <div className="inputs">
                    <input
                      type="text"
                      placeholder="First Name"
                      required
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          first_name: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Middle Name"
                      value={formData.middle_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          middle_name: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          last_name: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Suffix"
                      value={formData.suffix}
                      onChange={(e) =>
                        setFormData({ ...formData, suffix: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="name-row">
                  <label className="row-label">Number</label>
                  <input
                    type="text"
                    placeholder="Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Email + Password */}
                <div className="inline-row mb-1" style={{ gap: "30px" }}>
                  <div className="inline-row inline-grow">
                    <label className="inline-label">Email</label>
                    <input
                      type="email"
                      placeholder="email"
                      style={{ width: "240px" }}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="inline-row inline-grow">
                    <label className="inline-label">Password</label>
                    <input
                      type="password"
                      placeholder="password"
                      style={{ width: "240px" }}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Save User
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
  );
};

export default Accounts;
