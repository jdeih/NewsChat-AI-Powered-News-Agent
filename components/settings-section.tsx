"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Settings, Moon, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"

export function SettingsSection() {
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [updating, setUpdating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleUpdateProfile = async () => {
    if (!name.trim() || name === user?.name) return

    setUpdating(true)
    try {
      await updateProfile({ name: name.trim() })
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light"
    console.log("[v0] Theme toggle clicked:", newTheme)
    console.log("[v0] Current theme before change:", theme)
    setTheme(newTheme)

    setTimeout(() => {
      console.log("[v0] Theme after change:", document.documentElement.className)
    }, 100)
  }

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        </div>
        <div className="space-y-6">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Dark Mode
              </Label>
              <Switch id="dark-mode" checked={theme === "dark"} onCheckedChange={handleThemeChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="breaking-news">Breaking News Alerts</Label>
              <Switch id="breaking-news" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-digest">Daily News Digest</Label>
              <Switch id="daily-digest" />
            </div>
          </CardContent>
        </Card>

        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="display-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your display name"
                  />
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={updating || !name.trim() || name === user?.name}
                    size="lg"
                  >
                    {updating ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
