import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: "HOME", href: "/#home" },
    { label: "ABOUT", href: "/#about" },
    { label: "GOALS", href: "/#goals" },
    { label: "ANNOUNCEMENTS", href: "/announcements" },
  ];

  const handleNavClick = (href) => {
    setIsMenuOpen(false);
    if (href.startsWith("/#")) {
      navigate("/");
      setTimeout(() => {
        const id = href.replace("/#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      navigate(href);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A1614] border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="assets/logo.png"
            alt="CapBYFU Logo"
            className="h-32 w-32 object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-bold uppercase tracking-wider hover:text-[#C5C5C5] transition-colors text-[#F1F1F1]"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate("/register")}
            className="bg-[#C5C5C5] hover:bg-[#F1F1F1] text-[#010101] px-7 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg"
          >
            Register Now
          </button>
        </div>

        <button
          className="md:hidden text-[#F1F1F1] p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0A1614] border-t border-white/10"
          >
            <nav className="flex flex-col px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-bold uppercase tracking-wider text-[#F1F1F1] hover:text-[#C5C5C5] transition-colors text-left"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  navigate("/register");
                  setIsMenuOpen(false);
                }}
                className="bg-[#C5C5C5] hover:bg-[#F1F1F1] text-[#010101] px-7 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg w-full"
              >
                Register Now
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
