"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  Upload,
  FileText,
  Sparkles,
  Building2,
  Target,
  Search,
  MapPin,
  ExternalLink,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api, type JobResponse, type BackendJobResponse, mapBackendJobToJob, ApiError, getApiErrorMessage, isUpgradeRequiredError } from "@/lib/api"
import { UpgradePrompt } from "@/components/upgrade-prompt"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description: "Our AI analyzes job requirements and tailors your application for maximum impact",
  },
  {
    icon: FileText,
    title: "One-Click Apply",
    description: "Apply to multiple jobs with a single click using your saved profile",
  },
  {
    icon: Target,
    title: "Smart Tracking",
    description: "Track all your applications in one place with real-time status updates",
  },
]

export default function AssistedApplyPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [jobTitle, setJobTitle] = useState("")
  const [location, setLocation] = useState("")
  const [jobs, setJobs] = useState<JobResponse[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverLetterJob, setCoverLetterJob] = useState<JobResponse | null>(null)
  const [coverLetterText, setCoverLetterText] = useState("")
  const [coverLetterLoading, setCoverLetterLoading] = useState(false)
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false)
  const [upgradePromptMessage, setUpgradePromptMessage] = useState("")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/sign-in?next=/assisted-apply")
      return
    }
    if (isAuthenticated) {
      api
        .get<BackendJobResponse[]>("/api/jobs/list")
        .then((list) => setJobs(Array.isArray(list) ? list.map(mapBackendJobToJob) : []))
        .catch((err) => {
          setJobs([])
          // 401 = token missing/expired; redirect to sign-in to get a fresh token
          if (err instanceof ApiError && err.status === 401) {
            router.replace("/sign-in?next=/assisted-apply")
          }
        })
    }
  }, [authLoading, isAuthenticated, router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploadLoading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      await api.postForm("/api/resume/upload", form)
      setUploadedFile(file.name)
    } catch (err) {
      setError(err instanceof ApiError ? (err.detail as string) || err.message : "Upload failed")
    } finally {
      setUploadLoading(false)
    }
  }

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

  const openCoverLetter = async (job: JobResponse) => {
    setCoverLetterJob(job)
    setCoverLetterText("")
    setCoverLetterLoading(true)
    try {
      const body = { job_id: job.id, job_title: job.job_title, company_name: job.company_name }
      const res = await api.post<{ text: string }>("/api/jobs/cover-letter", body)
      setCoverLetterText(res.text || "")
    } catch (err) {
      setCoverLetterText(err instanceof ApiError ? (err.detail as string) || err.message : "Failed to generate")
    } finally {
      setCoverLetterLoading(false)
    }
  }

  const handleApply = async (job: JobResponse) => {
    const hasValidApplyUrl =
      typeof job.application_url === "string" &&
      job.application_url.trim().startsWith("http")
    try {
      const body: { job_id: number; action: string; job?: { title: string; company: string; location: string | null; description: string | null; apply_url: string | null } } = {
        job_id: job.id,
        action: "redirected",
      }
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
    } catch (err) {
      if (isUpgradeRequiredError(err)) {
        const msg = typeof err.detail === "object" && err.detail !== null && "message" in err.detail
          ? String((err.detail as { message?: string }).message)
          : "Assisted Apply redirect limit reached. Upgrade to continue."
        setUpgradePromptMessage(msg)
        setUpgradePromptOpen(true)
        return
      }
    }
    if (hasValidApplyUrl) {
      window.open(job.application_url, "_blank", "noopener,noreferrer")
    } else {
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
      <section className="relative h-[260px] min-h-[220px] overflow-hidden sm:h-[320px] md:h-[350px]">
        <Image
          src="/images/assisted-apply-hero.jpg"
          alt="Professional applying for jobs"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <Badge className="mb-4 bg-background/20 text-background">AI-Powered Applications</Badge>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-background sm:mb-4 sm:text-4xl md:text-5xl">
            Assisted Apply
          </h1>
          <p className="max-w-2xl text-base text-background/80 sm:text-lg">
            Streamline your job applications with guided support and direct employer connections
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {/* Features */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Resume */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
            <CardDescription>Upload your resume so we can tailor applications. Text files also accepted.</CardDescription>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="resume-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-background p-8 transition-colors hover:border-primary"
            >
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="mb-1 font-medium">
                {uploadedFile || (uploadLoading ? "Uploading…" : "Click to upload or drag and drop")}
              </p>
              <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, or TXT (max 5MB)</p>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadLoading}
              />
            </label>
            {uploadedFile && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-primary/10 p-4">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile}</p>
                  <p className="text-sm text-muted-foreground">Uploaded successfully</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Jobs</CardTitle>
            <CardDescription>Search to load jobs, then generate cover letters and apply.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Job title"
                className="pl-10"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Location (default: United States)"
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} disabled={searchLoading}>
              {searchLoading ? "Searching…" : "Search Jobs"}
            </Button>
          </CardContent>
        </Card>

        {/* Job List */}
        <Card>
          <CardHeader>
            <CardTitle>Matched Jobs</CardTitle>
            <CardDescription>{jobs.length} jobs from your last search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">Search for jobs above to see results.</p>
            )}
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{job.job_title}</h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    {job.company_name}
                    {job.location && ` · ${job.location}`}
                  </p>
                  {(job.salary || job.posted_at) && (
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {job.salary && job.salary !== "Not specified" && (
                        <span>💰 {job.salary}</span>
                      )}
                      {job.posted_at && (
                        <span>📅 {job.posted_at}</span>
                      )}
                    </p>
                  )}
                  <div className="mt-2">
                    <Progress value={job.match_score} className="h-2 w-24" />
                    <span className="text-xs text-muted-foreground">{Math.round(job.match_score)}% match</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => openCoverLetter(job)} disabled={coverLetterLoading}>
                    {coverLetterLoading && coverLetterJob?.id === job.id ? "Generating…" : "Cover Letter"}
                  </Button>
                  <Button size="sm" className="w-full sm:w-auto" onClick={() => handleApply(job)}>
                    Apply
                    <ExternalLink className="ml-2 h-4 w-4 shrink-0" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cover Letter Modal */}
        <Dialog open={!!coverLetterJob} onOpenChange={(open) => !open && setCoverLetterJob(null)}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Cover Letter{coverLetterJob ? ` – ${coverLetterJob.job_title} at ${coverLetterJob.company_name}` : ""}
              </DialogTitle>
            </DialogHeader>
            {coverLetterLoading ? (
              <p className="text-muted-foreground">Generating…</p>
            ) : (
              <pre className="whitespace-pre-wrap rounded-lg bg-muted/30 p-4 text-sm">{coverLetterText || "—"}</pre>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <UpgradePrompt
        open={upgradePromptOpen}
        onOpenChange={setUpgradePromptOpen}
        title="Redirect limit reached"
        message={upgradePromptMessage}
      />
      <Footer />
    </div>
  )
}
