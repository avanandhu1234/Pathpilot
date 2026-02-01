import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Heart,
  Users,
  Lightbulb,
  Award,
  Globe,
  ArrowRight,
} from "lucide-react"

const stats = [
  { value: "2025", label: "Founded" },
  { value: "24hrs", label: "Build Time" },
  { value: "4", label: "Team Members" },
  { value: "1", label: "Hackathon" },
]

const values = [
  {
    icon: Heart,
    title: "People First",
    description:
      "We believe in putting people at the center of everything we do, whether they're job seekers or employers.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We constantly push boundaries to create better tools and experiences for our users.",
  },
  {
    icon: Users,
    title: "Inclusion",
    description:
      "We're committed to building a diverse platform that creates opportunities for everyone.",
  },
  {
    icon: Target,
    title: "Impact",
    description:
      "We measure success by the positive change we create in people's lives and careers.",
  },
]

const team = [
  {
    name: "Anandhu Krishnan",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
  },
  {
    name: "Abderahmane",
    role: "CTO & Co-Founder",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
  },
  {
    name: "Amal",
    role: "VP of Product",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop",
  },
  {
    name: "Ravi Teja",
    role: "VP of Engineering",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
  },
]

const milestones = [
  { year: "Day 1", event: "Team formed at Coursera AI Hackathon 2025" },
  { year: "Hour 2", event: "Brainstormed PathPilot concept - AI-powered career platform" },
  { year: "Hour 6", event: "Designed UI/UX and core user experience" },
  { year: "Hour 10", event: "Built Job Finder with smart matching algorithms" },
  { year: "Hour 14", event: "Launched Assisted Apply and Resume Builder" },
  { year: "Hour 18", event: "Integrated Career Guidance with AI insights" },
  { year: "Hour 22", event: "Completed full platform with all features" },
  { year: "Today", event: "PathPilot ready to transform careers worldwide" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <Image
          src="/images/about-hero.jpg"
          alt="About PathPilot"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <Badge className="mb-4 bg-background/20 text-background">Our Story</Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-background md:text-5xl">
            About PathPilot
          </h1>
          <p className="max-w-2xl text-lg text-background/80">
            We're on a mission to transform how people find meaningful work and how companies
            discover exceptional talent
          </p>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Mission */}
        <section className="mb-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At PathPilot, we believe everyone deserves a fulfilling career. Born at the Coursera AI 
              Hackathon 2025, our team of four passionate developers came together with a shared vision: 
              to democratize career advancement using the power of AI. In just 24 hours, we built a 
              comprehensive platform featuring smart job matching, assisted applications, an AI-powered 
              resume builder, and personalized career guidance. PathPilot represents what's possible 
              when innovation meets determination.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <h2 className="mb-8 text-center text-3xl font-bold">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Leadership */}
        <section className="mb-20">
          <h2 className="mb-8 text-center text-3xl font-bold">Leadership Team</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <Card key={member.name} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-20">
          <h2 className="mb-8 text-center text-3xl font-bold">Our Journey</h2>
          <div className="relative mx-auto max-w-2xl">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex items-center gap-4 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"} pl-12 md:pl-0`}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <span className="text-sm font-bold text-primary">{milestone.year}</span>
                        <p className="mt-1 text-muted-foreground">{milestone.event}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground md:static">
                    <span className="text-xs font-bold">{milestone.year.slice(2)}</span>
                  </div>
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="mb-20">
          <Card className="bg-muted/30">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <Award className="mb-4 h-12 w-12 text-primary" />
              <h2 className="mb-4 text-2xl font-bold">Built at Coursera AI Hackathon 2025</h2>
              <p className="mb-6 max-w-2xl text-muted-foreground">
                PathPilot was created during an intensive 24-hour hackathon, showcasing the power of 
                AI-driven development and collaborative innovation. Our team pushed boundaries to 
                deliver a full-featured career platform in record time.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2">
                  Coursera AI Hackathon 2025
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  Built in 24 Hours
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  AI-Powered Innovation
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section>
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center p-12 text-center">
              <Globe className="mb-4 h-12 w-12" />
              <h2 className="mb-4 text-3xl font-bold">Join Our Team</h2>
              <p className="mb-6 max-w-2xl text-primary-foreground/80">
                We're always looking for talented people to join our mission. Check out our open
                positions and become part of the PathPilot family.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link href="/browse-jobs">
                  View Open Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}
