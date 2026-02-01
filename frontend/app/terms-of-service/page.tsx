import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using PathPilot's website, mobile applications, and services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Services.

We may modify these Terms at any time. Your continued use of the Services after any modifications indicates your acceptance of the updated Terms.`,
  },
  {
    title: "2. Eligibility",
    content: `To use our Services, you must:

- Be at least 16 years of age
- Have the legal capacity to enter into a binding agreement
- Not be prohibited from using the Services under applicable law
- Provide accurate and complete registration information

By using our Services, you represent and warrant that you meet all eligibility requirements.`,
  },
  {
    title: "3. Account Registration",
    content: `To access certain features of our Services, you must create an account. When creating an account, you agree to:

- Provide accurate, current, and complete information
- Maintain and promptly update your account information
- Keep your password secure and confidential
- Accept responsibility for all activities under your account
- Notify us immediately of any unauthorized use

We reserve the right to suspend or terminate accounts that violate these Terms.`,
  },
  {
    title: "4. User Content",
    content: `You may submit content to the Services, including resumes, profile information, job postings, and communications ("User Content"). By submitting User Content, you:

- Grant PathPilot a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your User Content in connection with the Services
- Represent that you own or have the necessary rights to submit the User Content
- Agree that your User Content does not violate any third party's rights

We do not claim ownership of your User Content, but we need certain rights to provide the Services.`,
  },
  {
    title: "5. Prohibited Conduct",
    content: `You agree not to:

- Use the Services for any illegal purpose
- Post false, misleading, or fraudulent content
- Harass, abuse, or harm other users
- Impersonate any person or entity
- Interfere with or disrupt the Services
- Attempt to gain unauthorized access to the Services
- Use automated means to access the Services without permission
- Collect user information without consent
- Post spam or unsolicited communications
- Violate any applicable laws or regulations`,
  },
  {
    title: "6. Job Seekers",
    content: `If you use the Services as a job seeker, you agree to:

- Provide accurate information about your qualifications, experience, and employment history
- Apply only for positions you are genuinely interested in and qualified for
- Not misrepresent your identity or credentials
- Respect employer confidentiality
- Follow up professionally with employers

PathPilot does not guarantee employment and is not responsible for hiring decisions made by employers.`,
  },
  {
    title: "7. Employers",
    content: `If you use the Services as an employer, you agree to:

- Post only legitimate job opportunities
- Provide accurate information about positions and your company
- Comply with all applicable employment and anti-discrimination laws
- Not use candidate information for purposes unrelated to hiring
- Respect candidate privacy and confidentiality
- Pay all applicable fees for Services used

PathPilot does not guarantee the quality or suitability of candidates.`,
  },
  {
    title: "8. Fees and Payment",
    content: `Certain Services may require payment of fees. If you purchase paid Services:

- You agree to pay all applicable fees and taxes
- Fees are non-refundable unless otherwise stated
- We may change fees with reasonable notice
- You authorize us to charge your payment method
- You are responsible for keeping payment information current

Failure to pay may result in suspension of Services.`,
  },
  {
    title: "9. Intellectual Property",
    content: `The Services and all content, features, and functionality are owned by PathPilot and are protected by copyright, trademark, and other intellectual property laws.

You may not:

- Copy, modify, or distribute our content without permission
- Use our trademarks without written consent
- Reverse engineer or decompile our software
- Remove any copyright or proprietary notices

We respect intellectual property rights and expect users to do the same.`,
  },
  {
    title: "10. Disclaimer of Warranties",
    content: `THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING:

- MERCHANTABILITY
- FITNESS FOR A PARTICULAR PURPOSE
- NON-INFRINGEMENT
- ACCURACY OR COMPLETENESS OF CONTENT

We do not warrant that the Services will be uninterrupted, error-free, or secure.`,
  },
  {
    title: "11. Limitation of Liability",
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, PATHPILOT SHALL NOT BE LIABLE FOR:

- INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES
- LOSS OF PROFITS, DATA, OR GOODWILL
- DAMAGES RESULTING FROM UNAUTHORIZED ACCESS
- ACTIONS OF THIRD PARTIES

Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "12. Indemnification",
    content: `You agree to indemnify, defend, and hold harmless PathPilot and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including attorneys' fees) arising from:

- Your use of the Services
- Your User Content
- Your violation of these Terms
- Your violation of any third party's rights`,
  },
  {
    title: "13. Termination",
    content: `We may terminate or suspend your access to the Services at any time, with or without cause, with or without notice. Upon termination:

- Your right to use the Services will immediately cease
- We may delete your account and User Content
- Provisions that should survive termination will remain in effect`,
  },
  {
    title: "14. Governing Law and Disputes",
    content: `These Terms are governed by the laws of the State of California, without regard to conflict of law principles.

Any disputes arising from these Terms or the Services shall be resolved through binding arbitration in San Francisco, California, in accordance with the rules of the American Arbitration Association.

You waive any right to participate in class action lawsuits or class-wide arbitration.`,
  },
  {
    title: "15. Contact Information",
    content: `If you have questions about these Terms, please contact us at:

PathPilot, Inc.
123 Market Street, Suite 400
San Francisco, CA 94105

Email: legal@pathpilot.com
Phone: +1 (555) 123-4567`,
  },
]

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
          <p className="mb-2 text-muted-foreground">
            Last Updated: January 1, 2026
          </p>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Please read these Terms of Service carefully before using PathPilot. These Terms govern
            your access to and use of our Services.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">{section.title}</h2>
                <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
