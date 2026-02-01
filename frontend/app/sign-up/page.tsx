"use client"

import React, { Suspense, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Compass, Mail, Lock, User, Building2, ArrowRight, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api"

const benefits = [
  "Access to 10M+ job opportunities",
  "AI-powered job matching",
  "Free resume builder",
  "Career insights and guidance",
]

function SignUpContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"
  const { register } = useAuth()
  const [accountType, setAccountType] = useState<"jobseeker" | "employer">("jobseeker")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (accountType !== "jobseeker") {
      setError("Only job seeker accounts are available for now. Employer sign-up coming soon.")
      return
    }
    setError(null)
    setLoading(true)
    try {
      await register(formData.name, formData.email, formData.password)
      window.location.href = next
    } catch (err) {
      let message = "Sign up failed"
      if (err instanceof ApiError) {
        const d = err.detail
        if (typeof d === "string") message = d
        else if (Array.isArray(d) && d.length > 0) {
          const first = d[0] as { msg?: string; loc?: unknown[] }
          message = first.msg || message
        } else if (d && typeof d === "object" && "message" in d) message = String((d as { message: string }).message)
        else message = err.message || message
      } else if (err instanceof Error) {
        message = err.message
        if (err.message === "Failed to fetch" || err.message.includes("fetch")) {
          message = "Cannot reach the backend. Is it running at http://localhost:8000?"
        }
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh]">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Compass className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">PathPilot</span>
          </Link>

          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>

          {/* Account Type Selector */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAccountType("jobseeker")}
              className={`flex flex-col items-center rounded-lg border p-4 transition-all ${
                accountType === "jobseeker"
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/50"
              }`}
            >
              <User className={`mb-2 h-6 w-6 ${accountType === "jobseeker" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${accountType === "jobseeker" ? "text-primary" : ""}`}>
                Job Seeker
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("employer")}
              className={`flex flex-col items-center rounded-lg border p-4 transition-all ${
                accountType === "employer"
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/50"
              }`}
            >
              <Building2 className={`mb-2 h-6 w-6 ${accountType === "employer" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${accountType === "employer" ? "text-primary" : ""}`}>
                Employer
              </span>
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {accountType === "employer" ? "Company Name" : "Full Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={accountType === "employer" ? "Acme Inc." : "John Doe"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                At least 8 characters recommended
              </p>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, agreeToTerms: checked as boolean })
                }
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link href="/terms-of-service" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !formData.email.trim() || !formData.password}
            >
              {loading ? "Creating account…" : "Create Account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t" />
            <span className="px-4 text-sm text-muted-foreground">Or continue with</span>
            <div className="flex-1 border-t" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="bg-transparent">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="bg-transparent">
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="relative hidden flex-1 lg:block">
        <Image
          src="/images/about-hero.jpg"
          alt="Join PathPilot"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <h2 className="mb-6 text-3xl font-bold text-background">
            Your career journey starts here
          </h2>
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-background/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20">
                  <Check className="h-4 w-4" />
                </div>
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignUpContent />
    </Suspense>
  )
}
