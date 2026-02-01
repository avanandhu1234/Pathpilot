"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Target,
  Award,
  Clock,
  Play,
  Star,
  BarChart3,
  Compass,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Bot,
  Sparkles,
  Plus,
} from "lucide-react"
import { KyroChat } from "@/components/kyro-chat"

const careerPaths = [
  {
    id: 1,
    title: "Product Designer",
    current: true,
    salary: "$95k - $145k",
    growth: "+15%",
    skills: ["UI/UX Design", "Prototyping", "User Research"],
  },
  {
    id: 2,
    title: "Design Lead",
    current: false,
    salary: "$140k - $180k",
    growth: "+12%",
    skills: ["Team Management", "Strategy", "Mentorship"],
  },
  {
    id: 3,
    title: "Head of Design",
    current: false,
    salary: "$180k - $250k",
    growth: "+8%",
    skills: ["Executive Leadership", "Budget Management", "Vision Setting"],
  },
]

const learningResources = [
  {
    id: 1,
    title: "Leadership Fundamentals",
    provider: "LinkedIn Learning",
    duration: "4 hours",
    rating: 4.8,
    enrolled: 12500,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
  },
  {
    id: 2,
    title: "Strategic Design Thinking",
    provider: "Coursera",
    duration: "6 weeks",
    rating: 4.9,
    enrolled: 8900,
    image: "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=400&q=80",
  },
  {
    id: 3,
    title: "Managing Design Teams",
    provider: "Skillshare",
    duration: "3 hours",
    rating: 4.7,
    enrolled: 5600,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80",
  },
]

const mentors = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "VP of Design at Meta",
    expertise: ["Design Leadership", "Career Growth"],
    available: true,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    id: 2,
    name: "Michael Torres",
    role: "Design Director at Google",
    expertise: ["Product Strategy", "Team Building"],
    available: true,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    id: 3,
    name: "Emily Watson",
    role: "Head of UX at Airbnb",
    expertise: ["UX Research", "Design Systems"],
    available: false,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
]

const insights = [
  {
    title: "Design roles projected to grow 23% by 2030",
    category: "Industry Trend",
    icon: TrendingUp,
  },
  {
    title: "Remote design positions increased 45% this year",
    category: "Job Market",
    icon: BarChart3,
  },
  {
    title: "AI skills are becoming essential for designers",
    category: "Skills Gap",
    icon: Lightbulb,
  },
]

const skillAssessment = [
  { name: "Visual Design", current: 85, target: 90 },
  { name: "User Research", current: 70, target: 85 },
  { name: "Leadership", current: 55, target: 80 },
  { name: "Communication", current: 75, target: 85 },
  { name: "Strategic Thinking", current: 60, target: 80 },
]

