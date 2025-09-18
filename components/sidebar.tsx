"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "@/components/user-menu"
import { cn } from "@/lib/utils"
import { MessageCircle, Compass, Bookmark, Bell, Settings, Menu, X } from "lucide-react"
import { useSavedArticles } from "@/hooks/use-saved-articles"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const sidebarItems = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "saved", label: "Saved", icon: Bookmark, showBadge: true },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { count } = useSavedArticles()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and User Menu */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-sidebar-foreground">NewsChat</span>
            </div>
            <UserMenu />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id

                return (
                  <li key={item.id}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-11",
                        isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                      )}
                      onClick={() => {
                        onSectionChange(item.id)
                        setIsCollapsed(true) // Close mobile menu
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1 text-left text-lg">{item.label}</span>
                      {item.showBadge && count > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {count}
                        </Badge>
                      )}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsCollapsed(true)} />
      )}
    </>
  )
}
