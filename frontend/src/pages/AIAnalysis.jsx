import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import HistoryContainer from "../components/HistoryContainer"
import AnalysisContainer from "../components/AnalysisContainer"
import DashboardContainer from "../components/DashboardContainer"
import { parseCombinedSlug, parseSlugInfo, generateDashboardUrl } from "../utils/slugUtils" // Calea corectată
import "../styles/AIAnalysis.css"

function AIAnalysis({ initialPostUrl }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [currentPostLink, setCurrentPostLink] = useState(null)
  const [postInfo, setPostInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const params = useParams()
  const historyRef = useRef()

  // Efect pentru încărcarea datelor la montare sau la schimbarea combinedSlug
  useEffect(() => {
    const { combinedSlug } = params

    if (combinedSlug) {
      const { postSlug, dateSlug } = parseCombinedSlug(combinedSlug) // Folosim postSlug și dateSlug
      if (postSlug && dateSlug) {
        console.log("URL parameters detected on load/refresh:", { postSlug, dateSlug })
        fetchPostInfo(postSlug, dateSlug) // Trimitem postSlug ca postLink
      } else {
        // If combinedSlug is malformed, navigate back to base analysis page
        console.warn("Malformed combinedSlug detected, navigating to base /ai-analysis.")
        navigate("/ai-analysis", { replace: true })
      }
    } else if (initialPostUrl) {
      // This path is likely for initial direct navigation without a combinedSlug
      // If initialPostUrl is meant to trigger a new analysis, keep this.
      // Otherwise, if all analyses should be via combinedSlug, this might be removed.
      // For now, keeping it as it was.
      setShowDashboard(true) // Assuming initialPostUrl means show a dashboard
    }

    setTimeout(() => setIsLoaded(true), 100)
  }, [params]) // Updated to use the entire params object

  const fetchPostInfo = async (postLinkOrSlug, analysisDateString) => {
    try {
      setLoading(true)
      setError(null)

      // Ensure analysisDateString is in ISO format for the backend
      // parseSlugInfo returnează un obiect Date, pe care îl putem formata în ISO
      const { parsedDate } = parseSlugInfo(postLinkOrSlug, analysisDateString)
      const isoDate = parsedDate ? parsedDate.toISOString() : analysisDateString // Folosim ISO dacă e valid, altfel originalul

      // Pentru a face request-ul la backend, avem nevoie de `post_link` real, nu de slug.
      // Aici este o problemă de design: `parseCombinedSlug` returnează `postSlug`,
      // dar `fetchPostInfo` și backend-ul așteaptă `post_link`.
      // Soluția temporară: trimitem `postLinkOrSlug` ca `post_link` și sperăm că backend-ul îl poate rezolva.
      // Soluția pe termen lung: `generateDashboardUrl` ar trebui să includă `post_link` real,
      // sau backend-ul să poată căuta după `post_name` (slug).
      const params = new URLSearchParams({ post_link: postLinkOrSlug, analysis_date: isoDate })

      const response = await fetch(`http://localhost:8000/post-info?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      if (data.status !== "found") throw new Error("Post not found")

      setCurrentAnalysis(data.analysis)
      setCurrentPostLink(postLinkOrSlug) // Păstrăm postLinkOrSlug ca currentPostLink
      setPostInfo({
        likes: data.post_info?.post_likes ?? "-",
        comments: data.post_info?.post_no_comments ?? "-",
        saves: data.post_info?.post_saved ?? "-",
        shares: data.post_info?.post_distribution ?? "-",
        views: data.post_info?.post_play ?? "-",
        cyberbullyingComments: data.cyberbullying_comments ?? [],
        engagementInformation: data.engagement_info ?? [],
      })
      setShowDashboard(true)
    } catch (error) {
      console.error("Error fetching post info:", error)
      setError(`Failed to load: ${error.message}`)
      setShowDashboard(false) // Hide dashboard on error
      setCurrentAnalysis(null)
      setCurrentPostLink(null)
      setPostInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const handleHistoryItemClick = (item) => {
    fetchPostInfo(item.post_link, item.analysis_date)

    const combinedSlug = generateDashboardUrl(item.post_name, item.post_link, item.analysis_date)
    navigate(combinedSlug, { replace: false })
  }

  const handleShowDashboard = (postLink, analysis, postInfoData, analysisDate) => {
    setCurrentAnalysis(analysis)
    setCurrentPostLink(postLink)
    setPostInfo(postInfoData)
    setShowDashboard(true)
    historyRef.current?.refreshHistory?.()

    const combinedSlug = generateDashboardUrl(postInfoData?.post_name, postLink, analysisDate)
    navigate(combinedSlug, { replace: false })
  }

  const handleBackToAnalysis = () => {
    setShowDashboard(false)
    setCurrentAnalysis(null)
    setCurrentPostLink(null)
    setPostInfo(null)
    setError(null)
    setLoading(false)
    navigate("/ai-analysis")
  }

  const shouldShowDashboardView = showDashboard && currentAnalysis && currentPostLink && postInfo

  return (
    <div className="ai-analysis-container">
      <Navbar isFlipped={false} />
      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>
        <div className="overlay"></div>
      </div>

      <div className={`ai-analysis-content ${isLoaded ? "visible" : ""}`}>
        <div className="analysis-layout">
          {/* Condițional, afișăm HistoryContainer doar dacă nu suntem pe o pagină de dashboard specifică */}
          {!params.combinedSlug && (
            <div id="history-column" className="history-column">
              <HistoryContainer ref={historyRef} onItemClick={handleHistoryItemClick} />
            </div>
          )}

          <div
            id="main-column"
            className="main-column"
            style={params.combinedSlug ? { width: "100%", maxWidth: "1200px", margin: "0 auto" } : {}}
          >
            {loading ? (
              <div className="loading-container" style={{ textAlign: "center", padding: "40px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #667eea",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 20px",
                  }}
                ></div>
                <h3>Loading Analysis...</h3>
                <p>Fetching existing analysis from database...</p>
              </div>
            ) : error ? (
              <div className="error-container" style={{ textAlign: "center", padding: "40px" }}>
                <div
                  style={{
                    background: "#ffebee",
                    border: "1px solid #f44336",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <h3 style={{ color: "#c62828", margin: "0 0 10px 0" }}>❌ Error</h3>
                  <p style={{ color: "#d32f2f", margin: "0" }}>{error}</p>
                </div>
                <button
                  onClick={handleBackToAnalysis}
                  style={{
                    background: "#757575",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ← Back to Analysis
                </button>
              </div>
            ) : shouldShowDashboardView ? ( // Use the new flag for rendering dashboard
              <DashboardContainer
                analysis={currentAnalysis}
                postLink={currentPostLink}
                postInfo={postInfo}
                onBackToAnalysis={handleBackToAnalysis}
              />
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
