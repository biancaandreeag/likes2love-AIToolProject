"use client"

import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/HistoryContainer.css"
import HistoryItem from "./HistoryItem"
import { generateDashboardUrl } from "../utils/slugUtils"

const HistoryContainer = forwardRef(({ onItemClick }, ref) => {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [historyItems, setHistoryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  // Funcție pentru a obține data ca Date object pentru filtrare
  const getDateForFiltering = (isoDateString) => {
    if (!isoDateString) return null
    try {
      return new Date(isoDateString)
    } catch (error) {
      return null
    }
  }

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("http://localhost:8000/get-history", {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Procesăm datele pentru a avea structura corectă
      const processed = data.map((item) => ({
        ...item,
        platform: item.platform || "Unknown",
        originalDate: item.analysis_date,
      }))

      setHistoryItems(processed)
    } catch (err) {
      setError(`Failed to fetch history: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    refreshHistory: fetchHistory,
  }))

  const handleItemClick = (item) => {
    // Generează URL-ul pentru dashboard
    const dashboardUrl = generateDashboardUrl(item.post_name, item.post_link, item.analysis_date)

    // Actualizează URL-ul fără a reîncărca pagina
    navigate(`/analysis/${dashboardUrl.split("/analysis/")[1]}`, { replace: false })

    // Dacă avem callback din părinte, îl apelăm și pe acela
    if (onItemClick) {
      onItemClick(item)
    }
  }

  const handleRenameItem = async (item, newName) => {
    try {
      // Actualizează local imediat pentru feedback vizual
      setHistoryItems((prevItems) =>
        prevItems.map((historyItem) =>
          historyItem.post_name === item.post_name && historyItem.analysis_date === item.analysis_date
            ? { ...historyItem, post_name: newName }
            : historyItem,
        ),
      )

      // Reîncarcă istoricul pentru a fi sigur că avem datele corecte
      await fetchHistory()
    } catch (error) {
      // Reîncarcă istoricul în caz de eroare
      await fetchHistory()
    }
  }

  const handleDeleteItem = async (item) => {
    try {
      console.log("🗑️ Deleting:", item.post_name, item.analysis_date)

      const response = await fetch(
        `http://localhost:8000/delete-post?post_name=${encodeURIComponent(item.post_name)}&analysis_date=${encodeURIComponent(item.analysis_date)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      await fetchHistory()

      alert("Analysis deleted successfully!")
    } catch (error) {
      alert(`Failed to delete: ${error.message}`)
    }
  }

  // Filtrăm itemele ținând cont de post_name/post_link, platform și date
  const filteredItems = historyItems.filter((item) => {
    const title = item.post_name || item.post_link || ""
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPlatform = selectedPlatform === "All" || item.platform === selectedPlatform

    let matchesDate = true
    if (startDate || endDate) {
      const itemDate = getDateForFiltering(item.originalDate)
      if (itemDate) {
        if (startDate && new Date(startDate) > itemDate) matchesDate = false
        if (endDate && new Date(endDate) < itemDate) matchesDate = false
      } else {
        // Dacă nu avem dată validă, nu o includem în filtrare
        matchesDate = false
      }
    }

    return matchesSearch && matchesPlatform && matchesDate
  })

  const toggleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      document.body.style.overflow = "hidden"
      setTimeout(() => setIsOverlayVisible(true), 50)
    } else {
      setIsOverlayVisible(false)
      setTimeout(() => {
        setIsExpanded(false)
        document.body.style.overflow = ""
      }, 300)
    }
  }

  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  // Platformele disponibile - doar Facebook și TikTok
  const platformOptions = ["All", "Facebook", "TikTok"]

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedPlatform("All")
    setStartDate("")
    setEndDate("")
  }

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-header">
          <div className="history-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h2 className="history-title">History</h2>
        </div>
        <div className="history-content">
          <p style={{ textAlign: "center", padding: "20px" }}>Loading history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="history-header">
          <div className="history-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h2 className="history-title">History</h2>
        </div>
        <div className="history-content">
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p style={{ color: "red", marginBottom: "10px" }}>❌ {error}</p>
            <button
              onClick={fetchHistory}
              style={{
                background: "#4caf50",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`history-container ${isExpanded ? "expanded" : ""}`}>
        <div className="history-header">
          <div className="history-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="history-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                  <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h2 className="history-title">History</h2>

          <button className="expand-button" onClick={toggleExpand} aria-label={isExpanded ? "Collapse" : "Expand"} />

          <div className="history-divider"></div>
        </div>

        <div className="history-content">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for post..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {isExpanded && (
            <div className="filters-container">
              <div className="filter-group">
                <label>Platform:</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="filter-select"
                >
                  {platformOptions.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>

              <div className="filter-group">
                <label>To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>

              <button className="clear-filters-button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}

          {isExpanded && (
            <div className="table-header">
              <div>Name</div>
              <div>Platform</div>
              <div>Date</div>
              <div>Actions</div>
            </div>
          )}

          <div className="history-items">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <HistoryItem
                  key={`${item.post_name}-${item.analysis_date}`}
                  title={item.post_name || item.post_link}
                  date={item.analysis_date}
                  platform={item.platform}
                  isExpanded={isExpanded}
                  onRename={(newName) => handleRenameItem(item, newName)}
                  onExport={() => {}}
                  onDelete={() => handleDeleteItem(item)}
                  onClick={() => handleItemClick(item)}
                />
              ))
            ) : (
              <p className="empty-history">No matching history items found.</p>
            )}
          </div>
        </div>
      </div>

      {isExpanded && <div className={`history-overlay ${isOverlayVisible ? "visible" : ""}`} onClick={toggleExpand} />}
    </>
  )
})

export default HistoryContainer
