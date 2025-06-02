import { useState } from "react"
import { useLocation, Link } from "react-router-dom"
import "../styles/Navbar.css"

function Navbar({ isFlipped }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className={`navbar ${isFlipped ? "navbar-right" : "navbar-left"}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src="/logo.png" alt="likes2love Logo" width="30" height="30" />
          </Link>
        </div>

        <ul className={`navbar-menu ${isFlipped ? "menu-left" : "menu-right"}`}>
          <li className="navbar-item">
            <Link
              to="/"
              className={`navbar-link ${currentPath === "/" ? "active" : ""}`}
            >
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link
              to="/ai-analysis"
              className={`navbar-link ${currentPath === "/ai-analysis" ? "active" : ""}`}
            >
              AI Analysis
            </Link>
          </li>
          <li className="navbar-item">
            <Link
              to="/about"
              className={`navbar-link ${currentPath === "/about" ? "active" : ""}`}
            >
              About
            </Link>
          </li>
        </ul>

        <div className="navbar-toggle" onClick={toggleMenu}>
          <div className={`hamburger ${isMenuOpen ? "active" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
        <ul className="mobile-menu-items">
          <li className="mobile-menu-item">
            <Link
              to="/"
              className={`mobile-menu-link ${currentPath === "/" ? "active" : ""}`}
            >
              Home
            </Link>
          </li>
          <li className="mobile-menu-item">
            <Link
              to="/ai-analysis"
              className={`mobile-menu-link ${currentPath === "/ai-analysis" ? "active" : ""}`}
            >
              AI Analysis
            </Link>
          </li>
          <li className="mobile-menu-item">
            <Link
              to="/about"
              className={`mobile-menu-link ${currentPath === "/about" ? "active" : ""}`}
            >
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
