import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Clock,
  User,
  TrendingUp,
  FileText,
  Users,
  Lightbulb,
  ArrowRight,
  Search,
} from "lucide-react"

const featuredArticles = [
  {
    id: 1,
    title: "How to Ace Your Next Technical Interview",
    description:
      "Master the art of technical interviews with these proven strategies from hiring managers at top tech companies.",
    category: "Interviews",
    readTime: "8 min read",
    author: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: 2,
    title: "Negotiating Your Salary: A Complete Guide",
    description:
      "Learn how to confidently negotiate your compensation package and get the pay you deserve.",
    category: "Salary",
    readTime: "10 min read",
    author: "Michael Torres",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: 3,
    title: "Building Your Personal Brand on LinkedIn",
    description:
      "Strategies to enhance your professional presence and attract better career opportunities.",
    category: "Networking",
    readTime: "6 min read",
    author: "Emily Watson",
    image: "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=600&h=400&fit=crop",
    featured: false,
  },
]

const categories = [
  { name: "Resume Tips", icon: FileText, count: 45 },
  { name: "Interview Prep", icon: Users, count: 32 },
  { name: "Career Growth", icon: TrendingUp, count: 28 },
  { name: "Workplace Skills", icon: Lightbulb, count: 21 },
]

const latestArticles = [
  {
    id: 4,
    title: "Remote Work Best Practices for 2026",
    category: "Workplace",
    readTime: "5 min read",
    date: "Jan 28, 2026",
  },
  {
    id: 5,
    title: "How AI is Changing the Job Market",
    category: "Industry Trends",
    readTime: "7 min read",
    date: "Jan 26, 2026",
  },
  {
    id: 6,
    title: "Writing a Cover Letter That Gets Noticed",
    category: "Applications",
    readTime: "4 min read",
    date: "Jan 24, 2026",
  },
  {
    id: 7,
    title: "Transitioning Careers: A Step-by-Step Guide",
    category: "Career Change",
    readTime: "9 min read",
    date: "Jan 22, 2026",
  },
  {
    id: 8,
    title: "Mastering the Art of Networking",
    category: "Networking",
    readTime: "6 min read",
    date: "Jan 20, 2026",
  },
]

export default function CareerAdvicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <Image
          src="/images/career-advice-hero.jpg"
          alt="Career Advice"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-background md:text-5xl">
            Career Advice
          </h1>
          <p className="mb-6 max-w-2xl text-lg text-background/80">
            Expert insights and tips to help you advance your career
          </p>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              className="bg-background/95 pl-10 backdrop-blur"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Categories */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Browse by Category</h2>
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
                    <p className="text-sm text-muted-foreground">{category.count} articles</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Articles */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Articles</h2>
            <Link href="/career-advice/all" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {featuredArticles
              .filter((a) => a.featured)
              .map((article) => (
                <Card key={article.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative h-48">
                    <Image
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute left-4 top-4">{article.category}</Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="mb-2 text-xl font-semibold hover:text-primary">
                      <Link href={`/career-advice/${article.id}`}>{article.title}</Link>
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">{article.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.readTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Latest Articles */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold">Latest Articles</h2>
            <div className="space-y-4">
              {latestArticles.map((article) => (
                <Card key={article.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/career-advice/${article.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {article.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {article.category}
                        </Badge>
                        <span>{article.readTime}</span>
                        <span>{article.date}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="mt-6 w-full bg-transparent">
              Load More Articles
            </Button>
          </div>

          {/* Sidebar */}
          <div>
            {/* Newsletter */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Career Newsletter</CardTitle>
                <CardDescription>
                  Get weekly career tips and job opportunities delivered to your inbox
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder="Enter your email" className="mb-3" />
                <Button className="w-full">Subscribe</Button>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Resume",
                    "Interview",
                    "Salary",
                    "Remote Work",
                    "Leadership",
                    "Networking",
                    "Career Change",
                    "Skills",
                    "LinkedIn",
                    "Negotiation",
                  ].map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
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