export default function CareerGuidancePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden">
        <Image
          src="/images/career-guidance-hero.jpg"
          alt="Career mentorship and guidance"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <Badge className="mb-4 bg-background/20 text-background">Personalized Insights</Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-background md:text-5xl">
            Career Guidance
          </h1>
          <p className="max-w-2xl text-lg text-background/80">
            Strategic planning tools and personalized insights to accelerate your career growth
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Insights */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <Card key={index} className="bg-muted/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{insight.category}</p>
                    <p className="text-sm font-medium">{insight.title}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Horizontal tab navigation: responsive buttons that switch content below */}
        <Tabs defaultValue="kyro" className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex h-10 w-full min-w-0 flex-nowrap items-center justify-start gap-1 rounded-lg border bg-muted/30 p-1 sm:w-auto sm:flex-initial md:gap-2">
              <TabsTrigger
                value="kyro"
                className="flex min-w-0 shrink-0 items-center gap-1.5 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Ask Kyro</span>
                <span className="sm:hidden">Kyro</span>
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="min-w-0 shrink-0 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="learning"
                className="min-w-0 shrink-0 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground"
              >
                Learning
              </TabsTrigger>
              <TabsTrigger
                value="mentors"
                className="min-w-0 shrink-0 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground"
              >
                Mentors
              </TabsTrigger>
              <TabsTrigger
                value="goals"
                className="min-w-0 shrink-0 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground"
              >
                Goals
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Kyro AI Chat Tab */}
          <TabsContent value="kyro" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <KyroChat />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Bot className="h-4 w-4" />
                      Meet Kyro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Kyro is your AI-powered career assistant, ready to help you navigate your professional journey 24/7.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Kyro can help with:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Career planning strategies
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Resume optimization tips
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Interview preparation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Salary negotiation advice
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Industry insights & trends
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Skills development guidance
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Voice Enabled</p>
                        <p className="text-xs text-muted-foreground">
                          Click the microphone to speak your questions and hear Kyro&apos;s responses read aloud.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Career Path */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Compass className="h-5 w-5" />
                      Your Career Path
                    </CardTitle>
                    <CardDescription>
                      Projected growth trajectory based on your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Path Line */}
                      <div className="absolute left-6 top-8 h-[calc(100%-4rem)] w-0.5 bg-muted" />

                      <div className="space-y-6">
                        {careerPaths.map((path) => (
                          <div key={path.id} className="relative flex gap-4">
                            <div
                              className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                                path.current
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted bg-background"
                              }`}
                            >
                              {path.current ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <Target className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div
                              className={`flex-1 rounded-lg border p-4 ${path.current ? "border-primary bg-primary/5" : ""}`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{path.title}</h3>
                                    {path.current && (
                                      <Badge variant="secondary" className="text-xs">
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {path.salary} • {path.growth} growth
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {path.skills.map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Skill Assessment */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Award className="h-4 w-4" />
                      Skill Assessment
                    </CardTitle>
                    <CardDescription>Current vs. target for next role</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skillAssessment.map((skill) => (
                      <div key={skill.name}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span>{skill.name}</span>
                          <span className="text-muted-foreground">
                            {skill.current}% / {skill.target}%
                          </span>
                        </div>
                        <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="absolute h-full bg-primary/30"
                            style={{ width: `${skill.target}%` }}
                          />
                          <div
                            className="absolute h-full bg-primary"
                            style={{ width: `${skill.current}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="mt-4 w-full bg-transparent">
                      Take Full Assessment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recommended Courses</h2>
                <p className="text-muted-foreground">
                  Personalized learning paths to reach your career goals
                </p>
              </div>
              <Button variant="outline">Browse All</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {learningResources.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 opacity-0 transition-opacity hover:opacity-100">
                      <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full">
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {course.provider}
                    </Badge>
                    <h3 className="mb-2 font-semibold">{course.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {course.rating}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {course.enrolled.toLocaleString()} enrolled
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Mentors Tab */}
          <TabsContent value="mentors" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Connect with Mentors</h2>
                <p className="text-muted-foreground">
                  Industry experts ready to guide your career journey
                </p>
              </div>
              <Button>Find a Mentor</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <Card key={mentor.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full">
                        <Image
                          src={mentor.image || "/placeholder.svg"}
                          alt={mentor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{mentor.name}</h3>
                        <p className="text-sm text-muted-foreground">{mentor.role}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${mentor.available ? "bg-emerald-500" : "bg-muted-foreground"}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {mentor.available ? "Available" : "Busy"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mentor.expertise.map((exp) => (
                        <Badge key={exp} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="mt-4 w-full"
                      variant={mentor.available ? "default" : "outline"}
                      disabled={!mentor.available}
                    >
                      {mentor.available ? "Request Session" : "Join Waitlist"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Career Goals</CardTitle>
                <CardDescription>Track your progress toward your objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">Become a Design Lead</h3>
                      <p className="text-sm text-muted-foreground">Target: Q4 2026</p>
                    </div>
                    <Badge>In Progress</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Overall Progress</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-muted-foreground line-through">
                        Complete leadership course
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-muted-foreground line-through">
                        Lead a major project
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-4 w-4 rounded-full border-2" />
                      <span>Mentor 2 junior designers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-4 w-4 rounded-full border-2" />
                      <span>Build cross-functional relationships</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Goal
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
