// app/privacy/page.tsx
import { Metadata } from "next";
import Link from "next/link"; // Keep Link import for potential internal links

export const metadata: Metadata = {
  title: "Privacy Policy | SC Worker's Compensation App",
  description: "Privacy Policy for the SC Worker's Compensation Calculator App.",
};

export default function PrivacyPolicyPage() {
  return (
    // Use theme background and standard page padding
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-10 md:mb-12">
          Privacy Policy
        </h1>

        {/* Apply prose styles for automatic content formatting */}
        {/* Adjust max-width (e.g., max-w-4xl) and centering (mx-auto) as needed */}
        {/* prose-lg provides slightly larger text, dark:prose-invert handles dark mode */}
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          {/* Embed the Privacy Policy Content Here */}
          {/* Remember to replace placeholders like [Date Policy Last Updated] */}

          <p><strong>Effective Date:</strong> [Date Policy Last Updated]</p>

          <h2>1. Introduction</h2>
          <p>Welcome to the SC Worker&apos;s Compensation App (the &quot;Service&quot;, &quot;App&quot;, &quot;Platform&quot;), operated by [Your Company Name/Your Name] (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
          <p>Please read this policy carefully. By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not access the Service.</p>

          <h2>2. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect via the Service includes:</p>

          <h3>a) Personal Data You Provide to Us:</h3>
          <ul>
            <li><strong>Account Information:</strong> When you register for an account, we may collect your name, email address, password, professional role (e.g., attorney, adjuster), and potentially firm/company name.</li>
            <li><strong>Subscription &amp; Payment Information:</strong> When you subscribe to a paid plan, we collect information necessary to process your payment, such as billing address. However, actual payment card details are typically processed directly by our third-party payment processor (e.g., Stripe), and we generally do not store full payment card numbers.</li>
            <li><strong>User Input Data (Claimant/Case Information):</strong> You may input information related to workers&apos; compensation claims for the purpose of using our calculators or organizational features. This could include claimant names, dates of injury, wage information, medical details (if you choose to enter them), case notes, and other claim-related data. <strong>You are responsible for ensuring you have the necessary rights and consents to input any third-party information (like claimant data, which may include PHI) into the Service.</strong></li>
            <li><strong>Communications:</strong> If you contact us directly (e.g., for support), we may collect your name, email address, and the contents of your message.</li>
            <li><strong>Training Progress:</strong> We collect information about your progress through any training modules, courses, quizzes, or exams offered on the platform.</li>
            <li><strong>Notepad/Notes:</strong> Content you enter into general notepad features or notes associated with specific worker files.</li>
            <li><strong>Data Minimization:</strong> <em>We strive to collect only the minimum information necessary through our required fields to provide the requested calculations and features. Any additional information you input (such as detailed case notes or specific claimant identifiers beyond what is needed for a calculation) is done at your discretion and under your control.</em></li>
          </ul>

          <h3>b) Data Collected Automatically:</h3>
            <ul>
                <li><strong>Usage Data:</strong> We may automatically collect information about how you access and use the Service, such as your IP address, browser type, operating system, device information, pages viewed, time spent on pages, links clicked, and the dates/times of your visits.</li>
                <li><strong>Cookies and Tracking Technologies:</strong> We may use cookies, web beacons, and similar tracking technologies to collect information about your interaction with the Service, personalize your experience, and analyze usage patterns. You can control cookie preferences through your browser settings.</li>
            </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes directly related to providing and improving the Service, including:</p>
          <ul>
            <li>To provide, operate, maintain, and improve the Service.</li>
            <li>To process your registration, manage your account, and process subscriptions and payments.</li>
            <li>To perform calculations and generate reports as requested by you based on the data you input.</li>
            <li>To store and organize information (like worker data and notes) inputted and managed by you.</li>
            <li>To track and display your progress in training modules.</li>
            <li>To respond to your comments, questions, and support requests.</li>
            <li>To send you technical notices, updates, security alerts, and administrative messages related to your account and the Service.</li>
            <li>To send newsletters or marketing communications regarding the Service itself (where permitted and with clear opt-out options).</li>
            <li>To monitor and analyze trends, usage, and activities to improve the Service&apos;s functionality and user experience.</li>
            <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities and protect the rights and property of [Your Company Name/Your Name] and others.</li>
            <li>To comply with legal and regulatory requirements.</li>
          </ul>
          <p><em>We use the information collected solely for the purposes described in this policy. We do not sell your personal information or the specific claimant/case data you input into the Service.</em></p>

          <h2>4. How We Share Your Information</h2>
          <p>We do not sell your personal information. Access to inputted claimant/case data is restricted based on user accounts and our security measures (including Supabase Row Level Security). <em>We will not share the specific claimant or case data you input into the calculators or organizational features with any third party, except for the essential service providers required solely to operate the platform infrastructure (like database hosting with Supabase) as outlined below, or as strictly required by law.</em></p>
          <p>We may share other information we collect (like account or usage data) only in the following limited circumstances:</p>
          <ul>
            <li><strong>With Service Providers:</strong> We may share necessary information with third-party vendors, consultants, and other service providers who perform services on our behalf and need access to such information to do that work (e.g., payment processing via Stripe, database hosting and authentication via Supabase, cloud hosting via Vercel/AWS/etc., email delivery services for transactional emails, analytics providers for usage analysis). These providers are contractually obligated to protect your information and use it only for the services they provide to us.</li>
            <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in the good faith belief that such action is necessary to comply with a valid legal obligation (like a subpoena or court order), protect and defend our rights or property, prevent or investigate possible wrongdoing in connection with the Service, protect the personal safety of users of the Service or the public, or protect against legal liability.</li>
            <li><strong>Business Transfers:</strong> In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company, your information may be transferred as part of that transaction, subject to standard confidentiality agreements.</li>
            <li><strong>With Your Consent:</strong> We may share your information for other purposes not listed here only with your explicit consent.</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>We implement reasonable administrative, technical, and physical security measures designed to protect your information from unauthorized access, use, alteration, and disclosure. We utilize services like Supabase which provide features like Row Level Security to help segregate user data based on authenticated user access. However, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee the absolute security of your information transmitted to or stored on the Service. You are also responsible for maintaining the security of your account credentials.</p>

          <h2>6. Data Retention</h2>
          <p>We retain the information we collect for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law (e.g., for tax, accounting, or other legal requirements). We will retain your account information for as long as your account is active or as needed to provide you services. Information you input (like claimant data or notes) is generally retained under your control until you choose to delete it or delete your account, subject to our data backup cycles and any overriding legal obligations.</p>

          <h2>7. Your Rights and Choices</h2>
          <p>Depending on your location and applicable laws, you may have certain rights regarding your personal information, such as:</p>
          <ul>
            <li><strong>Access:</strong> The right to request access to the personal information we hold about you.</li>
            <li><strong>Correction:</strong> The right to request correction of inaccurate personal information.</li>
            <li><strong>Deletion:</strong> The right to request deletion of your personal information, subject to certain exceptions (e.g., legal retention requirements, active subscription data).</li>
            <li><strong>Opt-Out:</strong> The right to opt-out of non-essential marketing communications.</li>
          </ul>
          <p>To exercise these rights, please contact us using the contact information below. We will respond to your request in accordance with applicable law. You can typically manage your account information and subscription details through your account settings page.</p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>Our Service is not directed to individuals under the age of 13 (or a higher age threshold where applicable by law), and we do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without verification of parental consent, we will take steps to remove that information.</p>

          <h2>9. Cookies and Tracking Technologies</h2>
          <p>[Explain your use of cookies - e.g., <strong>Essential/Strictly Necessary:</strong> cookies for login sessions, security, account management. <strong>Performance/Analytics:</strong> cookies if using tools like Vercel Analytics, Google Analytics (anonymized data preferred). <strong>Functionality:</strong> cookies for remembering user preferences (like dark mode). Provide information on how users can manage cookie preferences, possibly via a cookie consent banner/tool or browser settings. Be specific about any analytics tools used.]</p>

          <h2>10. Third-Party Links</h2>
          <p>Our Service may contain links to other websites not operated or controlled by us (e.g., links to SC WCC website). This Privacy Policy does not apply to third-party websites. We encourage you to review the privacy policies of any third-party websites you visit.</p>

          <h2>11. International Data Transfers</h2>
          <p>Your information may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the privacy laws may not be as protective as those in your jurisdiction. If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including Personal Data, to the United States and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>

          <h2>12. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices or relevant regulations. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Effective Date&quot; at the top. We may also notify you through the Service or via email. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

          <h2>13. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <ul>
            <li>By email: [Your Support Email Address]</li>
            <li>By visiting this page on our website: [Link to your Contact Page, if applicable]</li>
            <li>By mail: [Your Company Address, if applicable]</li>
          </ul>

        </article>
      </div>
    </div>
  );
}
