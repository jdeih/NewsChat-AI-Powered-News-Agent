"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"

export function NotificationsSection() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Breaking news alerts and updates will appear here when available.</p>
        </CardContent>
      </Card>
    </div>
  )
}
