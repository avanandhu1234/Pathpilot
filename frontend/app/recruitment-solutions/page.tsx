import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Target,
  BarChart3,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Check,
  Building2,
} from "lucide-react"

const solutions = [
  {
    icon: Target,
    title: "AI-Powered Matching",
    description:
      "Our intelligent algorithms match your job posts with the most qualified candidates, reducing time-to-hire by 40%.",
    features: ["Smart candidate ranking", "Skills-based matching", "Culture fit scoring"],
  },
  {
    icon: Users,
    title: "Talent Sourcing",
    description:
      "Access our database of 10M+ active job seekers and passive candidates ready for new opportunities.",
    features: ["Passive candidate outreach", "Resume database access", "Boolean search tools"],
  },
  {
    icon: BarChart3,
    title: "Recruitment Analytics",
    description:
      "Make data-driven decisions with comprehensive analytics on your hiring funnel and candidate pipeline.",
    features: ["Pipeline visibility", "Source tracking", "Time-to-hire metrics"],
  },
  {
    icon: Zap,
    title: "Employer Branding",
    description:
      "Showcase your company culture and values to attract top talent with enhanced employer profiles.",
    features: ["Company page customization", "Employee testimonials", "Culture videos"],
  },
]

const stats = [
  { value: "10M+", label: "Active Job Seekers" },
  { value: "50K+", label: "Companies Trust Us" },
  { value: "40%", label: "Faster Time-to-Hire" },
  { value: "95%", label: "Customer Satisfaction" },
]

const testimonials = [
  {
    quote:
      "PathPilot transformed our hiring process. We reduced time-to-hire by 50% and found better quality candidates.",
    author: "Sarah Johnson",
    role: "VP of People",
    company: "TechStartup Inc.",
  },
  {
    quote:
      "The AI matching is incredible. It surfaces candidates we would have never found through traditional methods.",
    author: "Michael Chen",
    role: "Head of Talent",
    company: "GlobalCorp",
  },
]

export default function RecruitmentSolutionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden">
        <Image
          src="/images/employer-hero.jpg"
          alt="Recruitment Solutions"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <Badge className="mb-4 bg-background/20 text-background">For Employers</Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-background md:text-5xl">
            Recruitment Solutions
          </h1>
          <p className="mb-6 max-w-2xl text-lg text-background/80">
            End-to-end hiring tools designed to help you find, attract, and hire top talent faster
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background bg-transparent text-background hover:bg-background/10"
            >
              Request Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Comprehensive Hiring Tools</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Everything you need to build a world-class team, all in one platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {solutions.map((solution) => (
            <Card key={solution.title} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <solution.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{solution.title}</CardTitle>
                <CardDescription>{solution.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {solution.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <section className="mt-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Get started in minutes and start receiving quality applications
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create Your Account",
                description:
                  "Sign up and set up your company profile to start attracting candidates.",
              },
              {
                step: "2",
                title: "Post Your Jobs",
                description:
                  "Use our easy job posting tool to create compelling listings in minutes.",
              },
              {
                step: "3",
                title: "Review & Hire",
                description:
                  "Review AI-matched candidates and manage your entire hiring process.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-20">
          <h2 className="mb-8 text-center text-3xl font-bold">What Our Customers Say</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="bg-muted/30">
                <CardContent className="p-6">
                  <p className="mb-4 text-lg italic text-muted-foreground">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center p-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Hiring?</h2>
              <p className="mb-6 max-w-2xl text-primary-foreground/80">
                Join thousands of companies using PathPilot to build exceptional teams. Start your
                free trial today.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-background text-foreground hover:bg-background/90"
                  asChild
                >
                  <Link href="/post-a-job">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}
