"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"

export function HeroSection() {
  const [jobTitle, setJobTitle] = useState("")
  const [location, setLocation] = useState("")

  const searchParams = new URLSearchParams()
  if (jobTitle.trim()) searchParams.set("q", jobTitle.trim())
  if (location.trim()) searchParams.set("location", location.trim())
  const jobFinderHref = searchParams.toString() ? `/job-finder?${searchParams.toString()}` : "/job-finder"

  return (
    <section className="bg-secondary/30 py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8 max-w-5xl">
        <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Find Your Next Career Opportunity
        </h1>
        <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-pretty text-muted-foreground text-sm sm:text-base md:text-lg">
          Discover jobs that match your skills and aspirations
        </p>

        {/* Search Form - redirects to Job Finder */}
        <div className="mx-auto mt-6 sm:mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground shrink-0 pointer-events-none" />
            <Input
              type="text"
              placeholder="Job title, keywords, or company"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="h-11 bg-background pl-10 w-full min-w-0"
              aria-label="Job title or keywords"
            />
          </div>
          <div className="relative flex-1 min-w-0">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground shrink-0 pointer-events-none" />
            <Input
              type="text"
              placeholder="City, state, or remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-11 bg-background pl-10 w-full min-w-0"
              aria-label="Location"
            />
          </div>
          <Button size="lg" className="h-11 px-6 sm:px-8 shrink-0" asChild>
            <Link href={jobFinderHref}>Search Jobs</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
