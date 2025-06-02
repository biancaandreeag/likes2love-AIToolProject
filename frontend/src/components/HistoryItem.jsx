import { useState, useRef, useEffect } from "react"
import "../styles/HistoryItem.css"

function HistoryItem({ title, date, model, isExpanded, onRename, onExport, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)


  const toggleMenu = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setMenuOpen(!menuOpen)
  }

  const handleAction = (actionType, e) => {
    e.stopPropagation()
    e.preventDefault()

    switch (actionType) {
      case "rename":
        onRename && onRename()
        break
      case "export":
        onExport && onExport()
        break
      case "delete":
        onDelete && onDelete()
        break
      default:
        break
    }
    setMenuOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])


  useEffect(() => {
    const handleScroll = () => {
      if (menuOpen) {
        setMenuOpen(false)
      }
    }

    const historyContainer = document.querySelector(".history-items")
    if (historyContainer) {
      historyContainer.addEventListener("scroll", handleScroll)
      return () => {
        historyContainer.removeEventListener("scroll", handleScroll)
      }
    }

    return () => {}
  }, [menuOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [menuOpen])

  if (isExpanded) {
    return (
      <div className="history-item">
        <div className="history-item-title">{title}</div>
        <div className="history-item-model">{model}</div>
        <div className="history-item-date">{date}</div>
        <div className="history-item-actions">
          <button className="action-button" onClick={onRename} title="Rename">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button className="action-button" onClick={onExport} title="Export">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button className="action-button delete" onClick={onDelete} title="Delete">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="history-item">
      <div className="history-item-content">
        <div className="history-item-title">{title}</div>
        <div className="history-item-details">
          <span className="history-item-date">{date}</span>
          <span className="history-item-model">{model}</span>
        </div>
      </div>
      {/* Comentăm butonul
    <div className="history-item-options">
      <button ref={buttonRef} className={`options-button ${menuOpen ? "active" : ""}`} onClick={toggleMenu}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="dotsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
              <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      </button>
      {menuOpen && (
        <div className="options-menu" ref={menuRef}>
          <button className="menu-item" onClick={(e) => handleAction("rename", e)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Rename</span>
          </button>
          <button className="menu-item" onClick={(e) => handleAction("export", e)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export PDF</span>
          </button>
          <button className="menu-item delete" onClick={(e) => handleAction("delete", e)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
    */}
    </div>
  )
}

export default HistoryItem
