"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, ExternalLink, Briefcase, FileText, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api, type BackendJobResponse, mapBackendJobToJob, type JobResponse, type ResumeWithScore, ApiError } from "@/lib/api"

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<JobResponse[]>([])
  const [resumes, setResumes] = useState<ResumeWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const latestEvaluatedResume = resumes
    .filter((r) => r.evaluated_at != null && r.overall_score != null)
    .sort((a, b) => (b.evaluated_at || "").localeCompare(a.evaluated_at || ""))[0] ?? null

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/sign-in?next=/dashboard")
      return
    }
    if (isAuthenticated) {
      Promise.all([
        api.get<BackendJobResponse[]>("/api/jobs/list").then((list) => (Array.isArray(list) ? list.map(mapBackendJobToJob) : [])),
        api.get<ResumeWithScore[]>("/api/resume/list").then((list) => (Array.isArray(list) ? list : [])),
      ])
        .then(([jobList, resumeList]) => {
          setJobs(jobList)
          setResumes(resumeList)
        })
        .catch((err) => {
          setJobs([])
          setResumes([])
          setError(err instanceof ApiError ? (err.detail as string) || err.message : "Failed to load dashboard")
          if (err instanceof ApiError && err.status === 401) {
            router.replace("/sign-in?next=/dashboard")
          }
        })
        .finally(() => setLoading(false))
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative h-[200px] min-h-[160px] overflow-hidden sm:h-[240px]">
        <Image
          src="/images/resume-builder-hero.jpg"
          alt="Dashboard"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-background sm:text-4xl">
            My Dashboard
          </h1>
          <p className="max-w-xl text-base text-background/80">
            Track your job applications and resume activity
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-primary" />
                Jobs applied
              </CardTitle>
              <CardDescription>Total applications (redirects recorded)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{loading ? "—" : jobs.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Resume score
              </CardTitle>
              <CardDescription>
                {latestEvaluatedResume
                  ? "Latest evaluation from Resume Builder"
                  : "Evaluate your resume in Resume Builder to see your score"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-3xl font-bold text-muted-foreground">—</p>
              ) : latestEvaluatedResume?.overall_score != null ? (
                <p className="text-3xl font-bold text-primary">{Math.round(latestEvaluatedResume.overall_score)}%</p>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/resume-builder">Evaluate resume</Link>
                </Button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Next step
              </CardTitle>
              <CardDescription>Build or improve your resume with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                <Link href="/resume-builder">Resume Builder</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {latestEvaluatedResume?.score_details && typeof latestEvaluatedResume.score_details === "object" && "feedback" in latestEvaluatedResume.score_details && Array.isArray(latestEvaluatedResume.score_details.feedback) && latestEvaluatedResume.score_details.feedback.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Latest evaluation tips</CardTitle>
              <CardDescription>Feedback from your last resume evaluation (OpenAI)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(latestEvaluatedResume.score_details.feedback as string[]).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Applied jobs</CardTitle>
            <CardDescription>
              Jobs you clicked Apply on. Open the link to complete your application on the employer site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-6 text-center text-muted-foreground">Loading…</p>
            ) : jobs.length === 0 ? (
              <div className="py-8 text-center">
                <p className="mb-4 text-muted-foreground">You haven’t applied to any jobs yet.</p>
                <Button asChild>
                  <Link href="/job-finder">Find jobs</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {jobs.map((job) => (
                  <li key={job.id}>
                    <Card className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold">{job.job_title}</h3>
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Building2 className="h-4 w-4 shrink-0" />
                              {job.company_name}
                            </p>
                            {job.location && (
                              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 shrink-0" />
                                {job.location}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-2">
                            {job.application_url && job.application_url.startsWith("http") ? (
                              <Button size="sm" variant="outline" asChild>
                                <a
                                  href={job.application_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Open apply link
                                  <ExternalLink className="ml-1.5 h-4 w-4" />
                                </a>
                              </Button>
                            ) : (
                              <Badge variant="secondary">Redirect recorded</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/job-finder">Search more jobs</Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/assisted-apply">Assisted Apply</Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/resume-builder">Resume Builder</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
