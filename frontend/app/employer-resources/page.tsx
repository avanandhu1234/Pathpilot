import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Video,
  Download,
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  ArrowRight,
  Clock,
  Search,
} from "lucide-react"

const resources = [
  {
    type: "Guide",
    icon: FileText,
    title: "The Ultimate Hiring Playbook 2026",
    description:
      "A comprehensive guide to modern recruiting strategies, from sourcing to onboarding.",
    downloadCount: "12,500+",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop",
  },
  {
    type: "Template",
    icon: Download,
    title: "Job Description Templates",
    description: "50+ customizable job description templates for every role and industry.",
    downloadCount: "8,300+",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
  },
  {
    type: "Webinar",
    icon: Video,
    title: "Building a Diverse Workforce",
    description:
      "Expert insights on creating inclusive hiring practices and building diverse teams.",
    downloadCount: "5,200+ views",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=250&fit=crop",
  },
  {
    type: "Report",
    icon: TrendingUp,
    title: "2026 Salary Benchmarking Report",
    description: "Industry-wide salary data and compensation trends to help you stay competitive.",
    downloadCount: "15,000+",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
  },
]

const categories = [
  { name: "Hiring Guides", count: 24, icon: BookOpen },
  { name: "Templates", count: 50, icon: FileText },
  { name: "Webinars", count: 18, icon: Video },
  { name: "Reports", count: 12, icon: TrendingUp },
]

const upcomingWebinars = [
  {
    title: "AI in Recruitment: What You Need to Know",
    date: "Feb 15, 2026",
    time: "2:00 PM EST",
    speaker: "Dr. Emily Chen",
  },
  {
    title: "Reducing Time-to-Hire by 50%",
    date: "Feb 22, 2026",
    time: "1:00 PM EST",
    speaker: "Mark Thompson",
  },
  {
    title: "Employer Branding Best Practices",
    date: "Mar 1, 2026",
    time: "3:00 PM EST",
    speaker: "Sarah Williams",
  },
]

const blogPosts = [
  {
    title: "5 Interview Questions That Reveal True Potential",
    category: "Interviews",
    readTime: "5 min read",
  },
  {
    title: "How to Write Job Posts That Attract Top Talent",
    category: "Job Posting",
    readTime: "7 min read",
  },
  {
    title: "The Future of Remote Hiring",
    category: "Trends",
    readTime: "6 min read",
  },
  {
    title: "Building an Effective Onboarding Program",
    category: "Onboarding",
    readTime: "8 min read",
  },
]

export default function EmployerResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <Image
          src="/images/employer-hero.jpg"
          alt="Employer Resources"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <Badge className="mb-4 bg-background/20 text-background">Resource Center</Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-background md:text-5xl">
            Employer Resources
          </h1>
          <p className="mb-6 max-w-2xl text-lg text-background/80">
            Guides, templates, and insights to help you hire smarter
          </p>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="bg-background/95 pl-10 backdrop-blur"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Categories */}
        <section className="mb-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Card
                key={category.name}
                className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} resources</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Resources */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Resources</h2>
            <Link href="#" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {resources.map((resource) => (
              <Card
                key={resource.title}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={resource.image || "/placeholder.svg"}
                    alt={resource.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <Badge className="absolute left-3 top-3" variant="secondary">
                    <resource.icon className="mr-1 h-3 w-3" />
                    {resource.type}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 font-semibold group-hover:text-primary">{resource.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{resource.downloadCount}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Blog Posts */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold">Latest Articles</h2>
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <Card key={post.title} className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {post.category}
                      </Badge>
                      <h3 className="font-semibold hover:text-primary">
                        <Link href="#">{post.title}</Link>
                      </h3>
                      <p className="mt-1 flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {post.readTime}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="mt-6 w-full bg-transparent">
              View All Articles
            </Button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Webinars */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  Upcoming Webinars
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingWebinars.map((webinar) => (
                  <div key={webinar.title} className="border-b pb-4 last:border-0 last:pb-0">
                    <h4 className="font-medium">{webinar.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {webinar.date} at {webinar.time}
                    </p>
                    <p className="text-sm text-muted-foreground">with {webinar.speaker}</p>
                  </div>
                ))}
                <Button className="w-full bg-transparent" variant="outline">
                  View All Webinars
                </Button>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Stay Updated</CardTitle>
                <CardDescription>
                  Get the latest hiring tips and resources delivered to your inbox
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder="Enter your email" className="mb-3" />
                <Button className="w-full">Subscribe</Button>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Need Help?</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Our team is here to help you succeed in your hiring goals.
                    </p>
                    <Button variant="link" className="mt-2 h-auto p-0 text-primary">
                      Contact Support
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
