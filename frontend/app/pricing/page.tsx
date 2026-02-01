"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api, type PlanId, type SubscriptionMeResponse } from "@/lib/api"

const PLANS = [
  {
    id: "free" as PlanId,
    name: "Explorer",
    priceMonthly: 0,
    priceYearly: null,
    description: "Get started with core job search",
    popular: false,
    features: [
      { text: "Resume AI", value: "2 per month", included: true },
      { text: "Career chatbot", value: "10 messages/month", included: true },
      { text: "Assisted Apply (redirect)", value: "10/month", included: true },
      { text: "Job saving", value: "10 jobs", included: true },
      { text: "AI job recommendations", value: "—", included: false },
      { text: "Resume tailoring per job", value: "—", included: false },
      { text: "Skill gap analysis", value: "—", included: false },
      { text: "Career roadmap", value: "—", included: false },
      { text: "AI mock interview", value: "—", included: false },
    ],
    cta: "Current Plan",
    ctaHref: "#",
    ctaVariant: "outline" as const,
  },
  {
    id: "pro" as PlanId,
    name: "PathPilot Pro",
    priceMonthly: 12,
    priceYearly: 99,
    description: "For serious job seekers",
    popular: true,
    features: [
      { text: "Resume AI", value: "20/month", included: true },
      { text: "Career chatbot", value: "Unlimited (fair use)", included: true },
      { text: "Assisted Apply (redirect)", value: "20/month", included: true },
      { text: "Job saving", value: "Unlimited", included: true },
      { text: "AI job recommendations", value: "Yes", included: true },
      { text: "Resume tailoring per job", value: "Yes", included: true },
      { text: "Priority match scoring", value: "Yes", included: true },
      { text: "Skill gap analysis", value: "Yes", included: true },
      { text: "Career roadmap", value: "—", included: false },
      { text: "AI mock interview", value: "—", included: false },
    ],
    cta: "Upgrade to Pro",
    ctaHref: "/pricing#pro",
    ctaVariant: "default" as const,
  },
  {
    id: "premium" as PlanId,
    name: "Career Accelerator",
    priceMonthly: 29,
    priceYearly: null,
    description: "Everything + career roadmap & mock interview",
    popular: false,
    features: [
      { text: "Resume AI", value: "Unlimited", included: true },
      { text: "Career chatbot", value: "Unlimited", included: true },
      { text: "Assisted Apply (redirect)", value: "Unlimited", included: true },
      { text: "Job saving", value: "Unlimited", included: true },
      { text: "AI job recommendations", value: "Yes", included: true },
      { text: "Resume tailoring per job", value: "Yes", included: true },
      { text: "Priority match scoring", value: "Yes", included: true },
      { text: "Skill gap analysis", value: "Yes", included: true },
      { text: "Multiple resume versions", value: "Yes", included: true },
      { text: "Career roadmap", value: "Yes", included: true },
      { text: "AI mock interview", value: "Yes", included: true },
    ],
    cta: "Upgrade to Premium",
    ctaHref: "/pricing#premium",
    ctaVariant: "default" as const,
  },
]

const COMPARISON_ROWS = [
  { feature: "Resume AI", free: "2/month", pro: "20/month", premium: "Unlimited" },
  { feature: "Career chatbot", free: "10 messages/month", pro: "Unlimited", premium: "Unlimited" },
  { feature: "Assisted Apply redirects", free: "10/month", pro: "20/month", premium: "Unlimited" },
  { feature: "Job saving", free: "10 jobs", pro: "Unlimited", premium: "Unlimited" },
  { feature: "AI job recommendations", free: "—", pro: "✓", premium: "✓" },
  { feature: "Resume tailoring per job", free: "—", pro: "✓", premium: "✓" },
  { feature: "Priority match scoring", free: "—", pro: "✓", premium: "✓" },
  { feature: "Skill gap analysis", free: "—", pro: "✓", premium: "✓" },
  { feature: "Multiple resume versions", free: "—", pro: "—", premium: "✓" },
  { feature: "Career roadmap", free: "—", pro: "—", premium: "✓" },
  { feature: "AI mock interview", free: "—", pro: "—", premium: "✓" },
]

