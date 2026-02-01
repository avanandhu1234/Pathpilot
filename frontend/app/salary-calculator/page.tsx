"use client"

import { useState } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  MapPin,
  Briefcase,
  Building2,
  ArrowRight,
  Info,
} from "lucide-react"

const salaryData = {
  role: "Software Engineer",
  location: "San Francisco, CA",
  experience: "5-7 years",
  percentile: 75,
  salary: {
    low: 145000,
    median: 175000,
    high: 215000,
    average: 180000,
  },
  breakdown: {
    base: 155000,
    bonus: 15000,
    stock: 25000,
    other: 5000,
  },
}

const comparisons = [
  { city: "New York, NY", salary: 172000, diff: -2 },
  { city: "Seattle, WA", salary: 185000, diff: 6 },
  { city: "Austin, TX", salary: 145000, diff: -17 },
  { city: "Remote", salary: 160000, diff: -9 },
]

const topPayingCompanies = [
  { name: "Meta", salary: "$220k - $350k" },
  { name: "Google", salary: "$210k - $340k" },
  { name: "Netflix", salary: "$250k - $400k" },
  { name: "Apple", salary: "$200k - $320k" },
]

export default function SalaryCalculatorPage() {
  const [jobTitle, setJobTitle] = useState("Software Engineer")
  const [location, setLocation] = useState("San Francisco, CA")
  const [experience, setExperience] = useState("5-7")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[280px] overflow-hidden">
        <Image
          src="/images/salary-hero.jpg"
          alt="Salary Calculator"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-background md:text-5xl">
            Salary Calculator
          </h1>
          <p className="max-w-2xl text-lg text-background/80">
            Research salary ranges and compensation data for any role
          </p>
        </div>
      </section>

      {/* Search Form */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">Job Title</label>
              <Input
                placeholder="e.g. Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">Location</label>
              <Input
                placeholder="e.g. San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="w-full lg:w-48">
              <label className="mb-1.5 block text-sm font-medium">Experience</label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-2">0-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-7">5-7 years</SelectItem>
                  <SelectItem value="8-10">8-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full lg:w-auto">Calculate Salary</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Salary Range Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{salaryData.role}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {salaryData.location}
                      <span className="text-muted-foreground">|</span>
                      <Briefcase className="h-4 w-4" />
                      {salaryData.experience}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    Top {100 - salaryData.percentile}% earner
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      ${(salaryData.salary.low / 1000).toFixed(0)}k
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ${(salaryData.salary.high / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="relative h-4 rounded-full bg-muted">
                    <div
                      className="absolute h-full rounded-full bg-primary/20"
                      style={{ left: "10%", right: "10%" }}
                    />
                    <div
                      className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary"
                      style={{ left: `${salaryData.percentile}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        ${(salaryData.salary.median / 1000).toFixed(0)}k
                      </p>
                      <p className="text-sm text-muted-foreground">Median Salary</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      ${(salaryData.salary.low / 1000).toFixed(0)}k
                    </p>
                    <p className="text-sm text-muted-foreground">25th Percentile</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      ${(salaryData.salary.median / 1000).toFixed(0)}k
                    </p>
                    <p className="text-sm text-muted-foreground">Median</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      ${(salaryData.salary.high / 1000).toFixed(0)}k
                    </p>
                    <p className="text-sm text-muted-foreground">75th Percentile</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Compensation Breakdown</CardTitle>
                <CardDescription>Average total compensation components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(salaryData.breakdown).map(([key, value]) => {
                    const total = Object.values(salaryData.breakdown).reduce((a, b) => a + b, 0)
                    const percentage = (value / total) * 100
                    const labels: Record<string, string> = {
                      base: "Base Salary",
                      bonus: "Annual Bonus",
                      stock: "Stock/Equity",
                      other: "Other Benefits",
                    }
                    return (
                      <div key={key}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>{labels[key]}</span>
                          <span className="font-medium">${(value / 1000).toFixed(0)}k</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Compensation</span>
                    <span className="text-xl font-bold">
                      $
                      {(
                        Object.values(salaryData.breakdown).reduce((a, b) => a + b, 0) / 1000
                      ).toFixed(0)}
                      k
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Salary by Location</CardTitle>
                <CardDescription>How salaries compare in different cities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparisons.map((comp) => (
                    <div
                      key={comp.city}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{comp.city}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          ${(comp.salary / 1000).toFixed(0)}k
                        </span>
                        <Badge
                          variant={comp.diff >= 0 ? "default" : "secondary"}
                          className={comp.diff >= 0 ? "bg-emerald-500" : ""}
                        >
                          {comp.diff >= 0 ? "+" : ""}
                          {comp.diff}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Paying Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Top Paying Companies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPayingCompanies.map((company, index) => (
                  <div
                    key={company.name}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium">{company.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{company.salary}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Market Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Year-over-year growth</span>
                  <Badge className="bg-emerald-500">+8.5%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Job openings</span>
                  <span className="font-medium">45,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Demand trend</span>
                  <Badge variant="secondary">High</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 shrink-0 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">How we calculate salaries</p>
                    <p className="mt-1 text-muted-foreground">
                      Our data is sourced from thousands of verified salary reports, job
                      postings, and employer surveys.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold">Ready to negotiate?</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Use this data to confidently negotiate your next offer.
                </p>
                <Button className="w-full">
                  Browse Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
