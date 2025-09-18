import { type NextRequest, NextResponse } from "next/server"

interface NewsAPIResponse {
  status: string
  totalResults: number
  articles: Array<{
    source: { id: string | null; name: string }
    author: string | null
    title: string
    description: string | null
    url: string
    urlToImage: string | null
    publishedAt: string
    content: string | null
  }>
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get("category") || "general"
  const country = searchParams.get("country") || "us"
  const sortBy = searchParams.get("sortBy") || "publishedAt"
  const q = searchParams.get("q") // For search queries
  const from = searchParams.get("from") // Date filtering
  const to = searchParams.get("to") // Date filtering
  const location = searchParams.get("location") // Location-based search

  const apiKey = process.env.NEWS_API_KEY

  console.log("[v0] News API called with params:", { category, country, sortBy, q, from, to, location })
  console.log("[v0] NEWS_API_KEY configured:", !!apiKey)

  if (!apiKey) {
    console.error("[v0] NEWS_API_KEY is missing from environment variables")
    return NextResponse.json(
      {
        error: "NEWS_API_KEY is not configured. Please add your NewsAPI key to environment variables.",
        articles: [], // Return empty array so chat doesn't break
      },
      { status: 500 },
    )
  }

  try {
    let url = "https://newsapi.org/v2/"
    const params = new URLSearchParams({
      apiKey,
      pageSize: "20",
      sortBy,
    })

    if (q || location || from || to) {
      url += "everything"

      if (q) {
        params.append("q", q)
      }

      if (location) {
        const locationQuery = q ? `${q} AND ${location}` : location
        params.set("q", locationQuery)
      }

      if (from) {
        params.append("from", from)
      }

      if (to) {
        params.append("to", to)
      }

      params.append("language", "en")
      params.append("sortBy", "publishedAt")
    } else {
      url += "top-headlines"
      if (category !== "all") {
        params.append("category", category)
      }
      params.append("country", country)
    }

    const fullUrl = `${url}?${params}`
    console.log("[v0] Making NewsAPI request to:", fullUrl)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(fullUrl, {
      headers: {
        "User-Agent": "NewsChat/1.0",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("[v0] NewsAPI response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] NewsAPI error response:", errorText)
      throw new Error(`NewsAPI error: ${response.status} - ${errorText}`)
    }

    const data: NewsAPIResponse = await response.json()
    console.log("[v0] NewsAPI returned:", data.totalResults, "articles")

    const filteredArticles = data.articles
      .filter(
        (article) =>
          article.title &&
          article.description &&
          article.url &&
          !article.title.includes("[Removed]") &&
          !article.description.includes("[Removed]") &&
          article.title.length > 10,
      )
      .map((article) => ({
        ...article,
        publishedAt: new Date(article.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        description: article.description?.substring(0, 200) + (article.description?.length > 200 ? "..." : ""),
      }))

    console.log("[v0] Filtered articles count:", filteredArticles.length)

    const headers = {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400", // 1 hour cache, 24 hour stale
    }

    return NextResponse.json(
      {
        status: data.status,
        totalResults: data.totalResults,
        articles: filteredArticles,
      },
      { headers },
    )
  } catch (error) {
    console.error("[v0] News API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch news articles",
        articles: [], // Return empty array so chat doesn't break
      },
      { status: 500 },
    )
  }
}
