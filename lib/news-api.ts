export interface Article {
  source: { id: string | null; name: string }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
  summary?: string
}

export interface NewsResponse {
  status: string
  totalResults: number
  articles: Article[]
  error?: string
}

export async function fetchNews(category = "all", country = "us", sortBy = "publishedAt"): Promise<NewsResponse> {
  try {
    const params = new URLSearchParams({
      category: category === "all" ? "general" : category,
      country: country === "global" ? "us" : country,
      sortBy,
    })

    const response = await fetch(`/api/news?${params}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch news")
    }

    return data
  } catch (error) {
    console.error("Error fetching news:", error)
    return {
      status: "error",
      totalResults: 0,
      articles: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function searchNews(query: string): Promise<NewsResponse> {
  try {
    const params = new URLSearchParams({ q: query })
    const response = await fetch(`/api/news?${params}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to search news")
    }

    return data
  } catch (error) {
    console.error("Error searching news:", error)
    return {
      status: "error",
      totalResults: 0,
      articles: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function summarizeArticle(title: string, content: string): Promise<string> {
  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate summary")
    }

    return data.summary
  } catch (error) {
    console.error("Error generating summary:", error)
    return "Unable to generate summary at this time."
  }
}
