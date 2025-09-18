"use client"

import { useState, useEffect } from "react"
import { SavedArticlesService, type SavedArticle } from "@/lib/saved-articles"
import { useAuth } from "@/hooks/use-auth"
import type { Article } from "@/lib/news-api"

export function useSavedArticles() {
  const { user, isAuthenticated } = useAuth()
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const service = SavedArticlesService.getInstance()
    const userId = user?.id

    const unsubscribe = service.subscribe((articles) => {
      setSavedArticles(articles)
      setLoading(false)
    }, userId)

    return unsubscribe
  }, [user?.id])

  // Migrate guest articles when user signs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const service = SavedArticlesService.getInstance()
      service.migrateGuestArticles(user.id)
    }
  }, [isAuthenticated, user?.id])

  const saveArticle = (article: Article): boolean => {
    const service = SavedArticlesService.getInstance()
    return service.saveArticle(article, user?.id)
  }

  const unsaveArticle = (articleUrl: string): boolean => {
    const service = SavedArticlesService.getInstance()
    return service.unsaveArticle(articleUrl, user?.id)
  }

  const isArticleSaved = (articleUrl: string): boolean => {
    const service = SavedArticlesService.getInstance()
    return service.isArticleSaved(articleUrl, user?.id)
  }

  const clearAllSaved = (): void => {
    const service = SavedArticlesService.getInstance()
    service.clearAllSaved(user?.id)
  }

  return {
    savedArticles,
    loading,
    saveArticle,
    unsaveArticle,
    isArticleSaved,
    clearAllSaved,
    count: savedArticles.length,
  }
}
