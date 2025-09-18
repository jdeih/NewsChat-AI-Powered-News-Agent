"use client"

import { useState, useEffect } from "react"
import { NewsCard } from "@/components/news-card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TrendingUp, AlertCircle, RefreshCw } from "lucide-react"
import { fetchNews, type Article } from "@/lib/news-api"

interface NewsSectionProps {
  category: string
  region: string
  sortBy: string
}

export function NewsSection({ category, region, sortBy }: NewsSectionProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNews = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchNews(category, region, sortBy)

      if (response.error) {
        setError(response.error)
        setArticles([])
      } else {
        setArticles(response.articles)
      }
    } catch (err) {
      setError("Failed to load news articles")
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [category, region, sortBy])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading news...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadNews}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>

        {error.includes("NEWS_API_KEY") && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>To enable real news data:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xl">
                  <li>
                    Get a free API key from{" "}
                    <a
                      href="https://newsapi.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      NewsAPI.org
                    </a>
                  </li>
                  <li>
                    Add <code className="bg-muted px-1 rounded">NEWS_API_KEY=your_key_here</code> to your environment
                    variables
                  </li>
                  <li>
                    For AI summaries, also add{" "}
                    <code className="bg-muted px-1 rounded">GEMINI_API_KEY=your_gemini_key</code>
                  </li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            {category === "all" ? "Top Headlines" : `${category.charAt(0).toUpperCase() + category.slice(1)} News`}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={loadNews}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found for the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article, index) => (
            <NewsCard key={`${article.url}-${index}`} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
