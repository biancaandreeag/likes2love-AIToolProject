import { useState, useEffect } from "react"
import "../styles/AnalysisContainer.css"
import "../styles/DashboardContainer.css"

function AnalysisContainer({ onShowDashboard, onMount }) {
  const [inputValue, setInputValue] = useState("")
  const [selectedPlatform] = useState("tiktok")
  const [showGuide, setShowGuide] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onMount && onMount()
  }, [])

  const handleInputChange = (e) => setInputValue(e.target.value)
  const toggleGuide = () => setShowGuide((prev) => !prev)

  const waitForAnalysis = async (post_link, model, analysis_date) => {
    const params = new URLSearchParams({ post_link, model, analysis_date })

    while (true) {
      try {
        const response = await fetch(`http://localhost:8000/analysis-status?${params}`, {
          credentials: "include",
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()

        if (data.status === "done") {
          return {
            analysis: data.analysis,
            postInfo: data.post_info || {},
            cyberbullyingComments: data.cyberbullying_comments ?? [],
            engagementInformation: data.engagement_info ?? []
          }
        }

        if (data.status === "processing" || data.status === "not_found") {
          await new Promise((resolve) => setTimeout(resolve, 60000))
          continue
        }

        throw new Error("Unexpected status: " + data.status)
      } catch (error) {
        console.error("Error checking analysis status:", error)
        throw error
      }
    }
  }

  const handleSubmit = async () => {
    if (!inputValue.trim()) return
    setIsLoading(true)

    const analysisDate = new Date().toISOString()

    try {
      const params = new URLSearchParams({
        post_link: inputValue,
        model: "default",
        platform: selectedPlatform,
        analysis_date: analysisDate,
      })

      const response = await fetch(`http://localhost:8000/get-analysis?${params}`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP ${response.status}: ${text}`)
      }

      const data = await response.json()

      if (data.status === "success" || data.status === "exists") {
        const { analysis, postInfo, cyberbullyingComments, engagementInformation } = await waitForAnalysis(inputValue, "default", analysisDate)

        const engagementInfo = {
          likes: postInfo?.post_likes ?? "-",
          comments: postInfo?.post_no_comments ?? "-",
          saves: postInfo?.post_saved ?? "-",
          shares: postInfo?.post_distribution ?? "-",
          views: postInfo?.post_play ?? "-",
          cyberbullyingComments: cyberbullyingComments ?? [],
          engagementInformation: engagementInformation ?? []
        }

        onShowDashboard && onShowDashboard(inputValue, analysis, engagementInfo)
      } else {
        alert("Something went wrong: " + data.message)
      }
    } catch (error) {
      alert("Failed to submit analysis or check status: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="analysis-container">
      <div className="content-wrapper">
        <div className="top-section">
          <div className="shield-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="url(#shield-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                  <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                </linearGradient>
              </defs>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </div>

        <div className="middle-section">
          <div className="description-text">
            <div className="headline">Protecting Online Spaces from Harmful Content.</div>
            <div className="subheadline">
              <span className="gradient-text">Together</span>, we can create safer, more respectful digital communities.
            </div>
          </div>

          <div className="input-section">
            <div className="input-wrapper">
              <input
                type="text"
                className="analysis-input"
                placeholder="Enter post URL here..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSubmit()}
              />
              <button
                className="arrow-button"
                onClick={handleSubmit}
                aria-label="Submit"
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" className="loading-spinner">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            </div>

            <div className="help-text">
              Not certain which link to provide?
              <span className="gradient-link" onClick={toggleGuide}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                View our quick guide
              </span>
              .
              {showGuide && (
                <>
                  <div className="modal-overlay" onClick={toggleGuide}></div>
                  <div className="quick-guide-container">
                    <div className="quick-guide-header">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <h3 className="quick-guide-title">Quick Guide: How to Get the Correct Link</h3>
                    </div>

                    <p className="quick-guide-description">
                      To ensure accurate analysis, make sure you're submitting the direct link to a public post. Here's how:
                    </p>

                    <div className="platform-guide">
                      <div className="platform-guide-header">
                        <svg viewBox="0 0 24 24" width="18" height="18" className="tiktok-color">
                          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"
                            fill="#fe2c55" />
                        </svg>
                        <h4 className="platform-guide-title">TikTok:</h4>
                      </div>

                      <ol className="platform-guide-steps">
                        <li>Go to the specific video you want to analyze.</li>
                        <li>Make sure the video is public, not private or restricted.</li>
                        <li>If on TikTok explore, right-click and copy the direct video link.</li>
                      </ol>

                      <p className="platform-guide-note-text">The link must look like:</p>
                      <code className="example-link">https://www.tiktok.com/@username/video/1234567890</code>

                      <div className="warning">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <p className="warning-text">Do not use generic pages like tiktok.com/explore.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisContainer
