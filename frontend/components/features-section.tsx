"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Search, CheckCircle2, FileText, TrendingUp, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Job Finder",
    description: "Smart job matching based on your skills and preferences",
    progress: 85,
    href: "/job-finder",
  },
  {
    icon: CheckCircle2,
    title: "Assisted Apply",
    description: "Guided application process with direct redirects to employer sites",
    progress: 72,
    href: "/assisted-apply",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description: "Create and optimize professional resumes that get noticed",
    progress: 60,
    href: "/resume-builder",
  },
  {
    icon: TrendingUp,
    title: "Career Guidance",
    description: "Personalized career insights and strategic planning tools",
    progress: 45,
    href: "/career-guidance",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 md:py-24" aria-label="Features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="block min-h-[180px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
            >
              <Card className="group h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 active:scale-[0.98] touch-manipulation">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <feature.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <CardTitle className="text-lg flex items-center justify-between gap-2">
                    {feature.title}
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 text-sm line-clamp-3">
                    {feature.description}
                  </CardDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Profile completion</span>
                      <span className="font-medium">{feature.progress}%</span>
                    </div>
                    <Progress value={feature.progress} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
