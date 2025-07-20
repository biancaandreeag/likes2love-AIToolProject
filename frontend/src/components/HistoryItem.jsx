import { useState, useRef, useEffect } from "react"
import "../styles/HistoryItem.css"

function HistoryItem({ title, date, platform, isExpanded, onRename, onExport, onDelete, onClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(null)
  const [showErrorMessage, setShowErrorMessage] = useState(null)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const inputRef = useRef(null)

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
        setIsEditing(true)
        setEditValue(title)
        setMenuOpen(false)
        break
      case "export":
        onExport && onExport()
        break
      case "delete":
        setShowDeleteConfirm(true)
        setMenuOpen(false)
        break
      default:
        break
    }
  }

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      await onDelete()
      showMessage("Analysis deleted successfully! 🗑️", "success")
    } catch (error) {
      showMessage("Failed to delete analysis. Please try again.", "error")
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const showMessage = (message, type) => {
    if (type === "success") {
      setShowSuccessMessage(message)
      setTimeout(() => setShowSuccessMessage(null), 3000)
    } else {
      setShowErrorMessage(message)
      setTimeout(() => setShowErrorMessage(null), 4000)
    }
  }

  const checkNameExists = async (newName) => {
    try {
      const response = await fetch("http://localhost:8000/check-name-exists", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_name: newName.trim(),
          current_post_name: title,
        }),
      })

      if (!response.ok) {
        return false
      }

      const result = await response.json()
      return result.exists
    } catch (error) {
      return false
    }
  }

  const handleSaveEdit = async (e) => {
    e.stopPropagation()
    e.preventDefault()

    const trimmedValue = editValue.trim()

    if (trimmedValue === "" || trimmedValue === title) {
      setIsEditing(false)
      return
    }

    // Check if name already exists
    const nameExists = await checkNameExists(trimmedValue)
    if (nameExists) {
      showMessage(`Name "${trimmedValue}" already exists. Please choose a different name.`, "error")
      return
    }

    try {
      const response = await fetch("http://localhost:8000/edit-name", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_link: "", // Will be handled by backend
          old_post_name: title,
          new_post_name: trimmedValue,
          analysis_date: date,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (onRename) {
        onRename(trimmedValue)
      }

      setIsEditing(false)
      showMessage(`Successfully renamed to "${trimmedValue}" ✏️`, "success")
    } catch (error) {
      showMessage(`Failed to update name: ${error.message}`, "error")
      setIsEditing(false)
    }
  }

  const handleCancelEdit = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsEditing(false)
    setEditValue(title)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSaveEdit(e)
    } else if (e.key === "Escape") {
      handleCancelEdit(e)
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

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
      if (e.key === "Escape") {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false)
        } else if (menuOpen) {
          setMenuOpen(false)
        }
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [menuOpen, showDeleteConfirm])


  const formatDate = (isoDateString) => {
    if (!isoDateString) return "-"

    try {
      const date = new Date(isoDateString)

      if (isNaN(date.getTime())) return "-"

      // "Dec 3, 2024 at 11:04 PM"
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }

      return date.toLocaleDateString("en-US", options)
    } catch (error) {
      return "-"
    }
  }

  const getPlatformIcon = (platformName) => {
     if (platformName === "TikTok") {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path
            d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"
            fill="#fe2c55"
          />
        </svg>
      )
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
      </svg>
    )
  }


  const getPlatformStyle = (platformName) => {
    if (platformName === "TikTok") {
      return {
        color: "#fe2c55",
      }
    }
    return {
      color: "rgba(0, 0, 0, 0.6)",
    }
  }

  const formattedDate = formatDate(date)

  if (isExpanded) {
    return (
      <>
        <div
          className="history-item expanded"
          onClick={!isEditing ? onClick : undefined}
          style={{ cursor: isEditing ? "default" : "pointer" }}
        >
          <div className="history-item-title" title={title}>
            {isEditing ? (
              <div className="edit-container" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="edit-input"
                  placeholder="Enter new name..."
                />
                <div className="edit-buttons">
                  <button className="save-button" onClick={handleSaveEdit} title="Save">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                  <button className="cancel-button" onClick={handleCancelEdit} title="Cancel">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              title
            )}
          </div>
          <div className="history-item-platform">
            <div className="platform-display" style={getPlatformStyle(platform)}>
              {getPlatformIcon(platform)}
              <span>{platform}</span>
            </div>
          </div>
          <div className="history-item-date" title={formattedDate}>
            {formattedDate}
          </div>
          <div className="history-item-actions">
            <button
              className="action-button"
              onClick={(e) => {
                e.stopPropagation()
                handleAction("rename", e)
              }}
              title="Rename"
              disabled={isEditing}
            >
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
            <button
              className="action-button"
              onClick={(e) => {
                e.stopPropagation()
                onExport && onExport()
              }}
              title="Export"
              disabled={isEditing}
            >
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
            <button
              className="action-button delete"
              onClick={(e) => {
                e.stopPropagation()
                handleAction("delete", e)
              }}
              title="Delete"
              disabled={isEditing}
            >
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
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <>
            <div className="modal-overlay" onClick={handleCancelDelete}></div>
            <div className="confirmation-modal">
              <div className="modal-header">
                <div className="modal-icon delete-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h3>Delete Analysis</h3>
              </div>
              <div className="modal-content">
                <p>Are you sure you want to delete this analysis?</p>
                <p className="modal-subtitle">
                  <strong>"{title}"</strong>
                </p>
                <p className="modal-warning">This action cannot be undone.</p>
              </div>
              <div className="modal-actions">
                <button className="modal-button cancel" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button className="modal-button delete" onClick={handleConfirmDelete}>
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
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="toast-message success">
            <div className="toast-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span>{showSuccessMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {showErrorMessage && (
          <div className="toast-message error">
            <div className="toast-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <span>{showErrorMessage}</span>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div
        className="history-item"
        onClick={!isEditing ? onClick : undefined}
        style={{ cursor: isEditing ? "default" : "pointer" }}
      >
        <div className="history-item-content">
          <div className="history-item-title" title={title}>
            {isEditing ? (
              <div className="edit-container" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="edit-input"
                  placeholder="Enter new name..."
                />
                <div className="edit-buttons">
                  <button className="save-button" onClick={handleSaveEdit} title="Save">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                  <button className="cancel-button" onClick={handleCancelEdit} title="Cancel">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              title
            )}
          </div>
          <div className="history-item-details">
            <span className="history-item-date" title={formattedDate}>
              {formattedDate}
            </span>
            <span className="history-item-platform">
              <div className="platform-display" style={getPlatformStyle(platform)}>
                {getPlatformIcon(platform)}
                <span>{platform}</span>
              </div>
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="modal-overlay" onClick={handleCancelDelete}></div>
          <div className="confirmation-modal">
            <div className="modal-header">
              <div className="modal-icon delete-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <h3>Delete Analysis</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete this analysis?</p>
              <p className="modal-subtitle">
                <strong>"{title}"</strong>
              </p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="modal-button cancel" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="modal-button delete" onClick={handleConfirmDelete}>
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
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="toast-message success">
          <div className="toast-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span>{showSuccessMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {showErrorMessage && (
        <div className="toast-message error">
          <div className="toast-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <span>{showErrorMessage}</span>
        </div>
      )}
    </>
  )
}

export default HistoryItem
