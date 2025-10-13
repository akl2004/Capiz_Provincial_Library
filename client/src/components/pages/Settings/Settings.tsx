import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import timezones from "../../../data/time-zones/countries.json";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("System Settings");
  const [timezone, setTimezone] = useState(
    localStorage.getItem("timezone") || "Asia/Manila"
  );

  useEffect(() => {
    document.title = "Settings";
  }, []);

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimezone(e.target.value);
    localStorage.setItem("timezone", e.target.value);
  };

  const settingsTabs = [
    {
      tab: "System Settings",
      options: [
        {
          label: "Timezone Settings",
          desc: "Select the system timezone.",
          icon: "bi-globe",
          isCustom: true,
        },
      ],
    },
    {
      tab: "Circulation Policy",
      options: [
        {
          label: "Loan Duration",
          desc: "Set how long patrons can borrow items.",
          icon: "bi-clock",
          path: "/admin/settings/loan-days",
        },
        {
          label: "Maximum Borrowable Books",
          desc: "Set how many books a patron can borrow at once.",
          icon: "bi-journal-bookmark",
          path: "/admin/settings/max-books",
        },
        {
          label: "Fine per Day",
          desc: "Manage overdue fine rates.",
          icon: "bi-exclamation-triangle",
          path: "/admin/settings/fine-per-day",
        },
        {
          label: "Renewal Limit",
          desc: "Set the maximum number of renewals allowed.",
          icon: "bi-arrow-repeat",
          path: "/admin/settings/renewal-limit",
        },
      ],
    },
    {
      tab: "Account & Roles Settings",
      options: [
        {
          label: "Patron Expiration",
          desc: "Configure membership expiration rules.",
          icon: "bi-calendar-check",
          path: "/admin/settings/expiration-years",
        },
        {
          label: "Staff & Admin Management",
          desc: "Manage staff and admin accounts.",
          icon: "bi-people",
          path: "/admin/accounts",
        },
      ],
    },
  ];

  return (
    <div className="settings-container p-4">
      <h1 className="text-xl font-semibold mb-0">Settings</h1>
      <p className="mb-4">
        <i>Manage system rules and configurations below.</i>
      </p>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {settingsTabs.map((tab) => (
          <li className="nav-item" key={tab.tab}>
            <button
              className={`nav-link ${activeTab === tab.tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab.tab)}
            >
              {tab.tab}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab content */}
      <div className="tab-content">
        {settingsTabs.map(
          (tab) =>
            activeTab === tab.tab && (
              <div key={tab.tab} className="row g-4">
                {tab.options.map((opt) => (
                  <div className="col-md-6" key={opt.label}>
                    {"isCustom" in opt && opt.isCustom ? (
                      <div className="card h-100 shadow-sm p-3">
                        <h5 className="card-title mb-1">{opt.label}</h5>
                        <p className="card-text text-muted small">{opt.desc}</p>
                        <select
                          className="form-select mt-2"
                          value={timezone}
                          onChange={handleTimezoneChange}
                        >
                          {timezones.flatMap((country) =>
                            country.timezones.map((tz) => (
                              <option key={tz} value={tz}>
                                {tz}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    ) : (
                      <div
                        className="card h-100 shadow-sm cursor-pointer"
                        onClick={() => navigate((opt as { path: string }).path)}
                      >
                        <div className="card-body d-flex gap-3 align-items-start">
                          <i
                            className={`bi ${opt.icon} fs-3 settings-icon`}
                          ></i>
                          <div>
                            <h5 className="card-title mb-1">{opt.label}</h5>
                            <p className="card-text text-muted small">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Settings;
