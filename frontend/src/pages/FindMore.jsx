import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import "../styles/FindMore.css"

function FindMore() {
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true)
    }, 100)
  }, [])

  const handleStartAnalyzing = () => {
    navigate('/ai-analysis')
  }

  return (
    <div className="find-more-container">

      <Navbar isFlipped={false} />

      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/videos/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay"></div>
      </div>

      <div className="find-more-content">
        <div className="hero-wrapper">
          <div className={`hero-section ${isLoaded ? "visible" : ""}`}>
            <h1 className="title">Discover Our AI-Powered Protection</h1>
          </div>
        </div>

        <div className={`features-section ${isLoaded ? "visible" : ""}`}>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M12 18C14.2091 18 16 16.2091 16 14C16 11.7909 14.2091 10 12 10C9.79086 10 8 11.7909 8 14C8 16.2091 9.79086 18 12 18Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M12 10V14L14 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Safe Content Scraping</h3>
            <p>
              Our platform performs ethical scraping of posts and comments without collecting personal user data.
              We focus solely on content analysis to identify online user behavior, including potential cyberbullying and bot
              activity patterns, while strictly maintaining user privacy standards.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 9C7.10457 9 8 9.89543 8 11C8 12.1046 7.10457 13 6 13C4.89543 13 4 12.1046 4 11C4 9.89543 4.89543 9 6 9Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 9C19.1046 9 20 9.89543 20 11C20 12.1046 19.1046 13 18 13C16.8954 13 16 12.1046 16 11C16 9.89543 16.8954 9 18 9Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 18C13.1046 18 14 18.8954 14 20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20C10 18.8954 10.8954 18 12 18Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 10L10.5 5.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M16.5 10L13.5 5.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M7.5 12L10.5 18.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.5 12L13.5 18.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Advanced AI Models</h3>
            <p>
              We employ a diverse range of advanced AI models—including RoBERTa, BERT, and other specialized architectures—tailored for various types of
              content analysis and detection tasks. These models are continuously refined to better recognize subtle forms of cyberbullying
              and online harassment. More details about our approach can be found in the About section.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21H3V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M21 6L12 15L9 12L3 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Comprehensive Analytics</h3>
            <p>
              Our comprehensive dashboard offers an overview of sentiment trends across the platform, followed by detailed
              insights into detected cyberbullying behaviors and bot activity. It also includes engagement metrics derived
              from user comments, helping you monitor interaction quality and take informed, proactive steps toward a safer
              digital environment.
            </p>
          </div>
        </div>

        <div className={`workflow-section ${isLoaded ? "visible" : ""}`}>
          <div className="workflow-title-container">
            <h2 className="workflow-title">HOW IT WORKS</h2>
          </div>

          <p className="workflow-subtitle">Ready to Create a Safer Online Environment?</p>

          <div className="workflow-steps-container">
            <div className="workflow-steps">
              <div className="workflow-step">
                <h4 className="step-title">1.Introduce post link</h4>
                <div className="step-circle"></div>
                <p className="step-description">Kindly ensure careful selection of public posts.</p>
              </div>

              <div className="workflow-step">
                <h4 className="step-title">2.Choose bot statistics</h4>
                <div className="step-circle"></div>
                <p className="step-description">To see the chance of the accounts to be bots</p>
              </div>

              <div className="workflow-step">
                <h4 className="step-title">3.Generate dashboard</h4>
                <div className="step-circle"></div>
                <p className="step-description">Assess the generated details and confirm if the post meets the guidelines</p>
              </div>

              <div className="workflow-progress-line"></div>
            </div>

            <div className="workflow-actions">
              <button className="start-button" onClick={handleStartAnalyzing}>
                START ANALYZING NOW
                <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FindMore
