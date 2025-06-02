import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom"
import React, { useEffect } from "react"
import Home from "./pages/Home"
import FindMore from "./pages/FindMore"
import AIAnalysis from "./pages/AIAnalysis"
import About from "./pages/About"
import "./App.css"

function AIAnalysisWithParams() {
  const { postUrl } = useParams()
  return <AIAnalysis initialPostUrl={postUrl} />
}

function App() {
  useEffect(() => {
  fetch("http://localhost:8000/auth/init", {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Cookie init failed");
      console.log("Cookie successful set.");
    })
    .catch((err) => {
      console.error("Cookie error:", err);
    });
}, []);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-more" element={<FindMore />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/about" element={<About />} />
        <Route path="/ai-analysis/:postUrl" element={<AIAnalysisWithParams />} />
      </Routes>
    </Router>
  )
}

export default App
