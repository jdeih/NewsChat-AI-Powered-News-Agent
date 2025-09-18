"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Bookmark, Sparkles, Loader2 } from "lucide-react"
import Image from "next/image"
import { summarizeArticle, type Article } from "@/lib/news-api"
import { useSavedArticles } from "@/hooks/use-saved-articles"

interface NewsCardProps {
  article: Article
}

export function NewsCard({ article }: NewsCardProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const { saveArticle, unsaveArticle, isArticleSaved } = useSavedArticles()

  const isSaved = isArticleSaved(article.url)

  const formatDate = (dateString) => {
  // First, check if the dateString is valid
  if (!dateString) {
    return "Date not available";
  }

  const date = new Date(dateString);

  // Check if the date object is valid
  if (isNaN(date.getTime())) {
    // If invalid, return a placeholder or the original string
    console.error("Invalid date string:", dateString);
    return dateString; // Fallback to showing the raw string
  }

  // If valid, format the date as before
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

  const handleSave = () => {
    if (isSaved) {
      unsaveArticle(article.url)
    } else {
      saveArticle(article)
    }
  }

  const handleSummarize = async () => {
    if (summary) {
      setSummary(null)
      return
    }

    setLoadingSummary(true)
    try {
      const content = article.content || article.description || ""
      const generatedSummary = await summarizeArticle(article.title, content)
      setSummary(generatedSummary)
    } catch (error) {
      setSummary("Failed to generate summary. Please try again.")
    } finally {
      setLoadingSummary(false)
    }
  }

  return (
    <Card className="h-full flex flex-col bg-card hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={article.urlToImage || "/placeholder.svg?height=200&width=400&text=News"}
            alt={article.title}
            fill
            className="object-cover rounded-t-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=200&width=400&text=News"
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/80 text-foreground">
              {article.source.name}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2 text-balance">{article.title}</h3>
        <p className="text-lg text-muted-foreground mb-3 line-clamp-3">{article.description}</p>
        <p className="text-sm text-muted-foreground">{formatDate(article.publishedAt)}</p>

        {(summary || loadingSummary) && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xl font-medium">AI Summary</span>
            </div>
            {loadingSummary ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xl text-muted-foreground">Generating summary...</span>
              </div>
            ) : (
              <p className="text-xl text-muted-foreground">{summary}</p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 bg-transparent"
          onClick={() => window.open(article.url, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Read More
        </Button>
        <Button variant="outline" size="lg" onClick={handleSummarize} disabled={loadingSummary}>
          {loadingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="lg" onClick={handleSave} className={isSaved ? "text-primary" : ""}>
          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
        </Button>
      </CardFooter>
    </Card>
  )
}
