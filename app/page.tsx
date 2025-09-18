"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopFilterBar } from "@/components/top-filter-bar"
import { NewsSection } from "@/components/news-section"
import { ChatSection } from "@/components/chat-section"
import { SavedSection } from "@/components/saved-section"
import { NotificationsSection } from "@/components/notifications-section"
import { SettingsSection } from "@/components/settings-section"

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("discover")
  const [activeCategory, setActiveCategory] = useState("all")
  const [region, setRegion] = useState("global")
  const [sortBy, setSortBy] = useState("publishedAt")

  const renderMainContent = () => {
    switch (activeSection) {
      case "chat":
        return <ChatSection />
      case "discover":
        return <NewsSection category={activeCategory} region={region} sortBy={sortBy} />
      case "saved":
        return <SavedSection />
      case "notifications":
        return <NotificationsSection />
      case "settings":
        return <SettingsSection />
      default:
        return <NewsSection category={activeCategory} region={region} sortBy={sortBy} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 md:ml-64 flex flex-col overflow-hidden">
        {activeSection === "discover" && (
          <TopFilterBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            region={region}
            onRegionChange={setRegion}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        <div className="flex-1 overflow-auto">{renderMainContent()}</div>
      </main>
    </div>
  )
}
