import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/authContext";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/admin/dashboard" },
  { label: "Announcements", icon: "campaign", href: "/admin/announcements" },
  { label: "Registrations", icon: "how_to_reg", href: "/admin/registrations" },
  {
    label: "Financials",
    icon: "account_balance_wallet",
    href: "/admin/financials",
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutSuperAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    navigate("/", { replace: true });
    logoutSuperAdmin();
  };

  const handleNavClick = (href) => {
    setIsMenuOpen(false);
    navigate(href);
  };

  return (
    <>
      {/* ── DESKTOP SIDEBAR (md and up) ── */}
      <aside className="hidden md:flex w-64 bg-[#0A1614] flex-col h-full border-r border-[#C5C5C5]/15 flex-shrink-0">
        <div className="p-6 flex items-center justify-center">
          <img
            src="/assets/logo.png"
            alt="CapBYFU Logo"
            className="h-12 object-contain"
          />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#C5C5C5] text-[#0A1614]"
                    : "text-[#C5C5C5]/60 hover:bg-[#C5C5C5]/10 hover:text-[#F1F1F1]"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#C5C5C5]/15">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#C5C5C5]/10 transition-colors cursor-pointer w-full"
          >
            <div className="size-8 rounded-full bg-[#C5C5C5]/15 flex items-center justify-center text-[#C5C5C5]">
              <span className="material-symbols-outlined text-[18px]">
                shield_person
              </span>
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-xs font-bold text-[#F1F1F1]">CAPBYFU Admin</p>
              <p className="text-[10px] text-[#C5C5C5]/60">
                System Administrator
              </p>
            </div>
            <span className="material-symbols-outlined text-[#C5C5C5]/50 text-[18px]">
              logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOP NAVBAR (below md) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <header className="bg-[#0A1614] border-b border-[#C5C5C5]/15 flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/assets/logo.png"
              alt="CapBYFU Logo"
              className="h-8 object-contain"
            />
          </div>

          {/* Burger button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-[#C5C5C5] hover:text-[#F1F1F1] transition-colors"
            aria-label="Toggle menu"
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
        </header>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0A1614] border-b border-[#C5C5C5]/15 overflow-hidden"
            >
              <nav className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-left ${
                        isActive
                          ? "bg-[#C5C5C5] text-[#0A1614]"
                          : "text-[#C5C5C5]/60 hover:bg-[#C5C5C5]/10 hover:text-[#F1F1F1]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User / logout row */}
              <div className="px-4 pb-4 pt-1 border-t border-[#C5C5C5]/15 mt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[#C5C5C5]/10 transition-colors"
                >
                  <div className="size-7 rounded-full bg-[#C5C5C5]/15 flex items-center justify-center text-[#C5C5C5]">
                    <span className="material-symbols-outlined text-[16px]">
                      shield_person
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-[#F1F1F1]">
                      CAPBYFU Admin
                    </p>
                    <p className="text-[10px] text-[#C5C5C5]/60">
                      System Administrator
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#C5C5C5]/50 text-[18px]">
                    logout
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminSidebar;
