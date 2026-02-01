import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us, such as when you create an account, fill out a form, apply for a job, or communicate with us. This information may include:

- Name and contact information (email address, phone number, mailing address)
- Account credentials (username and password)
- Professional information (resume, work history, education, skills)
- Profile information (photo, bio, preferences)
- Payment information (when applicable)
- Communications and correspondence with us

We also automatically collect certain information when you use our platform, including:

- Device and browser information
- IP address and location data
- Usage data and browsing history on our platform
- Cookies and similar tracking technologies`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:

- Provide, maintain, and improve our services
- Process job applications and facilitate connections between job seekers and employers
- Personalize your experience and provide relevant job recommendations
- Send you technical notices, updates, and support messages
- Send promotional communications (with your consent)
- Monitor and analyze trends, usage, and activities
- Detect, investigate, and prevent fraudulent transactions and abuse
- Comply with legal obligations`,
  },
  {
    title: "3. Information Sharing",
    content: `We may share your information in the following circumstances:

- With employers when you apply for jobs or make your profile searchable
- With service providers who assist in our operations
- With analytics partners to understand platform usage
- In response to legal requests or to protect our rights
- In connection with a merger, acquisition, or sale of assets
- With your consent or at your direction

We do not sell your personal information to third parties for their marketing purposes.`,
  },
  {
    title: "4. Data Security",
    content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:

- Encryption of data in transit and at rest
- Regular security assessments and audits
- Access controls and authentication requirements
- Employee training on data protection

While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.`,
  },
  {
    title: "5. Your Rights and Choices",
    content: `Depending on your location, you may have certain rights regarding your personal information:

- Access: Request a copy of your personal information
- Correction: Request correction of inaccurate information
- Deletion: Request deletion of your personal information
- Portability: Request a portable copy of your data
- Opt-out: Opt out of certain data processing activities
- Withdraw consent: Withdraw previously given consent

To exercise these rights, please contact us at privacy@pathpilot.com.`,
  },
  {
    title: "6. Cookies and Tracking",
    content: `We use cookies and similar tracking technologies to collect information about your browsing activities. You can manage cookie preferences through your browser settings. Types of cookies we use:

- Essential cookies: Required for platform functionality
- Analytics cookies: Help us understand how you use our platform
- Preference cookies: Remember your settings and preferences
- Marketing cookies: Used to deliver relevant advertisements`,
  },
  {
    title: "7. Data Retention",
    content: `We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. When determining retention periods, we consider:

- The nature and sensitivity of the information
- The purposes for which we process the information
- Legal requirements and obligations
- Your account status and activity

You may request deletion of your account and associated data at any time.`,
  },
  {
    title: "8. International Data Transfers",
    content: `Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We implement appropriate safeguards for international transfers, including:

- Standard contractual clauses approved by regulatory authorities
- Certification under applicable frameworks
- Obtaining your explicit consent where required`,
  },
  {
    title: "9. Children's Privacy",
    content: `Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete that information promptly.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the "Last Updated" date. Your continued use of our services after any changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "11. Contact Us",
    content: `If you have any questions about this Privacy Policy or our data practices, please contact us at:

PathPilot, Inc.
123 Market Street, Suite 400
San Francisco, CA 94105

Email: privacy@pathpilot.com
Phone: +1 (555) 123-4567`,
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="mb-2 text-muted-foreground">
            Last Updated: January 1, 2026
          </p>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            This Privacy Policy describes how PathPilot, Inc. ("PathPilot," "we," "us," or "our")
            collects, uses, and shares information about you when you use our website, mobile
            applications, and other online products and services.
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
