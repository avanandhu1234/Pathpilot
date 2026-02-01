import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Download, Star, Check } from "lucide-react"

const templates = [
  {
    id: 1,
    name: "Professional",
    description: "Clean single-column layout with black header. Perfect for corporate roles.",
    image: "/images/template-professional.png",
    category: "professional",
    popular: true,
    downloads: 12500,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Modern",
    description: "Two-column layout with photo and teal accents. Great for creative professionals.",
    image: "/images/template-modern.png",
    category: "modern",
    popular: false,
    downloads: 8900,
    rating: 4.7,
  },
  {
    id: 3,
    name: "Creative",
    description: "Bold two-column design with dark sidebar. Ideal for designers and marketers.",
    image: "/images/template-creative.png",
    category: "creative",
    popular: true,
    downloads: 15200,
    rating: 4.9,
  },
  {
    id: 4,
    name: "Executive",
    description: "Classic minimal centered layout. Best for senior leadership positions.",
    image: "/images/template-executive.png",
    category: "professional",
    popular: false,
    downloads: 6700,
    rating: 4.6,
  },
]

const features = [
  "ATS-friendly formatting",
  "Easy customization",
  "Multiple color options",
  "PDF & Word export",
  "Professional fonts",
  "Optimized for all industries",
]

export default function ResumeTemplatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <Image
          src="/images/resume-builder-hero.jpg"
          alt="Resume Templates"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <Badge className="mb-4 bg-background/20 text-background">50+ Templates</Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-background md:text-5xl">
            Resume Templates
          </h1>
          <p className="max-w-2xl text-lg text-background/80">
            Professional, ATS-optimized templates to help you land your dream job
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Features */}
        <section className="mb-12">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Templates */}
        <Tabs defaultValue="all" className="w-full">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-bold">Browse Templates</h2>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="modern">Modern</TabsTrigger>
              <TabsTrigger value="creative">Creative</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="professional" className="mt-0">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {templates
                .filter((t) => t.category === "professional")
                .map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="modern" className="mt-0">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {templates
                .filter((t) => t.category === "modern")
                .map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="creative" className="mt-0">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {templates
                .filter((t) => t.category === "creative")
                .map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <section className="mt-16">
          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <CardContent className="flex flex-col justify-center p-8 lg:p-12">
                <h2 className="mb-4 text-3xl font-bold">Ready to Build Your Resume?</h2>
                <p className="mb-6 text-muted-foreground">
                  Choose a template and start customizing it with our easy-to-use builder. Get
                  AI-powered suggestions to make your resume stand out.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link href="/resume-builder">Start Building</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="bg-transparent">
                    View Examples
                  </Button>
                </div>
              </CardContent>
              <div className="relative hidden h-64 lg:block lg:h-auto">
                <Image
                  src="/images/resume-builder-hero.jpg"
                  alt="Resume Builder"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function TemplateCard({
  template,
}: {
  template: {
    id: number
    name: string
    description: string
    image: string
    popular: boolean
    downloads: number
    rating: number
  }
}) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={template.image || "/placeholder.svg"}
          alt={template.name}
          fill
          className="object-cover object-top transition-transform group-hover:scale-105"
        />
        {template.popular && <Badge className="absolute left-3 top-3">Popular</Badge>}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="sm" variant="secondary">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="mb-1 font-semibold">{template.name}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium">{template.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Download className="h-4 w-4" />
            <span>{(template.downloads / 1000).toFixed(1)}k</span>
          </div>
        </div>
        <Button className="mt-4 w-full" asChild>
          <Link href="/resume-builder">Use Template</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