export default function PricingPage() {
  const { isAuthenticated } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<PlanId | null>(null)
  const [mockLoading, setMockLoading] = useState(false)
  const [mockError, setMockError] = useState<string | null>(null)

  const loadPlan = () => {
    if (!isAuthenticated) return
    setMockError(null)
    api.get<SubscriptionMeResponse>("/api/subscription/me").then((r) => setCurrentPlan(r.plan)).catch(() => setCurrentPlan(null))
  }

  useEffect(() => {
    if (isAuthenticated) loadPlan()
  }, [isAuthenticated])

  const mockSetPlan = (plan: PlanId) => {
    setMockLoading(true)
    setMockError(null)
    api.post("/api/subscription/mock-set-plan", { plan })
      .then(() => { setCurrentPlan(plan); loadPlan(); })
      .catch(() => setMockError("Failed to set plan"))
      .finally(() => setMockLoading(false))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-2 text-muted-foreground">
              Choose the plan that fits your job search. All prices in EUR (€).
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-16">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                id={plan.id}
                className={`relative flex flex-col ${
                  plan.popular ? "border-primary shadow-lg ring-2 ring-primary/20" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€{plan.priceMonthly}</span>
                    <span className="text-muted-foreground">/month</span>
                    {plan.priceYearly != null && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        or €{plan.priceYearly}/year (save €{(plan.priceMonthly * 12) - plan.priceYearly})
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2 text-sm">
                        {f.included ? (
                          <Check className="h-5 w-5 shrink-0 text-emerald-500" />
                        ) : (
                          <X className="h-5 w-5 shrink-0 text-muted-foreground/50" />
                        )}
                        <span className={f.included ? "" : "text-muted-foreground"}>
                          {f.text}: {f.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={plan.ctaVariant}
                    size="lg"
                    asChild={plan.ctaHref !== "#"}
                  >
                    {plan.ctaHref === "#" ? (
                      <span>{plan.cta}</span>
                    ) : (
                      <Link href={plan.ctaHref}>{plan.cta}</Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature comparison table */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Feature comparison</h2>
            <div className="overflow-x-auto rounded-lg border -mx-2 sm:mx-0">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="p-4 font-semibold">Explorer (Free)</th>
                    <th className="p-4 font-semibold bg-primary/5">PathPilot Pro</th>
                    <th className="p-4 font-semibold">Career Accelerator</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b last:border-0">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-muted-foreground">{row.free}</td>
                      <td className="p-4 bg-primary/5">{row.pro}</td>
                      <td className="p-4">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mock set plan (demo) */}
          {isAuthenticated && (
            <section className="mb-12 rounded-lg border bg-muted/30 p-6">
              <h3 className="font-semibold mb-2">Demo: set your plan (no payment)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For testing. Your current plan: <strong>{currentPlan ?? "—"}</strong>
                <Button variant="ghost" size="sm" className="ml-2" onClick={loadPlan}>Refresh</Button>
              </p>
              {mockError && <p className="text-sm text-destructive mb-2">{mockError}</p>}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => mockSetPlan("free")} disabled={mockLoading}>
                  Set Free
                </Button>
                <Button variant="outline" size="sm" onClick={() => mockSetPlan("pro")} disabled={mockLoading}>
                  Set Pro
                </Button>
                <Button variant="outline" size="sm" onClick={() => mockSetPlan("premium")} disabled={mockLoading}>
                  Set Premium
                </Button>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="text-center">
            <p className="text-muted-foreground mb-4">
              No payment gateway in this demo. Use &quot;Mock set plan&quot; above when signed in to try Pro/Premium.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/job-finder">Start job search</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/sign-up">Create free account</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
