import { useState, useRef, useEffect } from "react"
import "../styles/AnalysisContainer.css"
import "../styles/DashboardContainer.css"

function AnalysisContainer({ onShowDashboard, onMount }) {
  const [inputValue, setInputValue] = useState("")
  const [selectedModel, setSelectedModel] = useState("RoBERTa")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("facebook")

  const [showTooltip, setShowTooltip] = useState(false)

  const [showGuide, setShowGuide] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const dropdownRef = useRef(null)

  useEffect(() => {
    onMount && onMount()
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleModelSelect = (model) => {
    setSelectedModel(model)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform)
  }

  const toggleGuide = () => {
    setShowGuide(!showGuide)
  }

  const waitForAnalysis = async (post_link, model) => {
    const params = new URLSearchParams({ post_link, model });

    while (true) {
      try {
        const response = await fetch(`http://localhost:8000/analysis-status?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "done") {
          return true; // analiza e gata, ieșim
        }

        if (data.status === "processing" || data.status === "not_found") {
          await new Promise(resolve => setTimeout(resolve, 180000));
          continue;
        }

        throw new Error("Unexpected status: " + data.status);

      } catch (error) {
        console.error("Error checking analysis status:", error);
        throw error;
      }
    }
  };


   const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        post_link: inputValue,
        model: selectedModel,
        platform: selectedPlatform
      });

      const response = await fetch(`http://localhost:8000/get-analysis?${params.toString()}`, {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log("Start analysis response:", data);

      if (data.status === "success" || data.status === "exists") {
        await waitForAnalysis(inputValue, selectedModel);

        onShowDashboard && onShowDashboard(inputValue);
      } else {
        alert("Something went wrong: " + data.message);
      }
    } catch (error) {
      alert("Failed to submit analysis or check status: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="analysis-container">
      <div className="content-wrapper">
        <div className="top-section">
          <div className="shield-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#shield-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                  <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                </linearGradient>
              </defs>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9 12l2 2 4-4"></path>
            </svg>
          </div>

          <div className="model-dropdown-container">
            <div className="model-selection">
              <div className="model-dropdown" onClick={toggleDropdown} ref={dropdownRef}>
                <span className="selected-model">{selectedModel}</span>
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
                  className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => handleModelSelect("RoBERTa")}>
                      <div className="model-icon">
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                      <span>RoBERTa</span>
                      {selectedModel === "RoBERTa" && (
                        <div className="check-icon">
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
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="dropdown-item" onClick={() => handleModelSelect("BERT")}>
                      <div className="model-icon">
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
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                          <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                      </div>
                      <span>BERT</span>
                      {selectedModel === "BERT" && (
                        <div className="check-icon">
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
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="dropdown-item" onClick={() => handleModelSelect("GPT")}>
                      <div className="model-icon">
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
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                      </div>
                      <span>GPT</span>
                      {selectedModel === "GPT" && (
                        <div className="check-icon">
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
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="dropdown-item" onClick={() => handleModelSelect("RandomForest")}>
                      <div className="model-icon">
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
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <span>RandomForest</span>
                      {selectedModel === "RandomForest" && (
                        <div className="check-icon">
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
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Înlocuim onMouseEnter și onMouseLeave cu o implementare mai robustă */}
              <div
                className="info-button"
                onMouseEnter={() => {
                  setTimeout(() => {
                    setShowTooltip(true)
                  }, 0)
                }}
                onMouseLeave={() => {
                  setShowTooltip(false)
                }}
              >
                <div className="info-icon">i</div>
                {showTooltip && (
                  <div className="info-tooltip">
                    Explore the <span className="gradient-text">About</span> page to see what's suits your interests
                    best.
                  </div>
                )}
              </div>
            </div>
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
            <div className={`platform-selector ${selectedPlatform === "tiktok" ? "tiktok-active" : ""}`}>
              <button
                className={`platform-button facebook ${selectedPlatform === "facebook" ? "active" : ""}`}
                onClick={() => handlePlatformSelect("facebook")}
              >
                <div className="platform-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span>Facebook</span>
              </button>
              <button
                className={`platform-button tiktok ${selectedPlatform === "tiktok" ? "active" : ""}`}
                onClick={() => handlePlatformSelect("tiktok")}
              >
                <div className="platform-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span>TikTok</span>
              </button>
            </div>

            <div className="input-wrapper">
              <input
                type="text"
                className="analysis-input"
                placeholder="Enter post URL here..."
                value={inputValue}
                onChange={handleInputChange}
              />
              <button className="arrow-button" onClick={handleSubmit} aria-label="Submit" disabled={isLoading}>
                {isLoading ? (
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
                    className="loading-spinner"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v2"></path>
                  </svg>
                ) : (
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
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                )}
              </button>
            </div>

            <div className="help-text">
              Not certain which link to provide?
              <span className="gradient-link" onClick={toggleGuide}>
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
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                View our quick guide
              </span>
              .
              {showGuide && (
                <>
                  <div className="modal-overlay" onClick={toggleGuide}></div>
                  <div className="quick-guide-container">
                    <div className="quick-guide-header">
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
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                      <h3 className="quick-guide-title">Quick Guide: How to Get the Correct Link</h3>
                    </div>

                    <p className="quick-guide-description">
                      To ensure accurate analysis, make sure you're submitting the direct link to a public post. Here's
                      how:
                    </p>

                    <div className="platform-guide">
                      <div className="platform-guide-header">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="facebook-color"
                        >
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                        <h4 className="platform-guide-title">For Facebook:</h4>
                      </div>

                      <ol className="platform-guide-steps">
                        <li className="platform-guide-step">
                          Click on the timestamp (e.g., "2h", "Yesterday") located right under the name of the person or
                          page who posted.
                        </li>
                        <li className="platform-guide-step">
                          This will open the post in a new window – copy the URL from your browser.
                        </li>
                      </ol>

                      <div className="platform-guide-note">
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <p className="platform-guide-note-text">
                          Make sure the post is public (globe icon <span>🌐</span>).
                        </p>
                      </div>
                    </div>

                    <div className="platform-guide">
                      <div className="platform-guide-header">
                        <svg viewBox="0 0 24 24" width="18" height="18" className="tiktok-color">
                          <path
                            d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"
                            fill="#fe2c55"
                          />
                        </svg>
                        <h4 className="platform-guide-title">For TikTok:</h4>
                      </div>

                      <ol className="platform-guide-steps">
                        <li className="platform-guide-step">Go to the specific video you want to analyze.</li>
                        <li className="platform-guide-step">
                          Make sure the video is public, not private or restricted.
                        </li>
                      </ol>

                      <p className="platform-guide-note-text">The link must look like:</p>
                      <code className="example-link">https://www.tiktok.com/@username/video/1234567890</code>

                      <div className="warning">
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
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
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
