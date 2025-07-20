import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from "react-router-dom"
import { useEffect } from "react"
import Home from "./pages/Home"
import FindMore from "./pages/FindMore"
import AIAnalysis from "./pages/AIAnalysis"
import About from "./pages/About"
import "./App.css"


function App() {
  useEffect(() => {
    const refreshOrInit = async () => {
      try {
        const res = await fetch("http://localhost:8000/auth/refresh", {
          method: "GET",
          credentials: "include",
        })
        if (!res.ok) throw new Error("Token refresh failed")
        console.log("Token refreshed")
      } catch (err) {
        console.warn("⚠Refresh failed, falling back to init...")

        try {
          const initRes = await fetch("http://localhost:8000/auth/init", {
            method: "GET",
            credentials: "include",
          })
          if (!initRes.ok) throw new Error("Init failed")
          console.log("Token initialized")
        } catch (initErr) {
          console.error("Init error:", initErr)
        }
      }
    }

    refreshOrInit()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-more" element={<FindMore />} />
        <Route path="/ai-analysis/:combinedSlug" element={<AIAnalysis />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
