"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MapPin,
  Building2,
  Filter,
  Bookmark,
  ChevronDown,
  ExternalLink,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api, type JobResponse, type BackendJobResponse, mapBackendJobToJob, getApiErrorMessage, ApiError } from "@/lib/api"

const filters = [
  { label: "Job Type", options: ["Full-time", "Part-time", "Contract", "Remote"] },
  { label: "Experience", options: ["Entry Level", "Mid Level", "Senior", "Lead"] },
  { label: "Salary Range", options: ["$50k+", "$80k+", "$100k+", "$150k+"] },
]

export default function JobFinderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [jobTitle, setJobTitle] = useState(searchParams.get("q") ?? "")
  const [location, setLocation] = useState(searchParams.get("location") ?? "")
  const [savedJobs, setSavedJobs] = useState<number[]>([])
  const [jobs, setJobs] = useState<JobResponse[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/sign-in?next=/job-finder")
    }
  }, [authLoading, isAuthenticated, router])

  const toggleSaveJob = (id: number) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    )
  }

  /** Same job search logic as assisted-apply: POST /api/jobs/search, normalize response, map to JobResponse. */
  const handleSearch = async () => {
    setError(null)
    setSearchLoading(true)
    try {
      const res = await api.post<BackendJobResponse[] | { results?: BackendJobResponse[] }>(
        "/api/jobs/search",
        { job_title: jobTitle || "Software Engineer", location: location?.trim() ?? "", remote: false }
      )
      const list: BackendJobResponse[] = Array.isArray(res)
        ? res
        : Array.isArray((res as { results?: BackendJobResponse[] }).results)
          ? (res as { results: BackendJobResponse[] }).results
          : []
      setJobs(list.map(mapBackendJobToJob))
    } catch (err) {
      setError(getApiErrorMessage(err, "Search failed"))
      setJobs([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleQuickApply = async (job: JobResponse) => {
    const hasValidApplyUrl =
      typeof job.application_url === "string" &&
      job.application_url.trim().startsWith("http")
    try {
      const body: { job_id: number; action: string; job?: { title: string; company: string; location: string | null; description: string | null; apply_url: string | null } } = {
        job_id: job.id,
        action: "redirected",
      }
      // Mock search results use ids 1,2,... but may not exist in DB; send job payload so backend can create then record redirect
      body.job = {
        title: job.job_title,
        company: job.company_name,
        location: job.location,
        description: job.description,
        apply_url: job.application_url || null,
      }
      await api.post("/api/jobs/action", body)
      // Demo flow: redirect to Resume Builder with job context so user sees sample resume + score, then can go to Dashboard
      const params = new URLSearchParams({
        fromApply: "1",
        jobId: String(job.id),
        jobTitle: job.job_title,
        company: job.company_name,
      })
      router.push(`/resume-builder?${params.toString()}`)
    } catch {
      // still open link if we have one
    }
    if (hasValidApplyUrl) {
      window.open(job.application_url, "_blank", "noopener,noreferrer")
    } else {
      // Fallback: open company careers search (some apply links from job boards can 404)
      const q = encodeURIComponent(`${job.company_name} careers ${job.job_title}`)
      window.open(`https://www.google.com/search?q=${q}`, "_blank", "noopener,noreferrer")
    }
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[280px] min-h-[240px] overflow-hidden sm:h-[350px] md:h-[400px]">
        <Image
          src="/images/job-finder-hero.jpg"
          alt="Professional workplace"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-background sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
            Find Your Dream Job
          </h1>
          <p className="mb-6 max-w-2xl text-base text-background/80 sm:mb-8 sm:text-lg">
            Smart job matching powered by AI to connect you with opportunities that fit your skills
          </p>

          {/* Search Bar */}
          <div className="flex w-full max-w-4xl flex-col gap-3 rounded-xl bg-background p-4 shadow-lg md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Job title"
                className="h-12 border-0 bg-muted pl-10"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Location (default: United States)"
                className="h-12 border-0 bg-muted pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-12 px-8" onClick={handleSearch} disabled={searchLoading}>
              {searchLoading ? "Searching…" : "Search Jobs"}
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <aside className="w-full shrink-0 lg:w-64">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Filter className="h-5 w-5" />
                <h2 className="font-semibold">Filters</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {filters.map((filter) => (
                  <div key={filter.label}>
                    <button className="flex w-full items-center justify-between py-2 text-sm font-medium">
                      {filter.label}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="mt-2 space-y-2">
                      {filter.options.map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded border-input" />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{jobs.length}</span> jobs found
              </p>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Sort by: Best Match
                <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{job.job_title}</h3>
                            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              <span>{job.company_name}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={savedJobs.includes(job.id) ? "Remove from saved" : "Save job"}
                          >
                            <Bookmark
                              className={`h-5 w-5 ${savedJobs.includes(job.id) ? "fill-primary text-primary" : ""}`}
                            />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location || "—"}
                          </span>
                          {job.salary && job.salary !== "Not specified" && (
                            <span className="flex items-center gap-1">💰 {job.salary}</span>
                          )}
                          {job.posted_at && (
                            <span className="flex items-center gap-1">📅 {job.posted_at}</span>
                          )}
                        </div>

                        {expandedId === job.id && job.description && (
                          <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm">
                            {job.description}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {(job.matched_skills || []).map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Match Score</p>
                          <p className="text-2xl font-bold text-primary">{Math.round(job.match_score)}%</p>
                        </div>
                        <Progress value={job.match_score} className="h-2 w-24" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/30 px-4 py-3 sm:px-6">
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                      >
                        {expandedId === job.id ? "Hide Details" : "View Details"}
                      </Button>
                      <Button size="sm" className="w-full sm:w-auto" onClick={() => handleQuickApply(job)}>
                        Quick Apply
                        <ExternalLink className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {jobs.length === 0 && !searchLoading && (
              <p className="py-8 text-center text-muted-foreground">Search for jobs above to see results.</p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
