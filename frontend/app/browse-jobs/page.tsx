"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Bookmark,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react"

const jobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$150k - $200k",
    posted: "2 days ago",
    tags: ["React", "Node.js", "AWS"],
    featured: true,
  },
  {
    id: 2,
    title: "Product Designer",
    company: "DesignStudio",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $160k",
    posted: "1 day ago",
    tags: ["Figma", "UI/UX", "Prototyping"],
    featured: true,
  },
  {
    id: 3,
    title: "Marketing Manager",
    company: "GrowthCo",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100k - $130k",
    posted: "3 days ago",
    tags: ["SEO", "Content", "Analytics"],
    featured: false,
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "DataDriven",
    location: "Boston, MA",
    type: "Full-time",
    salary: "$140k - $180k",
    posted: "5 hours ago",
    tags: ["Python", "ML", "SQL"],
    featured: false,
  },
  {
    id: 5,
    title: "Frontend Developer",
    company: "WebAgency",
    location: "Austin, TX",
    type: "Contract",
    salary: "$80/hr - $100/hr",
    posted: "1 week ago",
    tags: ["Vue.js", "TypeScript", "CSS"],
    featured: false,
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "CloudSystems",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$130k - $170k",
    posted: "4 days ago",
    tags: ["Kubernetes", "Docker", "CI/CD"],
    featured: false,
  },
]

const jobTypes = ["Full-time", "Part-time", "Contract", "Remote"]
const experienceLevels = ["Entry Level", "Mid Level", "Senior", "Lead", "Executive"]
const salaryRanges = ["$50k - $80k", "$80k - $120k", "$120k - $160k", "$160k+"]

export default function BrowseJobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[280px] overflow-hidden">
        <Image
          src="/images/job-finder-hero.jpg"
          alt="Browse Jobs"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-background md:text-5xl">
            Browse Jobs
          </h1>
          <p className="max-w-2xl text-lg text-background/80">
            Explore thousands of opportunities from top companies
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="City, state, or remote"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="shrink-0">Search Jobs</Button>
            <Button
              variant="outline"
              className="shrink-0 bg-transparent sm:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`${showFilters ? "fixed inset-0 z-50 block bg-background p-4" : "hidden"} w-full shrink-0 sm:relative sm:block sm:w-64`}
          >
            {showFilters && (
              <div className="mb-4 flex items-center justify-between sm:hidden">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Job Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <Checkbox />
                    {type}
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Experience Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {experienceLevels.map((level) => (
                  <label key={level} className="flex items-center gap-2 text-sm">
                    <Checkbox />
                    {level}
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Salary Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {salaryRanges.map((range) => (
                  <label key={range} className="flex items-center gap-2 text-sm">
                    <Checkbox />
                    {range}
                  </label>
                ))}
              </CardContent>
            </Card>

            {showFilters && (
              <div className="mt-4 flex gap-2 sm:hidden">
                <Button className="flex-1" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Clear
                </Button>
              </div>
            )}
          </aside>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{jobs.length}</span> jobs
              </p>
              <Button variant="ghost" size="sm" className="text-sm">
                Sort by: <span className="font-medium">Most Recent</span>
              </Button>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className={`transition-shadow hover:shadow-md ${job.featured ? "border-primary/50" : ""}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          {job.featured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {job.type}
                          </Badge>
                        </div>
                        <Link href={`/job/${job.id}`} className="group">
                          <h3 className="text-lg font-semibold group-hover:text-primary">
                            {job.title}
                          </h3>
                        </Link>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {job.posted}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Quick Apply
                      </Button>
                      <Link
                        href={`/job/${job.id}`}
                        className="flex items-center text-sm font-medium text-primary hover:underline"
                      >
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled className="bg-transparent">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                2
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                3
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
