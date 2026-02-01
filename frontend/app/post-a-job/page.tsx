"use client"

import { useState } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  Users,
  Zap,
  Check,
  ChevronRight,
} from "lucide-react"

const steps = [
  { id: 1, name: "Company Info", icon: Building2 },
  { id: 2, name: "Job Details", icon: FileText },
  { id: 3, name: "Requirements", icon: Users },
  { id: 4, name: "Review", icon: Check },
]

const benefits = [
  "Reach 10M+ active job seekers",
  "AI-powered candidate matching",
  "Applicant tracking included",
  "Employer branding tools",
]

export default function PostAJobPage() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[280px] overflow-hidden">
        <Image
          src="/images/employer-hero.jpg"
          alt="Post a Job"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <Badge className="mb-4 bg-background/20 text-background">For Employers</Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-background md:text-5xl">
            Post a Job
          </h1>
          <p className="max-w-2xl text-lg text-background/80">
            Find the perfect candidates for your open positions
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          currentStep >= step.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`mt-2 hidden text-sm sm:block ${
                          currentStep >= step.id
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-2 h-0.5 flex-1 ${
                          currentStep > step.id ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={(currentStep / steps.length) * 100} className="mt-4 h-1" />
            </div>

            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Tell us about your company to attract the right candidates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Company Name</label>
                      <Input placeholder="e.g. Acme Inc." />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Industry</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Company Website</label>
                    <Input placeholder="https://www.example.com" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Company Description</label>
                    <Textarea
                      placeholder="Tell candidates about your company culture, mission, and values..."
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Company Size</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Headquarters Location
                      </label>
                      <Input placeholder="e.g. San Francisco, CA" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Job Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>Provide the specifics about the role</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Job Title</label>
                    <Input placeholder="e.g. Senior Software Engineer" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Employment Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Work Location</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on-site">On-site</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Job Location</label>
                    <Input placeholder="e.g. New York, NY or Remote" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Salary Range (Min)</label>
                      <Input type="number" placeholder="e.g. 100000" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Salary Range (Max)</label>
                      <Input type="number" placeholder="e.g. 150000" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Job Description</label>
                    <Textarea
                      placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Requirements */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements & Qualifications</CardTitle>
                  <CardDescription>
                    What skills and experience are you looking for?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Required Skills</label>
                    <Textarea
                      placeholder="e.g. React, TypeScript, Node.js, AWS..."
                      rows={3}
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      Separate skills with commas
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Experience Level
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                        <SelectItem value="lead">Lead/Principal (8+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Education Requirements
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No requirement</SelectItem>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Nice-to-Have Qualifications
                    </label>
                    <Textarea
                      placeholder="Additional skills or experience that would be a plus..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Benefits & Perks</label>
                    <Textarea
                      placeholder="e.g. Health insurance, 401k, unlimited PTO, remote work..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Job Post</CardTitle>
                  <CardDescription>
                    Make sure everything looks good before publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-xl font-semibold">Senior Software Engineer</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">Full-time</Badge>
                      <Badge variant="secondary">Remote</Badge>
                      <Badge variant="secondary">$150k - $200k</Badge>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        Acme Inc.
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        San Francisco, CA
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-primary/5 border-primary/20 border p-4">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Ready to publish!</p>
                        <p className="text-sm text-muted-foreground">
                          Your job will be visible to millions of job seekers once published.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="bg-transparent"
              >
                Previous
              </Button>
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}>
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button>Publish Job Post</Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Post With Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pricing Preview */}
            <Card className="border-primary">
              <CardHeader>
                <Badge className="mb-2 w-fit">Most Popular</Badge>
                <CardTitle>Standard Posting</CardTitle>
                <CardDescription>Everything you need to find great candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$299</span>
                  <span className="text-muted-foreground"> / 30 days</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Featured placement
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Unlimited applications
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    AI candidate matching
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Analytics dashboard
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold">Need Help?</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Our team is here to help you create the perfect job post.
                </p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Contact Support
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
