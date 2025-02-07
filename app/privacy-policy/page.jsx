export default function PrivacyPolicyPage() {
  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-8'>Privacy Policy</h1>

      <div className='space-y-6'>
        <section>
          <h2 className='text-2xl font-semibold mb-4'>1. Introduction</h2>
          <p className='text-gray-700 leading-relaxed'>
            Welcome to TravelMonk. We respect your privacy and are committed to
            protecting your personal data. This privacy policy explains how we
            collect, use, and safeguard your information when you use our mobile
            application.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            2. Information We Collect
          </h2>
          <ul className='list-disc pl-6 space-y-2 text-gray-700'>
            <li>Device information (device token for notifications)</li>
            <li>Location data (when you use location-based features)</li>
            <li>Usage data (how you interact with the app)</li>
            <li>User preferences (saved places, country preferences)</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            3. How We Use Your Information
          </h2>
          <ul className='list-disc pl-6 space-y-2 text-gray-700'>
            <li>To provide location-based services and recommendations</li>
            <li>To send you relevant notifications about events and places</li>
            <li>To improve our services and user experience</li>
            <li>To personalize content based on your preferences</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            4. Data Storage and Security
          </h2>
          <p className='text-gray-700 leading-relaxed'>
            We use Supabase for data storage, which employs industry-standard
            security measures. Your data is stored securely and protected
            against unauthorized access. We use Firebase Cloud Messaging for
            notifications, which follows Google&apos;s security standards.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>5. Your Rights</h2>
          <ul className='list-disc pl-6 space-y-2 text-gray-700'>
            <li>Access your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of notifications</li>
            <li>Change your country preferences</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>6. Notifications</h2>
          <p className='text-gray-700 leading-relaxed'>
            We send push notifications to keep you informed about:
          </p>
          <ul className='list-disc pl-6 space-y-2 text-gray-700 mt-2'>
            <li>New events in your selected city/country</li>
            <li>Updates about places you&apos;ve saved</li>
            <li>Important app updates and features</li>
            <li>Promotional content (which you can opt out of)</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>7. Data Retention</h2>
          <p className='text-gray-700 leading-relaxed'>
            We retain your data for as long as necessary to provide our
            services. You can request deletion of your data at any time through
            the app settings.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            8. Third-Party Services
          </h2>
          <p className='text-gray-700 leading-relaxed'>
            We use the following third-party services:
          </p>
          <ul className='list-disc pl-6 space-y-2 text-gray-700 mt-2'>
            <li>Supabase - For data storage and authentication</li>
            <li>Firebase Cloud Messaging - For push notifications</li>
            <li>Google Maps - For location services</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>9. Contact Us</h2>
          <p className='text-gray-700 leading-relaxed'>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <ul className='list-none pl-6 space-y-2 text-gray-700 mt-2'>
            <li>Email: privacy@travelmonk.com</li>
            <li>Address: [Your Company Address]</li>
          </ul>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            10. Updates to This Policy
          </h2>
          <p className='text-gray-700 leading-relaxed'>
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new policy on this page and
            updating the &quot;Last Updated&quot; date.
          </p>
          <p className='text-gray-500 mt-4'>
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </section>
      </div>
    </div>
  );
}
