import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TERMS_CONTENT = [
  {
    heading: "1. Acceptance of Terms",
    body: "By accessing or using the CapBYFU website and registration portal, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.",
  },
  {
    heading: "2. Use of the Portal",
    body: "The CapBYFU registration portal is intended solely for authorized church administrators and delegates of the Capiz Baptist Youth Fellowship Union. Unauthorized access, misuse, or any attempt to manipulate the system is strictly prohibited and may result in legal action.",
  },
  {
    heading: "3. Accuracy of Information",
    body: "You agree to provide accurate, current, and complete information when registering delegates. CapBYFU reserves the right to reject or remove any registration that contains false or misleading information.",
  },
  {
    heading: "4. Data Responsibility",
    body: "Church administrators are responsible for the accuracy of all delegate data they submit. By submitting a registration, you confirm that you have obtained proper consent from the delegate (or their guardian, if a minor) to submit their personal information.",
  },
  {
    heading: "5. Payments",
    body: "Registration fees, once submitted, are subject to the policies of the local church and CapBYFU central office. Proof of payment must be accurate and unaltered. Submitting fraudulent payment proofs is grounds for immediate removal and potential reporting to authorities.",
  },
  {
    heading: "6. Intellectual Property",
    body: "All content on this website — including logos, text, and design — is the property of CapBYFU. You may not reproduce, distribute, or use any content without prior written permission.",
  },
  {
    heading: "7. Limitation of Liability",
    body: "CapBYFU is not liable for any indirect, incidental, or consequential damages arising from your use of this portal. We make no guarantees regarding uninterrupted access or error-free operation.",
  },
  {
    heading: "8. Changes to Terms",
    body: "We reserve the right to modify these Terms and Conditions at any time. Continued use of the portal following any changes constitutes your acceptance of the new terms.",
  },
  {
    heading: "9. Contact",
    body: "For any concerns regarding these terms, please contact the CapBYFU central office or the designated Union Secretary.",
  },
];

const PRIVACY_CONTENT = [
  {
    heading: "1. Information We Collect",
    body: "We collect personal information submitted through the registration portal, including full names, ages, contact numbers, guardian details, and payment information. We also collect uploaded files such as proof of payment and parental consent forms.",
  },
  {
    heading: "2. How We Use Your Information",
    body: "The information collected is used exclusively for organizing and managing CapBYFU events and camps, verifying delegate eligibility, processing registrations, and communicating important updates related to the event.",
  },
  {
    heading: "3. Data Storage",
    body: "All data is securely stored using Supabase, a trusted cloud database provider. Files are stored in private, access-controlled storage buckets. We implement industry-standard security practices to protect your information.",
  },
  {
    heading: "4. Data Sharing",
    body: "We do not sell, trade, or rent your personal information to third parties. Data may only be accessed by authorized CapBYFU administrators and church leaders directly involved in event coordination.",
  },
  {
    heading: "5. Minors",
    body: "We take the privacy of minors seriously. For delegates under 18 years of age, a signed parental consent form is required. Parents or guardians may request the deletion of their child's data by contacting us directly.",
  },
  {
    heading: "6. Uploaded Files",
    body: "Payment proofs and consent forms are stored in private buckets and are only accessible to authorized administrators. These files are used solely for verification purposes and are not shared publicly.",
  },
  {
    heading: "7. Cookies",
    body: "This website may use session-based storage to maintain your login state. No third-party tracking cookies are used. We do not display advertisements.",
  },
  {
    heading: "8. Your Rights",
    body: "You have the right to request access to, correction of, or deletion of your personal data. To exercise these rights, please contact the CapBYFU Union Secretary or central office.",
  },
  {
    heading: "9. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Any changes will be reflected on this page. Continued use of the portal after changes are posted constitutes your acceptance.",
  },
];

const LegalModal = ({ type, onClose }) => {
  const isTerms = type === "terms";
  const title = isTerms ? "Terms of Service" : "Privacy Policy";
  const sections = isTerms ? TERMS_CONTENT : PRIVACY_CONTENT;
  const icon = isTerms ? (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  ) : (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010101]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#C5C5C5]/10 flex-shrink-0">
          <div className="flex items-center gap-3 text-[#F1F1F1]">
            <div className="p-2 bg-[#C5C5C5]/10 rounded-lg text-[#C5C5C5]">
              {icon}
            </div>
            <div>
              <h2 className="font-black text-lg leading-none">{title}</h2>
              <p className="text-[#C5C5C5]/40 text-xs mt-0.5">
                CapBYFU — Capiz Baptist Youth Fellowship Union
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="overflow-y-auto flex-1 px-7 py-6 space-y-6
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-[#0A1614]
          [&::-webkit-scrollbar-thumb]:bg-[#0A1614]
          [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          <p className="text-[#C5C5C5]/50 text-xs uppercase tracking-widest font-bold border-b border-[#C5C5C5]/10 pb-4">
            Last updated: January 2025
          </p>
          {sections.map((s, i) => (
            <div key={i} className="space-y-2">
              <h3 className="text-[#F1F1F1] font-bold text-sm">{s.heading}</h3>
              <p className="text-[#C5C5C5]/60 text-sm leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-[#C5C5C5]/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-[#C5C5C5]/15 rounded-xl text-[#C5C5C5] font-bold text-sm hover:bg-[#C5C5C5]/5 transition-colors tracking-wide"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Footer = () => {
  const [modal, setModal] = useState(null); // 'terms' | 'privacy' | null

  return (
    <footer className="bg-[#010101] text-[#C5C5C5] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex flex-col items-start gap-2 mb-6">
              <img
                src="assets/logo.png"
                alt="CapBYFU Logo"
                className="h-32 w-32 object-contain"
              />
              <p className="text-sm leading-relaxed max-w-sm">
                Empowering the Baptist youth of Capiz through Christ-centered
                fellowship and transformational leadership development.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#F1F1F1] font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  className="hover:text-[#F1F1F1] transition-colors"
                  href="#home"
                >
                  HOME
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F1F1F1] transition-colors"
                  href="#about"
                >
                  ABOUT
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F1F1F1] transition-colors"
                  href="#goals"
                >
                  GOALS
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F1F1F1] transition-colors"
                  href="#announcements"
                >
                  ANNOUNCEMENTS
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[#F1F1F1] font-bold mb-6">Connect</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  className="hover:text-[#F1F1F1] transition-colors"
                  href="https://web.facebook.com/capbyfu.page"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F1F1F1] transition-colors"
                  href="https://www.instagram.com/capbyfupage/"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F1F1F1] transition-colors"
                  href="https://www.youtube.com/@CAPBYFUPAGE"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[#F1F1F1] transition-colors"
                  href="https://www.threads.com/@capbyfupage?xmt=AQF0XhnOqBN-rFQP2hSpttHOPJVunVjrX8XW3zkXq6krfpc"
                >
                  Threads
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#0A1614] flex flex-col md:flex-row items-center justify-between gap-4 text-xs uppercase tracking-widest font-bold">
          <p>© 2026 CapBYFU. All Rights Reserved.</p>
          <div className="flex gap-8">
            <button
              onClick={() => setModal("privacy")}
              className="hover:text-[#F1F1F1] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setModal("terms")}
              className="hover:text-[#F1F1F1] transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal && <LegalModal type={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
