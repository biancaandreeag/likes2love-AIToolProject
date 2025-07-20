import { useState, useEffect } from "react"
import "../styles/DashboardContainer.css"
import "../styles/pdfExport.css"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
  PieChart,
  Pie,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { exportAnalysisDataToPDF } from "../utils/pdfExport"

const DashboardContainer = ({ analysis, postLink, onBackToAnalysis, postInfo }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [showExportTooltip, setShowExportTooltip] = useState(false)
  const [generalAnalysis, setGeneralAnalysis] = useState(null)
  const [hateAnalysis, setHateAnalysis] = useState(null)
  const [cyberbullyingAnalysis, setCyberbullyingAnalysis] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const cyberbullyingComments = postInfo?.cyberbullyingComments || []
  const engagementInformation = postInfo?.engagementInformation || []

  const formatDateRO = (isoDate) => {
    if (!isoDate) return "-"
    return isoDate.split("-").reverse().join(".")
  }

  const groupedComments = cyberbullyingComments.reduce((acc, { comment, cyberbullying_label }) => {
    if (!acc[cyberbullying_label]) acc[cyberbullying_label] = []
    if (acc[cyberbullying_label].length < 3) acc[cyberbullying_label].push(comment)
    return acc
  }, {})

  const topEngagementDay = (() => {
    const daily = {}

    engagementInformation.forEach((entry) => {
      const date = new Date(entry.post_time * 1000)
      const dayKey = date.toISOString().split("T")[0]

      if (!daily[dayKey]) {
        daily[dayKey] = { likes: 0, replies: 0, count: 0 }
      }

      daily[dayKey].likes += entry.likes
      daily[dayKey].replies += entry.no_replies
      daily[dayKey].count += 1
    })

    // Returnează ziua cu cel mai mare scor
    return Object.entries(daily)
      .map(([day, val]) => ({
        date: day,
        totalEngagement: val.likes + val.replies + val.count,
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)[0]?.date
  })()

  const hourlyEngagement = (() => {
    if (!topEngagementDay) return []

    const labels = ["positive", "neutral", "negative", "age", "gender", "religion", "ethnicity", "other_cyberbullying"]

    const hourMap = {}

    engagementInformation.forEach((entry) => {
      const dateObj = new Date(entry.post_time * 1000)
      const dayKey = dateObj.toISOString().split("T")[0]

      if (dayKey !== topEngagementDay) return

      const hour = dateObj.getHours()
      const label = labels.includes(entry.label) ? entry.label : "other"

      if (!hourMap[hour]) {
        hourMap[hour] = {
          hour: `${String(hour).padStart(2, "0")}:00`,
          positive: 0,
          neutral: 0,
          negative: 0,
          age: 0,
          gender: 0,
          religion: 0,
          ethnicity: 0,
          other_cyberbullying: 0,
          other: 0,
        }
      }

      hourMap[hour][label] += 1
    })

    return Object.values(hourMap).sort((a, b) => Number.parseInt(a.hour) - Number.parseInt(b.hour))
  })()

  const engagementByDay = (() => {
    if (!engagementInformation || engagementInformation.length === 0) return []

    const resultByDay = {}

    engagementInformation.forEach((entry) => {
      const dateObj = new Date(entry.post_time * 1000)
      const dateKey = dateObj.toISOString().split("T")[0]

      if (!resultByDay[dateKey]) {
        resultByDay[dateKey] = {
          date: dateKey,
          likes: 0,
          replies: 0,
          totalComments: 0,
        }
      }

      resultByDay[dateKey].likes += entry.likes
      resultByDay[dateKey].replies += entry.no_replies
      resultByDay[dateKey].totalComments += 1
    })

    const sorted = Object.values(resultByDay).sort((a, b) => new Date(a.date) - new Date(b.date))
    return sorted.slice(0, 7)
  })()

  useEffect(() => {
    if (analysis) {
      if (Array.isArray(analysis)) {
        const foundGeneralAnalysis = analysis.find((item) => item.type === "general_analysis")
        const foundHateAnalysis = analysis.find((item) => item.type === "general_hate")
        const foundCyberbullyingAnalysis = analysis.find((item) => item.type === "cyberbullying")

        setGeneralAnalysis(foundGeneralAnalysis)
        setHateAnalysis(foundHateAnalysis)
        setCyberbullyingAnalysis(foundCyberbullyingAnalysis)
      } else if (analysis.type === "general_analysis") {
        setGeneralAnalysis(analysis)
      } else if (analysis.type === "cyberbullying") {
        setCyberbullyingAnalysis(analysis)
      } else {
        setGeneralAnalysis(null)
        setCyberbullyingAnalysis(null)
      }
    }
  }, [analysis])

  useEffect(() => {
    console.log("[DEBUG] postInfo received in DashboardContainer:", postInfo)
  }, [postInfo])

  const engagementMetrics = {
    likes: postInfo?.likes ?? "-",
    comments: postInfo?.comments ?? "-",
    shares: postInfo?.shares ?? "-",
    saves: postInfo?.saves ?? "-",
    plays: postInfo?.views ?? "-",
  }

  const handleNewAnalysis = () => {
    if (onBackToAnalysis) {
      onBackToAnalysis()
    }
  }

  const handleExportPDF = async () => {
    setShowExportMenu(false)

    const postTitle = extractTikTokInfo(postLink).username
      ? `@${extractTikTokInfo(postLink).username}'s TikTok Post`
      : "Social Media Analysis"

    const platform = postLink.includes("tiktok.com")
      ? "TikTok"
      : postLink.includes("facebook.com")
        ? "Facebook"
        : "Unknown"

    try {
      await exportAnalysisDataToPDF({
        generalAnalysis,
        hateAnalysis,
        cyberbullyingAnalysis,
        engagementMetrics,
        groupedComments,
        engagementByDay,
        hourlyEngagement,
        topEngagementDay,
        postLink,
        platform,
        postTitle,
      })
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const extractTikTokInfo = (url) => {
    try {
      if (url && url.includes("tiktok.com")) {
        const regex = /@([^/]+)\/video\/(\d+)/
        const match = url.match(regex)
        if (match && match.length >= 3) {
          return {
            username: match[1],
            videoId: match[2],
          }
        }
      }
      return { username: null, videoId: null }
    } catch (error) {
      console.error("Error extracting TikTok info:", error)
      return { username: null, videoId: null }
    }
  }

  const { username, videoId } = extractTikTokInfo(postLink)

  const hasAnalysisData =
    generalAnalysis &&
    generalAnalysis.result &&
    generalAnalysis.result.percent_counts &&
    generalAnalysis.result.average_scores

  const hasHateAnalysisData =
    hateAnalysis && hateAnalysis.result && hateAnalysis.result.counts && hateAnalysis.result.summary

  const hasCyberbullyingData =
    cyberbullyingAnalysis &&
    cyberbullyingAnalysis.result &&
    cyberbullyingAnalysis.result.average_probabilities &&
    cyberbullyingAnalysis.result.label_counts


  const prepareChartData = () => {
    if (!hasAnalysisData) {
      return []
    }

    const { percent_counts, average_scores } = generalAnalysis.result

    const chartData = [
      {
        name: "Positive",
        value: percent_counts.positive || 0,
        averageScore: average_scores.positive || 0,
        color: "#59CD90",
        emoji: "😊",
        icon: (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="#59CD90" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="white" />
            <circle cx="15" cy="9" r="1" fill="white" />
          </svg>
        ),
      },
      {
        name: "Neutral",
        value: percent_counts.neutral || 0,
        averageScore: average_scores.neutral || 0,
        color: "#FFD93D",
        emoji: "😐",
        icon: (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="#FFD93D" />
            <line x1="8" y1="14" x2="16" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="white" />
            <circle cx="15" cy="9" r="1" fill="white" />
          </svg>
        ),
      },
      {
        name: "Negative",
        value: percent_counts.negative || 0,
        averageScore: average_scores.negative || 0,
        color: "#FF6B6B",
        emoji: "😢",
        icon: (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="#FF6B6B" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1" fill="white" />
            <circle cx="15" cy="9" r="1" fill="white" />
          </svg>
        ),
      },
    ]

    return chartData
  }


  const prepareCyberbullyingData = () => {
    if (!hasCyberbullyingData) {
      return []
    }

    const { average_probabilities, label_counts } = cyberbullyingAnalysis.result


    const cyberbullyingData = [
      {
        name: "Other",
        value: average_probabilities.other_cyberbullying * 100 || 0,
        count: label_counts.other_cyberbullying || 0,
        color: "#FF6B6B",
        icon: "🌐",
      },
      {
        name: "Gender",
        value: average_probabilities.gender * 100 || 0,
        count: label_counts.gender || 0,
        color: "#9B59B6",
        icon: "👥",
      },
      {
        name: "Age",
        value: average_probabilities.age * 100 || 0,
        count: label_counts.age || 0,
        color: "#3498DB",
        icon: "🎂",
      },
      {
        name: "Religion",
        value: average_probabilities.religion * 100 || 0,
        count: label_counts.religion || 0,
        color: "#E67E22",
        icon: "⛪️️",
      },
      {
        name: "Ethnicity",
        value: average_probabilities.ethnicity * 100 || 0,
        count: label_counts.ethnicity || 0,
        color: "#1ABC9C",
        icon: "‍🌍‍",
      },
    ].sort((a, b) => b.value - a.value)

    const maxCount = Math.max(...cyberbullyingData.map((d) => d.count)) || 10

    return cyberbullyingData.map((item) => ({
      ...item,
      maxCount: maxCount,
    }))
  }

  const preparePieData = () => {
    if (!hasHateAnalysisData) {
      return []
    }

    const { summary, counts } = hateAnalysis.result

    const { OFFENSIVE: offensivePct, NOT_OFFENSIVE: notOffensivePct } = summary
    const { OFFENSIVE: offensiveCount, NOT_OFFENSIVE: notOffensiveCount } = counts

    const total = offensiveCount + notOffensiveCount
    if (total === 0) return []

    return [
      {
        name: "Safe Comments",
        value: notOffensivePct,
        value2: notOffensiveCount,
        percentage: notOffensivePct,
        color: "#5B9BD5",
        icon: "🛡️",
      },
      {
        name: "Offensive Comments",
        value: offensivePct,
        value2: offensiveCount,
        percentage: offensivePct,
        color: "#EF4444",
        icon: "⚠️",
      },
    ]
  }

  const chartData = prepareChartData()
  const cyberbullyingData = prepareCyberbullyingData()
  const pieData = preparePieData()


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      const colors = ["#5B9BD5", "#FF6B6B"]
      const color = colors[pieData.findIndex((item) => item.name === data.name) % colors.length]

      return (
        <div
          style={{
            background: "white",
            padding: "12px 16px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            border: `2px solid ${color}`,
            fontSize: "14px",
            minWidth: "140px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "24px" }}>{data.icon}</span>
            <span style={{ fontWeight: "bold", color: color, fontSize: "16px" }}>{data.name}</span>
          </div>
        </div>
      )
    }
    return null
  }


  const CyberbullyingTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div
          style={{
            background: "white",
            padding: "12px 16px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            border: `2px solid ${data.color}`,
            fontSize: "14px",
            minWidth: "160px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>{data.icon}</span>
            <span style={{ fontWeight: "bold", color: data.color, fontSize: "14px" }}>{data.name}</span>
          </div>
          <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.7)" }}>
            <div>
              Comments: <strong>{data.count}</strong>
            </div>
            <div>
              Probability: <strong>{data.value.toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      )
    }
    return null
  }


  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius + 30
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    const lineRadius = outerRadius + 10
    const lineX = cx + lineRadius * Math.cos(-midAngle * RADIAN)
    const lineY = cy + lineRadius * Math.sin(-midAngle * RADIAN)

    return (
      <g>
        <line
          x1={cx + outerRadius * Math.cos(-midAngle * RADIAN)}
          y1={cy + outerRadius * Math.sin(-midAngle * RADIAN)}
          x2={lineX}
          y2={lineY}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
        />
        <line
          x1={lineX}
          y1={lineY}
          x2={x > cx ? lineX + 10 : lineX - 10}
          y2={lineY}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
        />

        <text
          x={x > cx ? x + 5 : x - 5}
          y={y}
          fill="rgba(0,0,0,0.8)"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize="16"
          fontWeight="600"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    )
  }

  const lineChartLegendMap = {
    likes: { name: "Likes", emoji: "❤️", color: "#8884d8" },
    replies: { name: "Replies", emoji: "💬", color: "#82ca9d" },
    totalComments: { name: "Total Comments", emoji: "📝", color: "#f7cbe1" },
  }

  const barChartLegendMap = {
    positive: { name: "Positive", emoji: "😊", color: "#59CD90" },
    neutral: { name: "Neutral", emoji: "😐", color: "#FFD93D" },
    negative: { name: "Negative", emoji: "😢", color: "#FF6B6B" },
    age: { name: "Age", emoji: "🎂", color: "#3498DB" },
    gender: { name: "Gender", emoji: "👥", color: "#9B59B6" },
    religion: { name: "Religion", emoji: "⛪️", color: "#E67E22" },
    ethnicity: { name: "Ethnicity", emoji: "🌍", color: "#1ABC9C" },
    other_cyberbullying: { name: "Other Cyberbullying", emoji: "🌐", color: "#EF4444" },
  }


  const EngagementOverTimeTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "white",
            padding: "12px 16px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            border: `2px solid rgba(63, 94, 251, 0.5)`,
            fontSize: "14px",
            minWidth: "180px",
          }}
        >
          <p className="font-bold text-gray-800 mb-2">Date: {formatDateRO(label)}</p>
          {payload.map((entry, index) => {
            const item = lineChartLegendMap[entry.dataKey]
            if (!item) return null
            return (
              <div key={`item-${index}`} className="flex items-center gap-2 py-1">
                <span className="text-lg">{item.emoji}</span>
                <span className="font-medium" style={{ color: item.color }}>
                  {item.name}: <strong>{entry.value}</strong>
                </span>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }


  const HourlyEngagementTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "white",
            padding: "12px 16px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            border: `2px solid rgba(252, 70, 107, 0.5)`,
            fontSize: "14px",
            minWidth: "200px",
          }}
        >
          <p className="font-bold text-gray-800 mb-2">Hour: {label}</p>
          {payload.map((entry, index) => {
            const item = barChartLegendMap[entry.dataKey]
            if (!item) return null
            return (
              <div key={`item-${index}`} className="flex items-center gap-2 py-1">
                <span className="text-lg">{item.emoji}</span>
                <span className="font-medium" style={{ color: item.color }}>
                  {item.name}: <strong>{entry.value}</strong>
                </span>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <div className="dashboard-container">

      <div className="new-analysis-button-container" style={{ display: "flex", alignItems: "center" }}>
        {/* Buton Export PDF */}
        <div style={{ position: "relative", marginRight: "10px" }}>
          <button
            className="new-analysis-button"
            onClick={() => handleExportPDF()}
            onMouseEnter={() => setShowExportTooltip(true)}
            onMouseLeave={() => setShowExportTooltip(false)}
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {showExportTooltip && <span className="tooltip">Export PDF</span>}
          </button>


          {showExportMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                padding: "8px 0",
                minWidth: "180px",
                zIndex: 1000,
                marginTop: "5px",
              }}
            >

              <button
                onClick={() => handleExportPDF()}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "10px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "rgba(0, 0, 0, 0.8)",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(0, 0, 0, 0.05)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                Export Data
              </button>
            </div>
          )}
        </div>

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
        </div>
      </div>

      {postLink && (
        <div className="current-analysis">
          <div className="tiktok-post-container">
            <div className="tiktok-post-info">
              {username && (
                <div className="tiktok-username">
                  <svg viewBox="0 0 24 24" width="20" height="20" className="tiktok-logo-icon">
                    <defs>
                      <linearGradient id="tiktok-username-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"
                      fill="url(#tiktok-username-gradient)"
                    />
                  </svg>
                  <span className="username-text">@{username}'s post</span>
                </div>
              )}
              <div className="url-display">{postLink}</div>
            </div>

            <div className="engagement-metrics-container">
              <div className="engagement-metrics">
                <div className="metric-item">
                  <svg className="metric-icon gradient-icon" viewBox="0 0 24 24" width="20" height="20">
                    <defs>
                      <linearGradient id="like-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill="url(#like-gradient)"
                    />
                  </svg>
                  <span className="metric-count">{engagementMetrics.likes}</span>
                </div>

                <div className="metric-item">
                  <svg className="metric-icon gradient-icon" viewBox="0 0 24 24" width="20" height="20">
                    <defs>
                      <linearGradient id="comment-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      fill="none"
                      stroke="url(#comment-gradient)"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="metric-count">{engagementMetrics.comments}</span>
                </div>

                <div className="metric-item">
                  <svg className="metric-icon gradient-icon" viewBox="0 0 24 24" width="20" height="20">
                    <defs>
                      <linearGradient id="share-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
                      fill="none"
                      stroke="url(#share-gradient)"
                      strokeWidth="2"
                    />
                    <polyline points="16,6 12,2 8,6" fill="none" stroke="url(#share-gradient)" strokeWidth="2" />
                    <line x1="12" y1="2" x2="12" y2="15" stroke="url(#share-gradient)" strokeWidth="2" />
                  </svg>
                  <span className="metric-count">{engagementMetrics.shares}</span>
                </div>

                <div className="metric-item">
                  <svg className="metric-icon gradient-icon" viewBox="0 0 24 24" width="20" height="20">
                    <defs>
                      <linearGradient id="save-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                      fill="none"
                      stroke="url(#save-gradient)"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="metric-count">{engagementMetrics.saves}</span>
                </div>

                <div className="metric-item">
                  <svg className="metric-icon gradient-icon" viewBox="0 0 24 24" width="20" height="20">
                    <defs>
                      <linearGradient id="plays-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                        <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
                      fill="none"
                      stroke="url(#plays-gradient)"
                      strokeWidth="2"
                    />
                    <circle cx="12" cy="12" r="3" fill="url(#plays-gradient)" />
                  </svg>
                  <span className="metric-count">{engagementMetrics.plays}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {hasAnalysisData ? (
          <div className="current-analysis">
            <div className="sentiment-analysis-container">
              <div className="chart-container">
                <div className="section-title-container">
                  <div className="section-title-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="url(#title-icon-gradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <defs>
                        <linearGradient id="title-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                          <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                        </linearGradient>
                      </defs>
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </div>
                  <h4 className="section-title">COMMENTS DISTRIBUTION</h4>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="value" position="right" formatter={(value) => `${value}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="average-scores-container">
                <div className="section-title-container-simple">
                  <h4 className="section-title-simple">SENTIMENT STRENGTH</h4>
                </div>
                {chartData.map((item, index) => (
                  <div key={index} className="score-item">
                    <div className="score-icon-container">{item.icon}</div>
                    <div className="score-value" style={{ color: item.color }}>
                      {item.averageScore.toFixed(1)} %
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {hasHateAnalysisData && pieData.length > 0 && (
              <div className="chart-container" style={{ marginTop: "30px", padding: "25px" }}>
                <div className="section-title-container">
                  <div className="section-title-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
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
                    </svg>
                  </div>
                  <h4 className="section-title">CONTENT SAFETY</h4>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "40px", marginTop: "20px" }}>
                  {/* Pie Chart - mai mare */}
                  <div style={{ flex: 1, maxWidth: "50%" }}>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={CustomLabel}
                          outerRadius={100}
                          innerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                          strokeWidth={3}
                          stroke="#fff"
                          paddingAngle={2}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                    {pieData.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "16px",
                          borderRadius: "12px",
                          background: index === 0 ? "rgba(91, 155, 213, 0.08)" : "rgba(255, 107, 107, 0.08)",
                          border: `1px solid ${item.color}30`,
                          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)"
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)"
                          e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)"
                        }}
                      >

                        <span style={{ fontSize: "28px", marginLeft: "8px" }}>{item.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: "600",
                              color: item.color,
                              fontSize: "16px",
                              marginBottom: "4px",
                            }}
                          >
                            {item.name}
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "rgba(0,0,0,0.7)",
                            }}
                          >
                            <strong>{item.value2}</strong> comments ({item.percentage}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {hasCyberbullyingData && cyberbullyingData.length > 0 && (
              <div className="sentiment-analysis-container">
                <div className="chart-container">
                  <div className="section-title-container">
                    <div className="section-title-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="url(#cyberbullying-gradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <defs>
                          <linearGradient id="cyberbullying-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                            <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                          </linearGradient>
                        </defs>
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <h4 className="section-title">CYBERBULLYING DISTRIBUTION</h4>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={cyberbullyingData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      barCategoryGap={15}
                    >

                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip content={<CyberbullyingTooltip />} />

                      <Bar dataKey="maxCount" radius={[6, 6, 0, 0]}>
                        {cyberbullyingData.map((entry, index) => {
                          const maxValue = Math.max(...cyberbullyingData.map((d) => d.count)) || 10
                          const fillPercentage = (entry.count / maxValue) * 100

                          return <Cell key={`cell-${index}`} fill={`url(#containerGradient-${index})`} />
                        })}
                        <LabelList
                          dataKey="count"
                          position="top"
                          formatter={(value) => value}
                          fontSize={16}
                          fontWeight="bold"
                          fill="rgba(0,0,0,0.8)"
                          offset={8}
                        />
                      </Bar>

                      <defs>
                        {cyberbullyingData.map((entry, index) => {
                          const maxValue = Math.max(...cyberbullyingData.map((d) => d.count)) || 10
                          const fillPercentage = (entry.count / maxValue) * 100

                          return (
                            <linearGradient
                              key={`containerGradient-${index}`}
                              id={`containerGradient-${index}`}
                              x1="0"
                              y1="1"
                              x2="0"
                              y2="0"
                            >

                              <stop offset="0%" stopColor={entry.color} stopOpacity="1" />
                              <stop offset={`${fillPercentage}%`} stopColor={entry.color} stopOpacity="1" />
                              <stop
                                offset={`${fillPercentage}%`}
                                stopColor="rgba(200, 200, 200, 0.4)"
                                stopOpacity="1"
                              />
                              <stop offset="100%" stopColor="rgba(200, 200, 200, 0.4)" stopOpacity="1" />
                            </linearGradient>
                          )
                        })}
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="average-scores-container">
                  <div className="section-title-container-simple">
                    <h4 className="section-title-simple">CYBERBULLYING STRENGTH</h4>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                    {cyberbullyingData.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          borderRadius: "8px",
                          background: `${item.color}08`,
                          border: `1px solid ${item.color}30`,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)"
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)"
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>{item.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: "600",
                              color: item.color,
                              fontSize: "13px",
                              marginBottom: "2px",
                            }}
                          >
                            {item.name}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "rgba(0,0,0,0.6)",
                            }}
                          >
                            <strong>{item.value.toFixed(1)}%</strong> probability
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="current-analysis">
            <div
              style={{
                background: "linear-gradient(to right, rgba(63, 94, 251, 0.05), rgba(252, 70, 107, 0.05))",
                border: "1px solid rgba(63, 94, 251, 0.1)",
                borderRadius: "10px",
                padding: "15px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                textAlign: "center",
                color: "rgba(0, 0, 0, 0.6)",
              }}
            >
              <p>No sentiment analysis data available</p>
              <p style={{ fontSize: "0.8rem", marginTop: "10px" }}>
                Debug: hasAnalysisData = {hasAnalysisData ? "true" : "false"}
              </p>
              <p style={{ fontSize: "0.7rem", marginTop: "5px" }}>
                Analysis is array: {Array.isArray(analysis) ? "true" : "false"}
              </p>
              <p style={{ fontSize: "0.7rem", marginTop: "5px" }}>
                Found general_analysis: {generalAnalysis ? "true" : "false"}
              </p>
              <p style={{ fontSize: "0.7rem", marginTop: "5px" }}>
                Analysis types: {Array.isArray(analysis) ? analysis.map((a) => a.type).join(", ") : "N/A"}
              </p>
            </div>
          </div>
        )}
        <div className="current-analysis">
          <div className="section-title-container">
            <div className="section-title-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#title-icon-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <h4 className="section-title">COMMENTS BY CYBERBULLYING CATEGORY</h4>
          </div>

          {Object.entries(groupedComments).map(([label, comments]) => {
            const labelDisplay = label.replace(/_/g, " ").toUpperCase()
            const labelIcons = {
              other_cyberbullying: "🌐",
              gender: "👥",
              age: "🎂",
              religion: "⛪️",
              ethnicity: "🌍",
            }
            const icon = labelIcons[label] || "💬"

            return (
              <div key={label} style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{icon}</span>
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, rgba(63, 94, 251, 1), rgba(252, 70, 107, 1))",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      margin: 0,
                    }}
                  >
                    {labelDisplay}
                  </h4>
                </div>

                <div className="cyberbullying-comment-list">
                  {comments.map((text, index) => (
                    <div key={index} className="cyberbullying-comment-card">
                      <div className="comment-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                          <defs>
                            <linearGradient id="userIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="rgba(63, 94, 251, 1)" />
                              <stop offset="100%" stopColor="rgba(252, 70, 107, 1)" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2V19.2c0-3.2-6.4-4.8-9.6-4.8z"
                            fill="url(#userIconGradient)"
                          />
                        </svg>
                      </div>
                      <div className="comment-text">
                        <span className="comment-prefix">'s comment:</span> "{text}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="current-analysis">
          <div className="chart-container" style={{ marginTop: "30px" }}>
            <div className="section-title-container">
              <div className="section-title-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#title-icon-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18M18 6l-6 6-3-3L3 15"></path>
                </svg>
              </div>
              <h4 className="section-title">ENGAGEMENT OVER TIME</h4>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementByDay}>
                {/* Removed CartesianGrid */}
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<EngagementOverTimeTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="likes" stroke="#8884d8" name="Likes" strokeWidth={2} />
                <Line type="monotone" dataKey="replies" stroke="#82ca9d" name="Replies" strokeWidth={2} />
                <Line type="monotone" dataKey="totalComments" stroke="#f7cbe1" name="Total Comments" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="current-analysis">
          <div className="chart-container" style={{ marginTop: "30px" }}>
            <div className="section-title-container">
              <div className="section-title-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#title-icon-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18M18 6l-6 6-3-3L3 15"></path>
                </svg>
              </div>
              <h4 className="section-title">
                HOURLY ENGAGEMENT FOR MOST ENGAGED DAY: {formatDateRO(topEngagementDay)}
              </h4>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyEngagement}>
                {/* Removed CartesianGrid */}
                <XAxis dataKey="hour" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<HourlyEngagementTooltip />} />
                <Legend />
                <Bar dataKey="positive" stackId="a" fill="#59CD90" />
                <Bar dataKey="neutral" stackId="a" fill="#FFD93D" />
                <Bar dataKey="negative" stackId="a" fill="#FF6B6B" />
                <Bar dataKey="age" stackId="a" fill="#3498DB" />
                <Bar dataKey="gender" stackId="a" fill="#9B59B6" />
                <Bar dataKey="religion" stackId="a" fill="#E67E22" />
                <Bar dataKey="ethnicity" stackId="a" fill="#1ABC9C" />
                <Bar dataKey="other_cyberbullying" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardContainer
