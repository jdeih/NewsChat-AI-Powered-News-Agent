import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import type { NextRequest } from "next/server"

async function fetchNewsData(query: string, category = "general", sortBy = "publishedAt") {
  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey) {
    return { error: "NEWS_API_KEY is not configured" }
  }

  try {
    // Parse query for date and location information
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let from = ""
    let to = ""
    let location = ""
    let searchQuery = ""

    // Extract date information
    if (query.toLowerCase().includes("yesterday")) {
      from = yesterday.toISOString().split("T")[0]
      to = yesterday.toISOString().split("T")[0]
    } else if (query.toLowerCase().includes("today")) {
      from = today.toISOString().split("T")[0]
      to = today.toISOString().split("T")[0]
    } else if (query.match(/\d{1,2}[\s\-/]\w+[\s\-/]\d{4}/)) {
      // Extract specific dates like "5 sept 2025"
      const dateMatch = query.match(/(\d{1,2})[\s\-/](\w+)[\s\-/](\d{4})/)
      if (dateMatch) {
        const [, day, month, year] = dateMatch
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
        const monthIndex = monthNames.findIndex((m) => month.toLowerCase().startsWith(m))
        if (monthIndex !== -1) {
          const targetDate = new Date(Number.parseInt(year), monthIndex, Number.parseInt(day))
          from = targetDate.toISOString().split("T")[0]
          to = targetDate.toISOString().split("T")[0]
        }
      }
    }

    // Extract location information
    const locationKeywords = ["bangalore", "mumbai", "delhi", "india", "usa", "uk", "london", "new york", "california"]
    for (const loc of locationKeywords) {
      if (query.toLowerCase().includes(loc)) {
        location = loc
        break
      }
    }

    // Build search query
    if (location || from || to) {
      searchQuery = query.replace(/\b(news|latest|headlines|give me|show me|from|of|yesterday|today)\b/gi, "").trim()
    }

    const params = new URLSearchParams({
      category,
      sortBy,
    })

    if (searchQuery) params.append("q", searchQuery)
    if (location) params.append("location", location)
    if (from) params.append("from", from)
    if (to) params.append("to", to)

    const url = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/news?${params}`
    console.log("[v0] Fetching news with enhanced params:", url)

    const response = await fetch(url)

    if (!response.ok) {
      return { error: `NewsAPI error: ${response.status}` }
    }

    const data = await response.json()

    if (data.error) {
      return { error: data.error }
    }

    return { articles: data.articles }
  } catch (error) {
    console.error("[v0] Enhanced news fetch error:", error)
    return { error: "Failed to fetch news" }
  }
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, messages } = await request.json()

    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured. Please add it to your environment variables." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("[v0] Chat request received:", message)

    process.env.GOOGLE_GENERATIVE_AI_API_KEY = geminiApiKey

    const isNewsQuery =
      /\b(news|latest|headlines|what's happening|current events|breaking|today|recent|yesterday|update|happening)\b/i.test(
        message,
      )

    console.log("[v0] Is news query:", isNewsQuery)

    let prompt = ""

    if (isNewsQuery) {
      // Extract potential category or topic from the message
      const categories = ["technology", "business", "sports", "politics", "science", "entertainment", "health"]
      const foundCategory = categories.find(
        (cat) => message.toLowerCase().includes(cat) || message.toLowerCase().includes(cat.slice(0, -1)),
      )

      console.log("[v0] Found category:", foundCategory)

      try {
        console.log("[v0] Fetching enhanced news data")
        const newsData = await fetchNewsData(message, foundCategory || "general", "publishedAt")

        console.log("[v0] News data:", { hasArticles: !!newsData.articles, count: newsData.articles?.length })

        if (newsData.articles && newsData.articles.length > 0) {
          const topArticles = newsData.articles.slice(0, 4) // Show more articles
          const newsContext = topArticles
            .map((article: any) => `• ${article.title}\n  ${article.description}\n  Published: ${article.publishedAt}`)
            .join("\n\n")

          prompt = `Based on these recent news articles, answer the user's question: "${message}"\n\nNews Articles:\n${newsContext}\n\nProvide a comprehensive response with key details from the articles.`
        } else {
          prompt = `The user asked: "${message}". Explain that you couldn't find recent news articles matching their specific request. Suggest they try a different date range or location. Be helpful and brief.`
        }
      } catch (error) {
        console.error("[v0] Error fetching news for chat:", error)
        prompt = `The user asked: "${message}". Explain there's a temporary issue accessing news data. Be brief and helpful.`
      }
    } else {
      prompt = `Answer this question helpfully and briefly: "${message}"`
    }

    console.log("[v0] Generating AI response")

    const result = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 200, // Increased for more detailed responses
      temperature: 0.7,
    })

    console.log("[v0] AI response generated successfully")

    return new Response(JSON.stringify({ response: result.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
