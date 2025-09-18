"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NewsCard } from "@/components/news-card"
import { Bookmark, Trash2, Loader2, Info } from "lucide-react"
import { useSavedArticles } from "@/hooks/use-saved-articles"
import { useAuth } from "@/hooks/use-auth"

export function SavedSection() {
  const { savedArticles, loading, clearAllSaved, count } = useSavedArticles()
  const { isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading saved articles...</span>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Saved Articles {count > 0 && `(${count})`}</h2>
        </div>

        {count > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllSaved}
            className="text-destructive hover:text-destructive bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {!isAuthenticated && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your saved articles are stored locally. Sign in to sync them across devices and keep them permanently.
          </AlertDescription>
        </Alert>
      )}

      {count === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No saved articles yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Articles you save will appear here. Click the bookmark icon on any news card to save it for later reading.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedArticles.map((article, index) => (
            <div key={`${article.url}-${index}`} className="relative">
              <NewsCard article={article} />
              <div className="absolute top-2 left-2">
                <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Saved {article.savedAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
