import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import toast from "react-hot-toast";
import DOMPurify from "dompurify";
import { supabase } from "../lib/supabase";
import PixelTransition from "../components/imageanimation/pixelimageTransition";
import SpotlightCard from "../components/cardAnimation/spotlightCard";
import { Lens } from "../components/lens/lens";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CalendarModal = ({ events, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventDates = events.reduce((acc, e) => {
    if (e.event_date) {
      const d = new Date(e.event_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        acc[d.getDate()] = acc[d.getDate()] || [];
        acc[d.getDate()].push(e);
      }
    }
    return acc;
  }, {});

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010101]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0A1614] border border-[#C5C5C5]/20 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-[#C5C5C5]/10 rounded-lg text-[#C5C5C5]"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h3 className="font-black text-[#F1F1F1] text-lg">
            {MONTHS[month]} {year}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-[#C5C5C5]/10 rounded-lg text-[#C5C5C5]"
          >
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold text-[#C5C5C5]/40 py-1 uppercase"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            const hasEvent = day && eventDates[day];
            const today = new Date();
            const isToday =
              day &&
              today.getDate() === day &&
              today.getMonth() === month &&
              today.getFullYear() === year;
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-bold relative
                  ${!day ? "" : isToday ? "bg-[#0A1614] text-[#F1F1F1]" : hasEvent ? "bg-[#C5C5C5]/10 text-[#F1F1F1] border border-[#C5C5C5]/30" : "text-[#C5C5C5]/60 hover:bg-[#C5C5C5]/5 cursor-default"}
                `}
                title={hasEvent ? hasEvent.map((e) => e.title).join(", ") : ""}
              >
                {day}
                {hasEvent && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-[#C5C5C5]/60"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-2">
          {Object.entries(eventDates).length === 0 ? (
            <p className="text-[#C5C5C5]/40 text-sm text-center py-2">
              No events this month
            </p>
          ) : (
            Object.entries(eventDates)
              .sort((a, b) => a[0] - b[0])
              .map(([day, evts]) =>
                evts.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#C5C5C5]/5"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-[#C5C5C5]/10 rounded-lg flex flex-col items-center justify-center text-[#C5C5C5]">
                      <span className="text-xs font-bold uppercase">
                        {MONTHS[month].slice(0, 3)}
                      </span>
                      <span className="text-base font-black leading-none">
                        {day}
                      </span>
                    </div>
                    <div>
                      <p className="text-[#F1F1F1] font-bold text-sm">
                        {evt.title}
                      </p>
                      <p className="text-[#C5C5C5]/40 text-xs">
                        {evt.event_location || "TBA"}
                      </p>
                    </div>
                  </div>
                )),
              )
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 border border-[#C5C5C5]/10 rounded-xl text-[#C5C5C5] font-bold hover:bg-[#C5C5C5]/5 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

const CATEGORY_COLORS = {
  Event: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  News: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Blog: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  Announcement: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

const AnnouncementModal = ({ ann, onClose }) => {
  if (!ann) return null;
  const categoryColor =
    CATEGORY_COLORS[ann.category] ||
    "bg-[#C5C5C5]/15 text-[#F1F1F1] border-[#C5C5C5]/30";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010101]/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Banner image */}
        {ann.image_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl flex-shrink-0">
            <img
              src={ann.image_url}
              alt={ann.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1614]/80 via-transparent to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-[#010101]/60 hover:bg-[#010101]/90 text-[#F1F1F1] rounded-full p-2 transition-colors backdrop-blur-sm"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="p-7">
          {/* Close when no image */}
          {!ann.image_url && (
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="text-[#C5C5C5]/40 hover:text-[#F1F1F1] transition-colors p-1"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Category */}
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border mb-4 ${categoryColor}`}
          >
            {ann.category}
          </span>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-black text-[#F1F1F1] leading-tight mb-4">
            {ann.title}
          </h2>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#C5C5C5]/50 font-bold uppercase tracking-widest mb-6 pb-6 border-b border-[#C5C5C5]/10">
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5"
                />
              </svg>
              {new Date(ann.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                />
              </svg>
              By Admin
            </span>
            {ann.event_date && (
              <span className="flex items-center gap-1.5 text-[#C5C5C5]/70">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Event:{" "}
                {new Date(ann.event_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {ann.event_location && (
              <span className="flex items-center gap-1.5 text-[#C5C5C5]/70">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                {ann.event_location}
              </span>
            )}
          </div>

          {/* Excerpt (styled as a pull quote) */}
          {ann.excerpt && (
            <p className="text-[#C5C5C5]/80 text-base leading-relaxed mb-6 italic border-l-2 border-[#C5C5C5]/25 pl-4 whitespace-pre-wrap">
              {ann.excerpt}
            </p>
          )}

          {/* Full content */}
          {ann.content ? (
            <div
              className="text-[#C5C5C5]/70 text-sm leading-relaxed whitespace-pre-wrap
                [&_b]:font-bold [&_strong]:font-bold
                [&_i]:italic [&_em]:italic
                [&_u]:underline
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                [&_li]:text-[#C5C5C5]/70
                [&_p]:mb-4 [&_div]:mb-4"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ann.content) }}
            />
          ) : (
            <p className="text-[#C5C5C5]/30 text-sm italic">
              No additional details provided.
            </p>
          )}

          <button
            onClick={onClose}
            className="mt-8 w-full py-3 border border-[#C5C5C5]/15 rounded-xl text-[#C5C5C5] font-bold hover:bg-[#C5C5C5]/5 transition-colors text-sm tracking-wide"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Three-dots menu for each card
const CardMenu = ({ ann, onOpen }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const copyLink = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?id=${ann.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied!");
    });
    setOpen(false);
  };

  const openAnn = (e) => {
    e.stopPropagation();
    onOpen(ann);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="p-1.5 rounded-full hover:bg-[#C5C5C5]/15 text-[#C5C5C5]/60 hover:text-[#F1F1F1] transition-colors"
        title="More options"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-8 z-30 bg-[#0D1F1C] border border-[#C5C5C5]/15 rounded-xl shadow-2xl py-1.5 w-44 overflow-hidden"
          >
            <button
              onClick={openAnn}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#C5C5C5] hover:bg-[#C5C5C5]/10 hover:text-[#F1F1F1] transition-colors text-left"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Open Post
            </button>
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#C5C5C5] hover:bg-[#C5C5C5]/10 hover:text-[#F1F1F1] transition-colors text-left"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState(null);
  const PAGE_SIZE = 6;

  // Deep-link: open modal if ?id= is in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id) return;
    supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) setSelectedAnn(data);
      });
  }, [location.search]);

  // Clear ?id= from URL when modal closes
  const handleCloseModal = () => {
    setSelectedAnn(null);
    const params = new URLSearchParams(location.search);
    if (params.has("id")) {
      params.delete("id");
      const newSearch = params.toString();
      navigate(location.pathname + (newSearch ? `?${newSearch}` : ""), { replace: true });
    }
  };

  useEffect(() => {
    fetchAnnouncements(0, true);
    fetchUpcomingEvents();
  }, [activeFilter]);

  const fetchAnnouncements = async (pageNum, reset = false) => {
    setLoading(true);
    let query = supabase
      .from("announcements")
      .select("id, title, category, image_url, created_at, excerpt, content")
      .order("created_at", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (activeFilter !== "All") {
      query = query.eq("category", activeFilter);
    }

    const { data } = await query;
    const newItems = data || [];
    if (reset) {
      setAnnouncements(newItems);
    } else {
      setAnnouncements((prev) => [...prev, ...newItems]);
    }
    setHasMore(newItems.length === PAGE_SIZE);
    setPage(pageNum);
    setLoading(false);
  };

  const fetchUpcomingEvents = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("id, title, event_date, event_location")
      .eq("category", "Event")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(5);
    setEvents(data || []);
  };

  const filters = ["All", "News", "Blog", "Event", "Announcement"];

  return (
    <div className="min-h-screen bg-[#010101]">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-xl mx-4 md:mx-10 lg:mx-16 my-8 min-h-[180px] md:aspect-[21/6] flex items-center justify-center text-center px-6 py-10 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1614]/90 to-[#C5C5C5]/10 z-10"></div>
        <div className="absolute inset-0 bg-[#0A1614]"></div>
        <div className="relative z-20 max-w-2xl">
          <h1 className="text-[#F1F1F1] text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black mb-3 tracking-tight leading-tight">
            Stay Connected with CapBYFU
          </h1>
          <p className="text-[#C5C5C5] text-sm md:text-base lg:text-lg mb-0 md:mb-4">
            Get the latest updates, news, events, and announcements from our
            community.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-8 border-b border-[#C5C5C5]/10 pb-4 overflow-x-auto">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-sm font-bold pb-2 whitespace-nowrap transition-colors border-b-2 ${
                    activeFilter === f
                      ? "text-[#C5C5C5] border-[#C5C5C5]/40"
                      : "text-[#C5C5C5]/40 hover:text-[#F1F1F1] border-transparent"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading && announcements.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-[#0A1614] rounded-xl overflow-hidden border border-[#C5C5C5]/10 animate-pulse"
                  >
                    <div className="aspect-video bg-[#0A1614]"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-[#0A1614] rounded w-1/4"></div>
                      <div className="h-5 bg-[#0A1614] rounded w-3/4"></div>
                      <div className="h-3 bg-[#0A1614] rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#C5C5C5]/40">
                <svg
                  className="w-16 h-16 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
                  />
                </svg>
                <p className="font-bold text-lg text-[#F1F1F1]">
                  No posts found
                </p>
                <p className="text-sm">Check back later.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {announcements.map((ann, i) => (
                    <motion.div
                      key={ann.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedAnn(ann)}
                      className="group cursor-pointer bg-[#0A1614] rounded-xl overflow-hidden border border-[#C5C5C5]/10 transition-all hover:shadow-xl hover:border-[#C5C5C5]/25"
                    >
                      <div className="aspect-video relative overflow-hidden bg-[#0A1614]">
                        {/* Three-dots menu */}
                        <div className="absolute top-3 right-3 z-10">
                          <CardMenu ann={ann} onOpen={setSelectedAnn} />
                        </div>
                        {ann.image_url ? (
                          <img
                            alt={ann.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            src={ann.image_url}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#C5C5C5]/50">
                            <svg
                              className="w-12 h-12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
                              />
                            </svg>
                          </div>
                        )}
                        <span className="absolute top-4 left-4 bg-[#C5C5C5]/15 border border-[#C5C5C5]/30 text-[#F1F1F1] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {ann.category}
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-[#C5C5C5]/40 mb-3 uppercase tracking-widest font-bold">
                          <span>
                            {new Date(ann.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span>•</span>
                          <span>By Admin</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-[#F1F1F1] group-hover:text-[#C5C5C5] transition-colors line-clamp-2">
                          {ann.title}
                        </h3>
                        {ann.excerpt && (
                          <p className="text-sm text-[#C5C5C5]/60 line-clamp-2 mb-3 whitespace-pre-wrap">
                            {ann.excerpt}
                          </p>
                        )}
                        <div
                          className="flex items-center gap-2 text-[#C5C5C5] font-bold text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnn(ann);
                          }}
                        >
                          Read More
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={() => fetchAnnouncements(page + 1)}
                      disabled={loading}
                      className="bg-[#0A1614] text-[#F1F1F1] px-8 py-3 rounded-lg font-bold hover:bg-[#C5C5C5]/15 transition-colors uppercase text-sm tracking-wide disabled:opacity-50"
                    >
                      {loading ? "Loading..." : "Load More Posts"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* Upcoming Events */}
            <div className="bg-[#0A1614] rounded-xl p-6 border border-[#C5C5C5]/10">
              <div className="flex items-center gap-2 mb-6">
                <svg
                  className="w-5 h-5 text-[#C5C5C5]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12V11.25z"
                  />
                </svg>
                <h3 className="font-bold text-lg text-[#F1F1F1]">
                  Upcoming Events
                </h3>
              </div>

              {events.length === 0 ? (
                <p className="text-[#C5C5C5]/40 text-sm text-center py-4">
                  No upcoming events
                </p>
              ) : (
                <div className="space-y-4">
                  {events.map((evt) => {
                    const d = evt.event_date ? new Date(evt.event_date) : null;
                    return (
                      <div key={evt.id} className="flex gap-4">
                        {d ? (
                          <div className="flex flex-col items-center justify-center min-w-[50px] h-[60px] bg-[#C5C5C5]/10 rounded-lg text-[#C5C5C5]">
                            <span className="text-xs font-bold uppercase">
                              {MONTHS[d.getMonth()].slice(0, 3)}
                            </span>
                            <span className="text-xl font-black">
                              {d.getDate()}
                            </span>
                          </div>
                        ) : (
                          <div className="min-w-[50px] h-[60px] bg-[#0A1614] rounded-lg"></div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold leading-tight text-[#F1F1F1]">
                            {evt.title}
                          </h4>
                          {evt.event_location && (
                            <p className="text-xs text-[#C5C5C5]/40 mt-1">
                              {evt.event_location}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setShowCalendar(true)}
                className="w-full mt-6 py-2 text-[#C5C5C5] font-bold text-sm border border-[#C5C5C5]/20 rounded-lg hover:bg-[#C5C5C5]/5 transition-colors"
              >
                View Full Calendar
              </button>
            </div>
          </aside>
        </div>
      </div>

      {showCalendar && (
        <CalendarModal events={events} onClose={() => setShowCalendar(false)} />
      )}

      {selectedAnn && (
        <AnnouncementModal
          ann={selectedAnn}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AnnouncementsPage;