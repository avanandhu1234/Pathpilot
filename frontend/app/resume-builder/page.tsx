"use client"

import { Suspense, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Download,
  Eye,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Lightbulb,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  api,
  type ResumeImproveResponse,
  type ResumeGenerateResponse,
  type ResumeEvaluateResponse,
  ApiError,
  isUpgradeRequiredError,
  getApiErrorMessage,
} from "@/lib/api"
import { UpgradePrompt } from "@/components/upgrade-prompt"

const templates = [
  {
    id: 1,
    name: "Professional",
    popular: true,
    description: "Clean single-column layout with black header",
    image: "/images/template-professional.png",
  },
  {
    id: 2,
    name: "Modern",
    popular: false,
    description: "Two-column with photo and teal accents",
    image: "/images/template-modern.png",
  },
  {
    id: 3,
    name: "Creative",
    popular: true,
    description: "Two-column with dark sidebar",
    image: "/images/template-creative.png",
  },
  {
    id: 4,
    name: "Executive",
    popular: false,
    description: "Classic minimal centered layout",
    image: "/images/template-executive.png",
  },
]

const sections = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Award },
]

const defaultResumeScore = {
  overall: 78,
  categories: [
    { name: "Content", score: 85, status: "good" },
    { name: "Keywords", score: 65, status: "warning" },
    { name: "Formatting", score: 90, status: "good" },
    { name: "Length", score: 70, status: "warning" },
  ],
}

const suggestions = [
  { type: "improvement", text: "Add more quantifiable achievements to your experience section" },
  { type: "missing", text: "Consider adding relevant certifications" },
  { type: "tip", text: "Use action verbs at the start of bullet points" },
]

/** Sample resume for demo flow when user arrives from Apply. */
const SAMPLE_RESUME = `John Anderson
San Francisco, CA | john.anderson@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Experienced product designer with 8+ years of expertise in creating user-centered digital experiences. Passionate about solving complex problems through thoughtful design.

EXPERIENCE
Senior Product Designer, TechCorp Inc. (2020 – Present)
• Led design for core product used by 2M+ users; improved conversion by 24%
• Collaborated with engineering and product to ship features on time
• Mentored 3 junior designers

Product Designer, StartupXYZ (2016 – 2020)
• Designed mobile and web apps from concept to launch
• Conducted user research and A/B tests to inform decisions

EDUCATION
B.S. Graphic Design, State University (2016)

SKILLS
Figma, Sketch, Adobe XD, User Research, Prototyping, HTML/CSS`

function ResumeBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [activeSection, setActiveSection] = useState("personal")
  const [formData, setFormData] = useState({
    fullName: "John Anderson",
    email: "john.anderson@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    summary:
      "Experienced product designer with 8+ years of expertise in creating user-centered digital experiences. Passionate about solving complex problems through thoughtful design.",
    experience:
      "Senior Product Designer, TechCorp Inc. (2021 - Present)\n• Led design for flagship product serving 2M+ users\n• Increased conversion rates by 35% through UX improvements\n\nProduct Designer, DesignStudio (2018 - 2021)\n• Designed mobile apps for Fortune 500 clients\n• Mentored junior designers",
    education: "B.S. Graphic Design, State University (2016)",
    skills: "Figma, Sketch, Adobe XD, User Research, Prototyping, HTML/CSS, A/B Testing",
  })
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [improveResult, setImproveResult] = useState<ResumeImproveResponse | null>(null)
  const [improveLoading, setImproveLoading] = useState(false)
  const [improveError, setImproveError] = useState<string | null>(null)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [evaluateLoading, setEvaluateLoading] = useState(false)
  const [evaluateError, setEvaluateError] = useState<string | null>(null)
  const [evaluateResult, setEvaluateResult] = useState<ResumeEvaluateResponse | null>(null)
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false)
  const [upgradePromptMessage, setUpgradePromptMessage] = useState("")
  const fromApplyJobTitle = searchParams.get("jobTitle") ?? ""
  const fromApplyCompany = searchParams.get("company") ?? ""
  const isFromApply = searchParams.get("fromApply") === "1"

  const resumeScore = evaluateResult
    ? {
        overall: evaluateResult.overall_score,
        categories: evaluateResult.categories.map((c) => ({
          name: c.name,
          score: c.score,
          status: c.status as "good" | "warning" | "poor",
        })),
      }
    : defaultResumeScore

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/sign-in?next=/resume-builder")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isFromApply && fromApplyJobTitle) {
      setResumeText(SAMPLE_RESUME)
      setJobDescription(
        fromApplyCompany
          ? `Applying to: ${fromApplyJobTitle} at ${fromApplyCompany}`
          : `Applying to: ${fromApplyJobTitle}`
      )
    }
  }, [isFromApply, fromApplyJobTitle, fromApplyCompany])

  const handleGenerate = async () => {
    setGenerateError(null)
    setGenerateLoading(true)
    try {
      const result = await api.post<ResumeGenerateResponse>("/api/resume/generate", {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        summary: formData.summary,
        experience: formData.experience,
        education: formData.education,
        skills: formData.skills,
      })
      setResumeText(result.resume_text)
    } catch (err) {
      setGenerateError(getApiErrorMessage(err, "Generate failed. Is the backend running? Check backend/.env for OPENAI_API_KEY."))
    } finally {
      setGenerateLoading(false)
    }
  }

  const handleEvaluate = async () => {
    if (!resumeText.trim()) return
    setEvaluateError(null)
    setEvaluateLoading(true)
    setEvaluateResult(null)
    try {
      const result = await api.post<ResumeEvaluateResponse>("/api/resume/evaluate", {
        resume_text: resumeText,
        job_description: jobDescription || undefined,
        save: true,
      })
      setEvaluateResult(result)
    } catch (err) {
      setEvaluateError(getApiErrorMessage(err, "Evaluate failed. Is the backend running? Check OPENAI_API_KEY."))
    } finally {
      setEvaluateLoading(false)
    }
  }

  const handleDownload = () => {
    const content = improveResult?.improved_text ?? resumeText
    if (!content.trim()) return
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resume.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImprove = async () => {
    if (!resumeText.trim()) return
    setImproveError(null)
    setImproveLoading(true)
    setImproveResult(null)
    try {
      const result = await api.post<ResumeImproveResponse>("/api/resume/improve", {
        resume_text: resumeText,
        job_description: jobDescription || undefined,
      })
      setImproveResult(result)
    } catch (err) {
      if (isUpgradeRequiredError(err)) {
        const msg = typeof err.detail === "object" && err.detail !== null && "message" in err.detail
          ? String((err.detail as { message?: string }).message)
          : "You've reached your Resume AI limit. Upgrade to continue."
        setUpgradePromptMessage(msg)
        setUpgradePromptOpen(true)
        setImproveError(null)
      } else {
        setImproveError(getApiErrorMessage(err, "Improve failed. Is the backend running? Check OPENAI_API_KEY in backend/.env."))
      }
    } finally {
      setImproveLoading(false)
    }
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[240px] min-h-[200px] overflow-hidden sm:h-[280px] md:h-[300px]">
        <Image
          src="/images/resume-builder-hero.jpg"
          alt="Professional resume creation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <Badge className="mb-4 bg-background/20 text-background">AI-Enhanced</Badge>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-background sm:mb-4 sm:text-4xl md:text-5xl">
            Resume Builder
          </h1>
          <p className="max-w-2xl text-base text-background/80 sm:text-lg">
            Create professional resumes that get noticed with our intelligent builder
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {isFromApply && (fromApplyJobTitle || fromApplyCompany) && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  Applying to: {fromApplyJobTitle}
                  {fromApplyCompany ? ` at ${fromApplyCompany}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  A sample resume is loaded below. Check your score, then view your dashboard to see all applications.
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link href="/dashboard">View my dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {/* AI Improve Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Resume Improver
            </CardTitle>
            <CardDescription>
              Paste your resume and optional job description. We&apos;ll suggest improvements and keywords.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(improveError || generateError || evaluateError) && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {improveError || generateError || evaluateError}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Resume text</label>
              <Textarea
                placeholder="Enter your info in the form and click Generate Resume, or paste your resume here…"
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="resize-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Job description (optional)</label>
              <Textarea
                placeholder="Paste the job description for targeted improvements…"
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="resize-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleGenerate}
                disabled={generateLoading}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {generateLoading ? "Generating…" : "Generate resume from form"}
              </Button>
              <Button
                onClick={handleEvaluate}
                disabled={evaluateLoading || !resumeText.trim()}
                variant="default"
                className="w-full sm:w-auto"
              >
                {evaluateLoading ? "Evaluating…" : "Evaluate & save score"}
              </Button>
              <Button
                onClick={handleImprove}
                disabled={improveLoading || !resumeText.trim()}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {improveLoading ? "Improving…" : "Improve with AI"}
              </Button>
              {isFromApply && (
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/dashboard">View my dashboard</Link>
                </Button>
              )}
            </div>
            {improveResult && (
              <div className="space-y-4 border-t pt-6">
                {improveResult.generations_remaining >= 0 && (
                  <p className="text-sm text-muted-foreground">
                    Generations remaining today: {improveResult.generations_remaining}
                  </p>
                )}
                <div>
                  <h4 className="mb-2 font-semibold">Improved text</h4>
                  <pre className="whitespace-pre-wrap rounded-lg bg-muted/30 p-4 text-sm">{improveResult.improved_text}</pre>
                </div>
                {improveResult.keyword_suggestions?.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">Keyword suggestions</h4>
                    <div className="flex flex-wrap gap-2">
                      {improveResult.keyword_suggestions.map((k) => (
                        <Badge key={k} variant="secondary">{k}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {improveResult.section_feedback && Object.keys(improveResult.section_feedback).length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">Section feedback</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {Object.entries(improveResult.section_feedback).map(([section, feedback]) => (
                        <li key={section}>
                          <span className="font-medium text-foreground">{section}:</span> {String(feedback)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Sections (stack first on mobile) */}
          <div className="order-2 lg:order-1 lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Resume Score */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Resume Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-center">
                  <div className="relative mx-auto h-24 w-24">
                    <svg className="h-full w-full -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(resumeScore.overall / 100) * 251.2} 251.2`}
                        className="text-primary"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                      {resumeScore.overall}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {resumeScore.categories.map((cat) => (
                    <div key={cat.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{cat.name}</span>
                        <span
                          className={`font-medium ${cat.status === "good" ? "text-emerald-600" : "text-amber-600"}`}
                        >
                          {cat.score}%
                        </span>
                      </div>
                      <Progress
                        value={cat.score}
                        className={`h-1.5 ${cat.status === "good" ? "[&>div]:bg-emerald-500" : "[&>div]:bg-amber-500"}`}
                      />
                    </div>
                  ))}
                </div>
                {evaluateResult?.feedback && evaluateResult.feedback.length > 0 && (
                  <div className="mt-4 space-y-2 pt-3 border-t">
                    <p className="text-sm font-medium">Evaluation tips</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {evaluateResult.feedback.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {isFromApply && (
                  <div className="mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                      <Link href="/dashboard">View my dashboard</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center - Editor */}
          <div className="order-1 lg:order-2 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Add your basic contact details. Use &quot;Generate resume from form&quot; to build your resume with AI.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Professional Summary</label>
                  <Textarea
                    rows={4}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="resize-none"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{formData.summary.length} characters</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Experience</label>
                  <Textarea
                    rows={5}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="Job title, company, dates, bullet points…"
                    className="resize-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Education</label>
                  <Textarea
                    rows={2}
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    placeholder="Degree, school, year"
                    className="resize-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Skills</label>
                  <Textarea
                    rows={2}
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Comma- or line-separated skills"
                    className="resize-none"
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generateLoading}
                  className="w-full sm:w-auto"
                >
                  {generateLoading ? "Generating…" : "Generate resume from form"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Templates & Suggestions */}
          <div className="order-3 lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      className="group relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted transition-all hover:border-primary hover:shadow-md"
                    >
                      <Image
                        src={template.image || "/placeholder.svg"}
                        alt={template.name}
                        fill
                        className="object-cover object-top transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                      {template.popular && (
                        <Badge className="absolute right-1 top-1 text-[10px]">Popular</Badge>
                      )}
                      <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-background">
                        {template.name}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions: show evaluation feedback when available, else static tips */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  {evaluateResult ? "Evaluation tips" : "AI Suggestions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {evaluateResult?.feedback && evaluateResult.feedback.length > 0
                  ? evaluateResult.feedback.map((tip, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm"
                      >
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <p className="text-muted-foreground">{tip}</p>
                      </div>
                    ))
                  : suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm"
                      >
                        {suggestion.type === "improvement" && (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        )}
                        {suggestion.type === "missing" && (
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        )}
                        {suggestion.type === "tip" && (
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        )}
                        <p className="text-muted-foreground">{suggestion.text}</p>
                      </div>
                    ))}
              </CardContent>
            </Card>

            {/* Actions - responsive */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                onClick={handleDownload}
                disabled={!(improveResult?.improved_text ?? resumeText).trim()}
              >
                <Download className="mr-2 h-4 w-4" />
                Download resume (.txt)
              </Button>
              <Button variant="outline" className="w-full bg-transparent sm:w-auto" asChild>
                <Link href="/dashboard">View dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <UpgradePrompt
        open={upgradePromptOpen}
        onOpenChange={setUpgradePromptOpen}
        title="Resume AI limit reached"
        message={upgradePromptMessage}
      />
    </div>
  )
}

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResumeBuilderContent />
    </Suspense>
  )
}
