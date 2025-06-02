import { useState } from "react"
import { useNavigate } from "react-router-dom"

const DashboardContainer = () => {
  const [showTooltip, setShowTooltip] = useState(false)
  const navigate = useNavigate()

  const handleNewAnalysis = () => {
    navigate("/ai-analysis")
  }

  return (
    <div className="dashboard-container">
      <div className="new-analysis-button-container">
        <button
          className="new-analysis-button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={handleNewAnalysis}
        >
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          {showTooltip && <span className="tooltip">New analysis</span>}
        </button>
      </div>

      <div className="dashboard-header">
        <div className="dashboard-title-wrapper">
          <div className="dashboard-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#dashboard-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="dashboard-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                  <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <h2 className="dashboard-title">Dashboard</h2>
        </div>
      </div>
      <div className="dashboard-content">{/* Aici va fi conținutul dashboard-ului */}</div>
    </div>
  )
}

export default DashboardContainer
