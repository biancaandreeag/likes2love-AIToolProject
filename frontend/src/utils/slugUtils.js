export function createSlug(text) {
  if (!text) return "untitled"

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50)
}

export function createDateSlug(isoDate) {
  if (!isoDate) return "no-date"

  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return "invalid-date"

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${year}:${month}:${day}:${hours}:${minutes}`
  } catch (error) {
    console.error("Error creating date slug:", error)
    return "invalid-date"
  }
}

export function generateDashboardUrl(postName, postLink, analysisDate) {
  const readablePart = createSlug(postName || postLink) // Slug lizibil din nume sau link
  const encodedPostLink = encodeURIComponent(postLink) // Link-ul complet codificat
  const dateSlug = createDateSlug(analysisDate) // Data analizei

  // Combinăm toate părțile într-un singur slug, folosind "---" ca separator
  return `/ai-analysis/${readablePart}---${encodedPostLink}---${dateSlug}`
}

export function parseCombinedSlug(combinedSlug) {
  if (!combinedSlug) {
    return { readableSlug: null, postLink: null, dateSlug: null }
  }

  const parts = combinedSlug.split("---")
  if (parts.length !== 3) {
    console.error("Invalid combined slug format:", combinedSlug)
    return { readableSlug: null, postLink: null, dateSlug: null }
  }

  const readableSlug = parts[0]
  const decodedPostLink = decodeURIComponent(parts[1])
  const dateSlug = parts[2]

  return {
    readableSlug: readableSlug,
    postLink: decodedPostLink,
    dateSlug: dateSlug,
  }
}

export function parseSlugInfo(readableSlug, dateSlug) {
  // Acum, readableSlug este partea lizibilă a URL-ului
  const readablePost = readableSlug
    ? readableSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Untitled"

  let parsedDate = null
  if (dateSlug && dateSlug !== "no-date" && dateSlug !== "invalid-date") {
    try {
      const parts = dateSlug.split(":")
      if (parts.length >= 5) {
        const [year, month, day, hours, minutes] = parts
        parsedDate = new Date(
          Number.parseInt(year),
          Number.parseInt(month) - 1,
          Number.parseInt(day),
          Number.parseInt(hours),
          Number.parseInt(minutes),
        )
      }
    } catch (error) {
      console.error("Error parsing date slug:", error)
    }
  }

  return {
    readablePost,
    parsedDate,
  }
}
