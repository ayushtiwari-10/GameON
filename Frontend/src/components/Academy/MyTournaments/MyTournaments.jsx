import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Search,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Plus,
} from "lucide-react";
import "./MyTournament.css";
import tournamentService from "../../../../../Backend/src/api/services/tournamentService.js"; // Adjust the path as needed

const MyTournament = () => {
  const { academyId } = useParams(); // Extract academyId from URL
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tournaments from backend
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await tournamentService.academy.getAll(academyId);

        // Add status field based on tournament dates if not already included
        const processedTournaments = response.map((tournament) => {
          // This is a simple example - adjust according to your actual data structure
          const startDate = new Date(
            tournament.start_date || tournament.date.split("-")[0]
          );
          const endDate = new Date(
            tournament.end_date || tournament.date.split("-")[1]
          );
          const today = new Date();

          let status;
          if (endDate < today) {
            status = "Completed";
          } else if (startDate <= today && today <= endDate) {
            status = "Ongoing";
          } else {
            status = "Upcoming";
          }

          return {
            ...tournament,
            status: tournament.status || status,
            // Ensure there's an image property
            image:
              tournament.banner_url ||
              tournament.image ||
              "/api/placeholder/60/60",
          };
        });

        setTournaments(processedTournaments);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tournaments:", err);
        setError("Failed to load tournaments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (academyId) {
      fetchTournaments();
    }
  }, [academyId]);

  // Filter tournaments based on active tab and search term
  useEffect(() => {
    let filtered = tournaments;

    // Filter by status/tab
    if (activeTab !== "All") {
      filtered = filtered.filter(
        (tournament) => tournament.status === activeTab
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tournament) =>
          tournament.title?.toLowerCase().includes(term) ||
          tournament.location?.toLowerCase().includes(term)
      );
    }

    setFilteredTournaments(filtered);
  }, [tournaments, activeTab, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle tournament click to view details
  const handleViewTournament = (tournamentId) => {
    // Navigate to tournament details page
    window.location.href = `/academy/${academyId}/tournament/${tournamentId}`;
  };

  return (
    <div className="tournaments-page">
      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Academy Tournaments</h1>
          <Link to={`/academy/${academyId}/tournament/create-tournament`}>
            <button className="host-tournament-btn">
              <Plus size={20} className="btn-icon" />
              Host a New Tournament
            </button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-container">
          <div className="filter-row">
            <div className="search-box">
              <div className="search-icon">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search tournaments..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            {["All", "Upcoming", "Ongoing", "Completed"].map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? "active-tab" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tournament List */}
          <div className="tournament-list">
            {loading ? (
              <div className="loading-state">Loading tournaments...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : filteredTournaments.length > 0 ? (
              filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="tournament-item"
                  onClick={() => handleViewTournament(tournament.id)}
                >
                  <div className="tournament-info">
                    <img
                      src={tournament.image}
                      alt={tournament.title}
                      className="tournament-image"
                    />
                    <div className="tournament-details">
                      <h3 className="tournament-title">{tournament.title}</h3>
                      <div className="tournament-meta">
                        <div className="meta-item">
                          <MapPin size={14} className="meta-icon" />
                          {tournament.location}
                        </div>
                        <div className="meta-item">
                          <Calendar size={14} className="meta-icon" />
                          {tournament.date} •{" "}
                          {tournament.participants || "0 registered"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tournament-actions">
                    <span
                      className={`status-badge status-${tournament.status.toLowerCase()}`}
                    >
                      {tournament.status}
                    </span>
                    <button className="view-button">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No tournaments found for the selected filter.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyTournament;
