import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import HistoryContainer from "../components/HistoryContainer"
import AnalysisContainer from "../components/AnalysisContainer"
import DashboardContainer from "../components/DashboardContainer"
import "../styles/AIAnalysis.css"

function AIAnalysis({ initialPostUrl }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const navigate = useNavigate()
  const params = useParams()

  useEffect(() => {
    const postUrl = initialPostUrl || params.postUrl
    if (postUrl) {
      setShowDashboard(true)
    }

    setTimeout(() => {
      setIsLoaded(true)
    }, 100)
  }, [initialPostUrl, params.postUrl])

  const handleShowDashboard = (inputUrl) => {
    if (inputUrl) {
      const encodedUrl = encodeURIComponent(inputUrl)
      navigate(`/ai-analysis/${encodedUrl}`)
    } else {
      setShowDashboard(true)
    }
  }

  return (
    <div className="ai-analysis-container">
      <Navbar isFlipped={false} />

      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/videos/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay"></div>
      </div>

      <div className={`ai-analysis-content ${isLoaded ? "visible" : ""}`}>
        <div className="analysis-layout">
          <div id="history-column" className="history-column">
            <HistoryContainer />
          </div>
          <div id="main-column" className="main-column">
            {showDashboard ? (
              <DashboardContainer />
            ) : (
              <AnalysisContainer onShowDashboard={handleShowDashboard} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAnalysis
