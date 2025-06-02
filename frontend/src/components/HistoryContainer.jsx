import { useState, useEffect } from "react"
import "../styles/HistoryContainer.css"
import HistoryItem from "./HistoryItem"

function HistoryContainer() {

  const [isExpanded, setIsExpanded] = useState(false)

  const [isOverlayVisible, setIsOverlayVisible] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")

  const [selectedModel, setSelectedModel] = useState("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [historyItems, setHistoryItems] = useState([])

  useEffect(() => {
    fetch("http://localhost:8000/get-history", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch history")
        return res.json()
      })
      .then((data) => {
        console.log("Fetched history:", data)
        setHistoryItems(data)
      })
      .catch((err) => {
        console.error("Error fetching history:", err)
      })
  }, [])

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesModel = selectedModel === "All" || item.model === selectedModel

    let matchesDate = true
    if (startDate || endDate) {
      const itemDate = new Date(item.date)
      if (startDate && new Date(startDate) > itemDate) matchesDate = false
      if (endDate && new Date(endDate) < itemDate) matchesDate = false
    }

    return matchesSearch && matchesModel && matchesDate
  })

  const toggleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      document.body.style.overflow = "hidden"

      setTimeout(() => {
        setIsOverlayVisible(true)
      }, 50)
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


  const uniqueModels = ["All", ...new Set(historyItems.map((item) => item.model))]

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedModel("All")
    setStartDate("")
    setEndDate("")
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
                <label>Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="filter-select"
                >
                  {uniqueModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
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
              <div>Model</div>
              <div>Date</div>
              <div>Actions</div>
            </div>
          )}

          <div className="history-items">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <HistoryItem
                  key={item.id}
                  title={item.title}
                  date={item.date}
                  model={item.model}
                  isExpanded={isExpanded}
                  onRename={() => console.log('Rename:', item.id)}
                  onExport={() => console.log('Export:', item.id)}
                  onDelete={() => console.log('Delete:', item.id)}
                />
              ))
            ) : (
              <p className="empty-history">No matching history items found.</p>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div
          className={`history-overlay ${isOverlayVisible ? "visible" : ""}`}
          onClick={toggleExpand}
        />
      )}
    </>
  )
}

export default HistoryContainer