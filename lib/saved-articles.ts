"use client"

import type { Article } from "@/lib/news-api"

export interface SavedArticle extends Article {
  savedAt: Date
  userId?: string
}

export class SavedArticlesService {
  private static instance: SavedArticlesService
  private listeners: ((articles: SavedArticle[]) => void)[] = []

  static getInstance(): SavedArticlesService {
    if (!SavedArticlesService.instance) {
      SavedArticlesService.instance = new SavedArticlesService()
    }
    return SavedArticlesService.instance
  }

  private getStorageKey(userId?: string): string {
    return userId ? `newsChat_saved_${userId}` : "newsChat_saved_guest"
  }

  getSavedArticles(userId?: string): SavedArticle[] {
    if (typeof window === "undefined") return []

    try {
      const storageKey = this.getStorageKey(userId)
      const saved = localStorage.getItem(storageKey)
      if (!saved) return []

      const articles = JSON.parse(saved)
      return articles.map((article: any) => ({
        ...article,
        savedAt: new Date(article.savedAt),
      }))
    } catch (error) {
      console.error("Error loading saved articles:", error)
      return []
    }
  }

  saveArticle(article: Article, userId?: string): boolean {
    if (typeof window === "undefined") return false

    try {
      const storageKey = this.getStorageKey(userId)
      const savedArticles = this.getSavedArticles(userId)

      // Check if already saved
      if (savedArticles.some((saved) => saved.url === article.url)) {
        return false
      }

      const savedArticle: SavedArticle = {
        ...article,
        savedAt: new Date(),
        userId,
      }

      const updatedArticles = [savedArticle, ...savedArticles]
      localStorage.setItem(storageKey, JSON.stringify(updatedArticles))

      this.notifyListeners(updatedArticles)
      return true
    } catch (error) {
      console.error("Error saving article:", error)
      return false
    }
  }

  unsaveArticle(articleUrl: string, userId?: string): boolean {
    if (typeof window === "undefined") return false

    try {
      const storageKey = this.getStorageKey(userId)
      const savedArticles = this.getSavedArticles(userId)
      const updatedArticles = savedArticles.filter((article) => article.url !== articleUrl)

      localStorage.setItem(storageKey, JSON.stringify(updatedArticles))
      this.notifyListeners(updatedArticles)
      return true
    } catch (error) {
      console.error("Error unsaving article:", error)
      return false
    }
  }

  isArticleSaved(articleUrl: string, userId?: string): boolean {
    const savedArticles = this.getSavedArticles(userId)
    return savedArticles.some((article) => article.url === articleUrl)
  }

  clearAllSaved(userId?: string): void {
    if (typeof window === "undefined") return

    const storageKey = this.getStorageKey(userId)
    localStorage.removeItem(storageKey)
    this.notifyListeners([])
  }

  subscribe(listener: (articles: SavedArticle[]) => void, userId?: string) {
    this.listeners.push(listener)
    // Immediately call with current articles
    listener(this.getSavedArticles(userId))

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(articles: SavedArticle[]) {
    this.listeners.forEach((listener) => listener(articles))
  }

  // Migrate guest articles to user account when they sign in
  migrateGuestArticles(userId: string): void {
    if (typeof window === "undefined") return

    try {
      const guestArticles = this.getSavedArticles() // No userId = guest
      const userArticles = this.getSavedArticles(userId)

      if (guestArticles.length === 0) return

      // Merge articles, avoiding duplicates
      const mergedArticles = [...userArticles]
      guestArticles.forEach((guestArticle) => {
        if (!mergedArticles.some((article) => article.url === guestArticle.url)) {
          mergedArticles.push({ ...guestArticle, userId })
        }
      })

      // Save merged articles to user account
      const userStorageKey = this.getStorageKey(userId)
      localStorage.setItem(userStorageKey, JSON.stringify(mergedArticles))

      // Clear guest articles
      localStorage.removeItem(this.getStorageKey())

      this.notifyListeners(mergedArticles)
    } catch (error) {
      console.error("Error migrating guest articles:", error)
    }
  }
}
