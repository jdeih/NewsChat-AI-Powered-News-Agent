"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TopFilterBarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
  region: string
  onRegionChange: (region: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

const categories = [
  { id: "all", label: "All" },
  { id: "technology", label: "Tech" },
  { id: "business", label: "Business" },
  { id: "sports", label: "Sports" },
  { id: "politics", label: "Politics" },
  { id: "science", label: "Science" },
  { id: "entertainment", label: "Entertainment" },
  { id: "health", label: "Health" },
]

const regions = [
  { id: "global", label: "Global" },
  { id: "us", label: "United States" },
  { id: "gb", label: "United Kingdom" },
  { id: "ca", label: "Canada" },
  { id: "au", label: "Australia" },
  { id: "de", label: "Germany" },
  { id: "fr", label: "France" },
  { id: "jp", label: "Japan" },
]

const sortOptions = [
  { id: "publishedAt", label: "Latest" },
  { id: "popularity", label: "Popular" },
  { id: "relevancy", label: "Relevant" },
]

export function TopFilterBar({
  activeCategory,
  onCategoryChange,
  region,
  onRegionChange,
  sortBy,
  onSortChange,
}: TopFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-background border-b border-border">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="lg"
            className={cn("text-xl", activeCategory === category.id && "bg-primary text-primary-foreground")}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Dropdowns */}
      <div className="flex gap-4">
        <Select value={region} onValueChange={onRegionChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((regionOption) => (
              <SelectItem key={regionOption.id} value={regionOption.id}>
                {regionOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
