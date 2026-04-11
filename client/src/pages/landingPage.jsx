import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { supabase } from "../lib/supabase";
import PixelTransition from "../components/imageanimation/pixelimageTransition";
import SpotlightCard from "../components/cardAnimation/spotlightCard";
import { Lens } from "../components/lens/lens";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

const ORG_DATA = {
  CABYF: {
    name: "CABYF",
    fullName: "Circuit A Baptist Youth Fellowship",
    logo: "/assets/CircuitA.png",
    circuit: "Circuit A",
    description:
      "CABYF (Circuit A Baptist Youth Fellowship) is a community of young believers from Baptist churches within Circuit A who are united by faith, fellowship, and service. Formed to strengthen the spiritual lives of Baptist youth, CABYF provides opportunities for young people to gather for worship, leadership training, outreach, and fellowship activities. Through camps, assemblies, and ministry programs, CABYF encourages the youth to grow in their relationship with God, build meaningful friendships, and develop a heart for serving their churches and communities. It continues to inspire a new generation of Christian leaders who live out their faith with purpose and dedication.",
    highlights: [
      "Worship & Camps",
      "Leadership Training",
      "Outreach Programs",
      "Fellowship Activities",
    ],
  },
  CLBYC: {
    name: "CLBYC",
    fullName: "Central Lowland Baptist Youth Circuit",
    logo: "/assets/clbyc.jpg",
    circuit: "Circuit B",
    description:
      "CLBYC (Central Lowland Baptist Youth Circuit) represents the Baptist youth from churches located in the central lowland areas of Capiz. It serves as a gathering point for young people who share a commitment to Christian growth, unity, and service. CLBYC organizes youth fellowships, training programs, and outreach initiatives that strengthen both faith and community relationships. By bringing together youth from different churches, CLBYC promotes collaboration, spiritual development, and the shared mission of spreading God's love within their communities.",
    highlights: [
      "Youth Fellowships",
      "Training Programs",
      "Outreach Initiatives",
      "Inter-church Unity",
    ],
  },
  CCBYF: {
    name: "CCBYF",
    fullName: "Circuit C Baptist Youth Fellowship",
    logo: "/assets/ccbyf.jpg",
    circuit: "Circuit C",
    description:
      "CCBYF (Circuit C Baptist Youth Fellowship) is a fellowship of Baptist youth from churches within Circuit C who come together to grow in faith, leadership, and service. The organization provides a supportive environment where young people can connect, learn from one another, and deepen their spiritual journey. Through regular fellowships, youth camps, and ministry activities, CCBYF encourages members to become active servants in their churches and positive influences in society. It continues to nurture unity among Baptist youth while guiding them toward a life of faith, purpose, and leadership.",
    highlights: [
      "Youth Camps",
      "Ministry Activities",
      "Spiritual Growth",
      "Community Leadership",
    ],
  },
};

const OrgModal = ({ org, onClose }) => {
  if (!org) return null;
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
        className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Logo banner */}
        <div className="relative h-36 overflow-hidden flex-shrink-0">
          <img
            src={org.logo}
            alt={org.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1614] via-[#0A1614]/40 to-transparent" />
          <div className="absolute bottom-3 left-7">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#C5C5C5]/60">
              {org.circuit}
            </span>
            <h2 className="text-2xl font-black text-[#F1F1F1] leading-none">
              {org.name}
            </h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="overflow-y-auto flex-1 px-7 py-6 space-y-5
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-[#0A1614]
          [&::-webkit-scrollbar-thumb]:bg-[#0A1614]
          [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/45 border-b border-[#C5C5C5]/10 pb-4">
            {org.fullName}
          </p>
          <p className="text-[#C5C5C5]/70 text-sm leading-relaxed">
            {org.description}
          </p>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/40 mb-3">
              Key Activities
            </p>
            <div className="grid grid-cols-2 gap-2">
              {org.highlights.map((h) => (
                <div
                  key={h}
                  className="flex items-center gap-2 bg-[#C5C5C5]/5 border border-[#C5C5C5]/10 rounded-lg px-3 py-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C5C5C5]/40 flex-shrink-0" />
                  <span className="text-xs font-bold text-[#F1F1F1]/75">
                    {h}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed footer */}
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

// ── Camp Timeline Data ───────────────────────────────────────────────────────
const CAMP_HISTORY = [
  {
    year: "2016",
    assembly: "48th Annual Assembly & 21st Summer Camp",
    theme: "Discover Your Unknown Value",
    verse: "Luke 19:1–10 · 1 Peter 2:9 · Psalms 139:14",
    date: "May 24–28, 2016",
    venue:
      "Rev. Leocadio Señeres Memorial Baptist Church, Dangula, Dumarao, Capiz",
    image: "/assets/CapBYFU2016.jpg",
    description:
      "Young people came together to rediscover their true identity and worth in Christ — chosen, wonderfully made, and called for a greater purpose.",
    rationale:
      "The 48th Annual Assembly reminded every participant of their true identity and worth in Christ. Through moments of worship, meaningful conversations, and shared experiences of faith, hearts were awakened and lives were inspired — a journey of rediscovering the value that God has already placed within each believer, challenging the youth to live boldly and faithfully in the purpose He has prepared for them.",
  },
  {
    year: "2017",
    assembly: "49th Annual Assembly & 22nd Summer Camp",
    theme: "Change Is Coming",
    verse: "Ephesians 4:22–24 · 2 Corinthians 5:17 · Titus 2:6–8",
    date: "May 2–5, 2017",
    venue: "Libertad Baptist Church, Libertad, Tapaz, Capiz",
    image: "/assets/CapBYFU2017.jpg",
    description:
      "A powerful gathering where genuine transformation begins when a life is fully surrendered to Christ — leaving old ways to embrace righteousness, integrity, and purpose.",
    rationale:
      "The 49th Annual Assembly became a moment of awakening for the youth — a reminder that in Christ, every heart can be renewed and every life can truly change. Through worship, learning, and shared experiences of faith, many were challenged to grow deeper in their walk with God and strengthen their commitment to serve.",
  },
  {
    year: "2018",
    assembly: "50th Annual Assembly & 23rd Summer Camp",
    theme: "Wanted: All For One",
    verse: "Ephesians 4:11–16",
    date: "May 1–5, 2018",
    venue: "Puti-an Evangelical Church, Puti-an, Cuartero, Capiz",
    image: "/assets/CapBYFU2018.jpg",
    description:
      "Every person has a unique role in the body of Christ — no gift, no voice, and no calling is insignificant in God's mission.",
    rationale:
      "The 50th Annual Assembly marked a meaningful gathering of young believers called to unity, growth, and shared purpose. The event became a powerful reminder that when believers stand together with one heart and one purpose, the mission of Christ advances with greater strength and impact in the world.",
  },
  {
    year: "2019",
    assembly: "51st Annual Assembly & 24th Summer Camp",
    theme: "Deep. Rest. Shun.",
    verse: "2 Timothy 2:22",
    date: "May 7–10, 2019",
    venue: "Dapdapan Baptist Church, Dapdapan, Sapian, Capiz",
    image: "/assets/CapBYFU2019.jpg",
    description:
      "A call to deepen faith in God's Word, find true rest in His presence, and courageously shun the influences that lead away from righteousness.",
    rationale:
      "The 51st Annual Assembly gathered young believers for renewal, reflection, and spiritual growth as the fellowship continues its more than fifty-year legacy. The gathering encouraged participants to pursue righteousness, faith, love, and peace together with those who call on the Lord with pure hearts.",
  },
  {
    year: "2021",
    assembly: "52nd Annual Assembly & 25th Summer Camp",
    theme: "Padayon",
    verse: "Isaiah 41:10 · Philippians 3:13–15 · John 16:33",
    date: "May 11–15, 2021",
    venue: "Camburanan Baptist Church, Camburanan, Tapaz, Capiz",
    image: "/assets/CapBYFU2021.jpg",
    description:
      "Amid the global pandemic, a timely call to keep moving forward in faith and perseverance — trusting that God's presence continues to sustain His people.",
    rationale:
      "Amid the challenges of the global pandemic, the gathering reminded the youth to keep moving forward. Even in the midst of an unprecedented crisis, the message remained clear: God's work goes on, and with courage and hope, the youth are called to padayon — to press on, trusting that the Lord walks with them through every trial.",
  },
  {
    year: "2022",
    assembly: "53rd Assembly & 25th Campference",
    theme: "Sigrab",
    verse: "1 Kings 18:36–39 · Isaiah 40:28–31 · 2 Timothy 1:6–7",
    date: "July 19–22, 2022",
    venue:
      "East Villaflores Evangelical Church, East Villaflores, Maayon, Capiz",
    image: "/assets/CapBYFU2022.jpg",
    description:
      "As gatherings resumed after the pandemic, a powerful reunion to rekindle the fire of faith — fanning into flame the gifts God has given.",
    rationale:
      "The 53rd Assembly became more than a reunion — it was a revival of hearts, where the embers of faith were stirred back into a burning flame. As the youth came together again in worship and fellowship, they were called to rise, serve, and sigrab once more in their commitment to Christ.",
  },
  {
    year: "2023",
    assembly: "54th Annual Assembly & 26th Campference",
    theme: "Abante",
    verse: "Daniel 1:3–20 · Philippians 4:8 · Ephesians 3:20–21",
    date: "July 25–28, 2023",
    venue:
      "Filamer Christian University, Roxas City (Host: Capiz Evangelical Church)",
    image: "/assets/CapBYFU2023.jpg",
    description:
      "Able, Baskog, and Noble Towards Eternity — a call to move forward with courage, faith, and purpose, living lives of integrity and trusting in God who does far more than we imagine.",
    rationale:
      "The 54th Annual Assembly challenged young believers to stand firm in their convictions, just as Daniel and his companions remained faithful amid pressure and uncertainty. The event became a meaningful time of inspiration, fellowship, and renewed commitment — reminding every participant to abante, pressing forward in faith.",
  },
  {
    year: "2024",
    assembly: "55th Annual Assembly & 27th Campference",
    theme: "Sugata",
    verse: "1 Kings 19:1–7 · 2 Corinthians 12:9–10 · Psalms 18:28",
    date: "June 25–28, 2024",
    venue: "Camburanan Baptist Church, Camburanan, Tapaz, Capiz",
    image: "/assets/CapBYFU2024.jpg",
    description:
      "An invitation to reflect on the Christian journey — that even in weakness and wounds, God faithfully restores strength and brings light into the darkest moments.",
    rationale:
      "The 55th Annual Assembly recognized that following Christ often involves moments of weakness and discouragement. Like Elijah who encountered God's care in his time of despair, the youth were encouraged to find renewed hope and courage in His sustaining grace — rising again to carry the torch of their calling.",
  },
  {
    year: "2025",
    assembly: "56th Annual Assembly & 28th Campference",
    theme: "Ibahin",
    verse: "Daniel 3:19–30 · Romans 12:2 · 1 Corinthians 10:13",
    date: "May 27–30, 2025",
    venue: "Astorga Baptist Church, Inc., Astorga, Dumarao, Capiz",
    image: "/assets/CapBYFU2025.jpg",
    description:
      "A call to live lives truly set apart for God — with the courage to stand firm when the world chooses a different path, transformed as instruments of God's love.",
    rationale:
      "IBAHIN became a call to transformation — to be set apart from worldly patterns and to be shared as instruments of God's love to others. Through worship, fellowship, and meaningful encounters, the assembly inspired the youth to rise with courage, embrace their identity in Christ, and live as those who reflect God's truth and purpose in their generation.",
  },
];

// ── Timeline Card Inner ──────────────────────────────────────────────────────
const CardInner = ({ camp, isExpanded, onToggle }) => (
  <motion.div
    onClick={onToggle}
    whileHover={{ y: -4 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="bg-[#0A1614] border border-white/10 rounded-2xl overflow-hidden cursor-pointer group hover:border-green-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)]"
  >
    {/* Poster — full 3:4 ratio */}
    <div className="w-full aspect-[3/4] overflow-hidden relative">
      <img
        src={camp.image}
        alt={`CapBYFU ${camp.year} — ${camp.theme}`}
        className="w-full h-full object-cover object-top transition-transform duration-700"
      />
      <div className="absolute top-3 left-3 bg-[#010101]/70 backdrop-blur-sm border border-white/15 rounded-lg px-3 py-1.5">
        <span className="text-[#F1F1F1] font-black text-sm tabular-nums">
          {camp.year}
        </span>
      </div>
    </div>

    {/* Info */}
    <div className="p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5C5C5]/40 mb-1">
        {camp.assembly}
      </p>
      <h3 className="text-lg font-black text-[#F1F1F1] mb-2 leading-tight">
        {camp.theme}
      </h3>
      <p className="text-xs text-[#C5C5C5]/50 leading-relaxed line-clamp-2">
        {camp.description}
      </p>

      <div className="flex items-center gap-1.5 mt-3">
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            className="w-3.5 h-3.5 text-[#C5C5C5]/30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
        <span className="text-[10px] font-bold text-[#C5C5C5]/30 uppercase tracking-widest">
          {isExpanded ? "Show less" : "Read more"}
        </span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
              <p className="text-sm text-[#C5C5C5]/70 leading-relaxed">
                {camp.rationale}
              </p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-[#C5C5C5]/30 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <p className="text-[11px] text-[#C5C5C5]/50 italic leading-relaxed">
                    {camp.verse}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-[#C5C5C5]/30 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-[11px] text-[#C5C5C5]/50">{camp.date}</p>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-[#C5C5C5]/30 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-[11px] text-[#C5C5C5]/50 leading-relaxed">
                    {camp.venue}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

// ── Camp Timeline Component ──────────────────────────────────────────────────
const CampTimeline = () => {
  const containerRef = useRef(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="py-24 bg-[#010101]" id="legacy">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5C5C5]/40 mb-3">
            Our Legacy
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#F1F1F1] mb-3">
            Camp History
          </h2>
          <p className="text-[#C5C5C5]/50 text-sm max-w-xl mx-auto">
            A decade of faith, fellowship, and transformation — reliving the journey of CapBYFU camps, conferences, and assemblies from 2016 to 2025.
          </p>
        </motion.div>

        <div ref={containerRef} className="relative">
          {/* Background line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/5 hidden md:block" />
          {/* Animated progress line */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-px hidden md:block"
            style={{ height: "100%", overflow: "hidden" }}
          >
            <motion.div
              className="w-full origin-top"
              style={{
                height: lineHeight,
                background:
                  "linear-gradient(to bottom, #22c55e, #16a34a, #22c55e)",
                boxShadow: "0 0 12px rgba(34,197,94,0.4)",
              }}
            />
          </div>

          <div className="space-y-16 md:space-y-24 relative z-10">
            {CAMP_HISTORY.map((camp, index) => {
              const isLeft = index % 2 === 0;
              const isExpanded = expandedCard === index;

              return (
                <motion.div
                  key={camp.year}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative grid grid-cols-1 md:grid-cols-[1fr_48px_1fr] items-start gap-0"
                >
                  {/* LEFT slot — card on even, year on odd */}
                  <div
                    className={`hidden md:flex items-start ${isLeft ? "justify-end pr-6" : "justify-end pr-6"}`}
                  >
                    {isLeft ? (
                      /* Card */
                      <div className="w-full">
                        <CardInner
                          camp={camp}
                          isExpanded={isExpanded}
                          onToggle={() =>
                            setExpandedCard(isExpanded ? null : index)
                          }
                        />
                      </div>
                    ) : (
                      /* Ghost year — right-aligned so it's near the center line */
                      <div className="flex items-start pt-5">
                        <span className="text-6xl font-black text-[#f1f1f1] tabular-nums select-none">
                          {camp.year}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CENTER — dot */}
                  <div className="hidden md:flex flex-col items-center pt-5">
                    <motion.div
                      whileInView={{
                        boxShadow: [
                          "0 0 0px rgba(34,197,94,0)",
                          "0 0 16px rgba(34,197,94,0.7)",
                          "0 0 0px rgba(34,197,94,0)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      viewport={{ once: false }}
                      className="w-4 h-4 rounded-full bg-[#0A1614] border-2 border-green-500 z-20 relative"
                    />
                  </div>

                  {/* RIGHT slot — year on even, card on odd */}
                  <div
                    className={`hidden md:flex items-start ${isLeft ? "justify-start pl-6" : "justify-start pl-6"}`}
                  >
                    {isLeft ? (
                      /* Ghost year — left-aligned so it's near the center line */
                      <div className="flex items-start pt-5">
                        <span className="text-6xl font-black text-[#f1f1f1] tabular-nums select-none">
                          {camp.year}
                        </span>
                      </div>
                    ) : (
                      /* Card */
                      <div className="w-full">
                        <CardInner
                          camp={camp}
                          isExpanded={isExpanded}
                          onToggle={() =>
                            setExpandedCard(isExpanded ? null : index)
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Mobile — full width card */}
                  <div className="md:hidden w-full">
                    <CardInner
                      camp={camp}
                      isExpanded={isExpanded}
                      onToggle={() =>
                        setExpandedCard(isExpanded ? null : index)
                      }
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Camp Countdown Component ─────────────────────────────────────────────────
const CampCountdown = ({ targetDate, label }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;

    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const pad = (n) => String(n).padStart(2, "0");

  const units = timeLeft
    ? [
        { value: pad(timeLeft.days), label: "Days" },
        { value: pad(timeLeft.hours), label: "Hours" },
        { value: pad(timeLeft.minutes), label: "Minutes" },
        { value: pad(timeLeft.seconds), label: "Seconds" },
      ]
    : [];

  return (
    <section className="py-20 px-6 bg-[#010101]" id="countdown">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5C5C5]/40 mb-3">
            Coming Soon
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#F1F1F1] mb-3">
            {label || "Camp is Almost Here"}
          </h2>
          <p className="text-[#C5C5C5]/50 text-sm mb-12">
            Mark your calendars. Get ready for an unforgettable experience.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
        >
          {!targetDate ? (
            <p className="text-[#C5C5C5]/30 text-sm font-bold uppercase tracking-widest">
              Date to be announced
            </p>
          ) : expired ? (
            <p className="text-4xl font-black text-[#C5C5C5]/60">
              Camp Has Begun! 🎉
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
              {units.map((unit, i) => (
                <React.Fragment key={unit.label}>
                  <div className="flex flex-col items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-center">
                    <div
                      className="
                        bg-[#0A1614] border border-white/10
                        rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]
                        px-5 py-5 sm:px-7 sm:py-6
                        min-w-[80px] sm:min-w-[88px]
                        text-center
                        font-black text-[#F1F1F1]
                        text-4xl sm:text-5xl
                        tabular-nums
                        transition-all duration-300
                      "
                    >
                      {unit.value}
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C5C5C5]/40 text-center">
                      {unit.label}
                    </span>
                  </div>
                  {i < units.length - 1 && (
                    <div className="hidden sm:block self-start pt-5 sm:pt-6 text-3xl sm:text-4xl font-black text-[#C5C5C5]/20 select-none">
                      :
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </motion.div>

        {targetDate && !expired && (
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
            className="mt-10 text-xs text-[#C5C5C5]/30 font-bold uppercase tracking-widest"
          >
            {new Date(targetDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </motion.p>
        )}
      </div>
    </section>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [campSettings, setCampSettings] = useState({
    camp_date: null,
    camp_label: "",
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, title, category, image_url, created_at, excerpt, author")
        .order("created_at", { ascending: false })
        .limit(3);
      setAnnouncements(data || []);
      setAnnouncementsLoading(false);
    };
    fetchAnnouncements();

    const fetchCampSettings = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("camp_date, camp_label")
        .eq("id", 1)
        .single();
      if (data)
        setCampSettings({
          camp_date: data.camp_date,
          camp_label: data.camp_label,
        });
    };
    fetchCampSettings();

    // Prevent copy and right-click
    const handleCopy = (e) => e.preventDefault();
    const handleContextMenu = (e) => e.preventDefault();

    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <main className="select-none">
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center px-6 overflow-hidden"
        id="home"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1614]/20 via-[#0A1614]/40 to-[#0A1614] z-10"></div>
          <img
            alt="Hero Background"
            className="w-full h-full object-cover"
            src="assets/background.jpg"
          />
        </div>
        <div className="relative z-20 max-w-4xl text-center flex flex-col items-center gap-6">
          <motion.span
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="inline-block px-4 py-1.5 rounded-full bg-[#C5C5C5]/20 text-[#C5C5C5] text-xs font-bold uppercase tracking-widest border border-[#C5C5C5]/30"
          >
            Welcome to CapBYFU
          </motion.span>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-[#F1F1F1]"
          >
            Empowering Youth Through{" "}
            <span className="text-[#C5C5C5]">Faith & Fellowship</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-lg md:text-xl text-[#F1F1F1]/80 max-w-2xl leading-relaxed"
          >
            Nurturing spiritual growth and developing tomorrow's leaders. Our
            Mission is to ignite a passion for Christ; our Vision is a
            transformed generation for the Kingdom.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 mt-4"
          >
            <button
              onClick={() => navigate("/announcements")}
              className="bg-[#C5C5C5] hover:bg-[#F1F1F1] text-[#010101] px-8 py-4 rounded-xl text-base font-bold transition-all flex items-center gap-2 justify-center"
            >
              Updates
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-[#F1F1F1]/10 hover:bg-[#F1F1F1]/20 text-[#F1F1F1] px-8 py-4 rounded-xl text-base font-bold border border-[#F1F1F1]/20 backdrop-blur-sm transition-all"
            >
              Our Mission
            </button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 bg-[#0A1614]/20" id="about">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                alt="About Us"
                className="w-full h-full object-cover"
                src="assets/capbyfu.jpg"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[#C5C5C5] p-8 rounded-2xl shadow-xl hidden lg:block">
              <p className="text-[#010101] text-3xl font-black">58</p>
              <p className="text-[#010101]/80 text-sm font-medium">
                Years of Impact
              </p>
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#F1F1F1]">
              About CapBYFU
            </h2>
            <div className="w-20 h-1.5 bg-[#C5C5C5] rounded-full"></div>
            <p className="text-lg text-[#C5C5C5] leading-relaxed">
              Capiz Baptist Youth Fellowship Union (CapBYFU) is a youth-led,
              non-funded faith-based organization committed to the holistic
              development of young people across the province.
            </p>
            <p className="text-lg text-[#C5C5C5] leading-relaxed">
              We believe that the youth are not just the future, but the vibrant
              present of the church. Through our diverse programs, we equip
              every member with both spiritual foundations and practical skills
              needed to navigate the modern world with integrity and purpose.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-4">
              {[
                "Spiritual Growth",
                "Leadership Development",
                "Community Service",
                "Fellowship",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-[#C5C5C5] flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-bold text-sm text-[#F1F1F1]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="py-24 px-6" id="goals">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#F1F1F1]">
              Our Strategic Goals
            </h2>
            <p className="text-[#C5C5C5] max-w-2xl mx-auto">
              Focusing our efforts on key areas to ensure a lasting impact on
              our youth and the wider community.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Goal 1 - Faith Formation */}
            <SpotlightCard
              className="!bg-[#0A1614] !rounded-2xl !border-[#C5C5C5]/10 hover:!border-[#C5C5C5]/30 transition-all group"
              spotlightColor="rgba(255, 255, 255, 0.2)"
            >
              <svg
                className="w-10 h-10 text-[#C5C5C5] mb-6 group-hover:scale-110 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h3 className="text-xl font-bold text-[#F1F1F1] mb-3">
                Faith Formation
              </h3>
              <p className="text-[#C5C5C5] text-sm leading-relaxed">
                Deepening the personal relationship of every youth with God
                through study and prayer.
              </p>
            </SpotlightCard>

            {/* Goal 2 - Christian Unity */}
            <SpotlightCard
              className="!bg-[#0A1614] !rounded-2xl !border-[#C5C5C5]/10 hover:!border-[#C5C5C5]/30 transition-all group"
              spotlightColor="rgba(255, 255, 255, 0.2)"
            >
              <svg
                className="w-10 h-10 text-[#C5C5C5] mb-6 group-hover:scale-110 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-xl font-bold text-[#F1F1F1] mb-3">
                Christian Unity
              </h3>
              <p className="text-[#C5C5C5] text-sm leading-relaxed">
                Strengthening the bond between different fellowship units across
                the entire Capiz province.
              </p>
            </SpotlightCard>

            {/* Goal 3 - Skill Building */}
            <SpotlightCard
              className="!bg-[#0A1614] !rounded-2xl !border-[#C5C5C5]/10 hover:!border-[#C5C5C5]/30 transition-all group"
              spotlightColor="rgba(255, 255, 255, 0.2)"
            >
              <svg
                className="w-10 h-10 text-[#C5C5C5] mb-6 group-hover:scale-110 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                />
              </svg>
              <h3 className="text-xl font-bold text-[#F1F1F1] mb-3">
                Skill Building
              </h3>
              <p className="text-[#C5C5C5] text-sm leading-relaxed">
                Providing workshops and seminars that empower youth with
                practical life and ministry skills.
              </p>
            </SpotlightCard>

            {/* Goal 4 - Missional Impact */}
            <SpotlightCard
              className="!bg-[#0A1614] !rounded-2xl !border-[#C5C5C5]/10 hover:!border-[#C5C5C5]/30 transition-all group"
              spotlightColor="rgba(255, 255, 255, 0.2)"
            >
              <svg
                className="w-10 h-10 text-[#C5C5C5] mb-6 group-hover:scale-110 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-xl font-bold text-[#F1F1F1] mb-3">
                Missional Impact
              </h3>
              <p className="text-[#C5C5C5] text-sm leading-relaxed">
                Actively participating in outreach programs that serve the
                underprivileged in our society.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-24 px-6 bg-[#0A1614]/20" id="announcements">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#F1F1F1]">
              Latest Announcements
            </h2>
            <p className="text-[#C5C5C5] max-w-2xl mx-auto">
              Stay informed about upcoming events and exciting news
            </p>
          </motion.div>

          {announcementsLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#0A1614] rounded-2xl overflow-hidden border border-[#C5C5C5]/10 animate-pulse"
                >
                  <div className="aspect-video bg-[#C5C5C5]/10"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-3 bg-[#C5C5C5]/10 rounded w-1/3"></div>
                    <div className="h-5 bg-[#C5C5C5]/10 rounded w-3/4"></div>
                    <div className="h-3 bg-[#C5C5C5]/10 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col items-center justify-center py-24 gap-4 text-[#C5C5C5]"
            >
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
              <p className="font-bold text-lg">No announcements yet</p>
              <p className="text-sm opacity-60">Check back soon for updates!</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {announcements.map((ann, i) => (
                <motion.div
                  key={ann.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i * 0.3}
                  variants={fadeUp}
                  className="bg-[#0A1614] rounded-2xl overflow-hidden border border-[#C5C5C5]/10 hover:border-[#C5C5C5]/30 transition-all cursor-pointer"
                  onClick={() => navigate("/announcements")}
                >
                  <div className="aspect-video bg-[#C5C5C5]/10">
                    {ann.image_url ? (
                      <img
                        alt={ann.title}
                        className="w-full h-full object-cover"
                        src={ann.image_url}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#C5C5C5]/30">
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
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#C5C5C5] mb-3 uppercase tracking-wider">
                      <span className="px-2 py-0.5 rounded-full bg-[#0d59f2]/20 text-[#0d59f2]">
                        {ann.category}
                      </span>
                      <span>
                        {new Date(ann.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#F1F1F1] mb-3 line-clamp-2">
                      {ann.title}
                    </h3>
                    {ann.excerpt && (
                      <p className="text-[#C5C5C5] mb-4 text-sm leading-relaxed line-clamp-2">
                        {ann.excerpt}
                      </p>
                    )}
                    <button className="text-[#C5C5C5] hover:text-[#F1F1F1] font-bold text-sm flex items-center gap-2 transition-colors">
                      Learn More
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/announcements")}
              className="bg-[#C5C5C5]/10 hover:bg-[#C5C5C5]/20 text-[#F1F1F1] px-8 py-3 rounded-xl font-bold border border-[#C5C5C5]/20 transition-all"
            >
              View All Announcements
            </button>
          </div>
        </div>
      </section>

      {/* Executive Committee Section */}
      <section className="py-24 px-6 bg-[#0A1614]/20" id="execom">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#F1F1F1]">
              Executive Committee 2025-2027
            </h2>
            <p className="text-[#C5C5C5] text-lg max-w-2xl mx-auto">
              Meet the servant-leaders dedicated to guiding the Capiz Baptist
              Youth Fellowship Union in faith and service.
            </p>
          </div>

          <div className="flex flex-col gap-16">
            {/* President Row */}
            <div className="flex flex-col items-center">
              <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-xl border-2 border-[#C5C5C5] w-80 text-center group">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#C5C5C5]/20">
                  <img
                    src="assets/president.jpg"
                    alt="President"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-4 px-2">
                  <h3 className="text-[#010101] text-lg font-bold">
                    Ronabie Morales
                  </h3>
                  <p className="text-[#C5C5C5] font-bold text-xs uppercase tracking-widest mt-1">
                    President
                  </p>
                </div>
              </div>
            </div>

            {/* VP & Secretariat Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* VP */}
              <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-lg text-center flex flex-col">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#C5C5C5]/20">
                  <img
                    src="assets/vicepres.jpg"
                    alt="Vice President"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-4 px-2">
                  <h3 className="text-[#010101] text-base font-bold">
                    Jade Mark Lositano
                  </h3>
                  <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                    Vice President
                  </p>
                </div>
              </div>

              {/* Secretary */}
              <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-lg text-center flex flex-col">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#C5C5C5]/20">
                  <img
                    src="assets/secretary.jpg"
                    alt="Secretary"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-4 px-2">
                  <h3 className="text-[#010101] text-base font-bold">
                    John Prince Jondonero
                  </h3>
                  <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                    Secretary
                  </p>
                </div>
              </div>

              {/* Asst Secretary */}
              <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-lg text-center flex flex-col">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#C5C5C5]/20">
                  <img
                    src="assets/asstsec.jpg"
                    alt="Assistant Secretary"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-4 px-2">
                  <h3 className="text-[#010101] text-base font-bold">
                    Zyrah Shane Fropunga
                  </h3>
                  <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                    Asst. Secretary
                  </p>
                </div>
              </div>

              {/* PIO */}
              <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-lg text-center flex flex-col">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#C5C5C5]/20">
                  <img
                    src="assets/pio.jpg"
                    alt="PIO"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-4 px-2">
                  <h3 className="text-[#010101] text-base font-bold">
                    Xandrine Lei Martin
                  </h3>
                  <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                    PIO
                  </p>
                </div>
              </div>
            </div>

            {/* Finance & Business Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Treasurer */}
              <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-lg text-center flex flex-col">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#C5C5C5]/20">
                  <img
                    src="assets/treasurer.jpg"
                    alt="Treasurer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-4 px-2">
                  <h3 className="text-[#010101] text-base font-bold">
                    John Jofelson Delfin
                  </h3>
                  <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                    Treasurer
                  </p>
                </div>
              </div>

              {/* Auditor */}
              <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-lg text-center flex flex-col">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#C5C5C5]/20">
                  <img
                    src="assets/auditor.jpg"
                    alt="Auditor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-4 px-2">
                  <h3 className="text-[#010101] text-base font-bold">
                    Kimberly Sarmiento
                  </h3>
                  <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                    Auditor
                  </p>
                </div>
              </div>

              {/* Business Manager 1 */}
              <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-lg text-center flex flex-col">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#C5C5C5]/20">
                  <img
                    src="assets/bussman.jpg"
                    alt="Business Manager 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-4 px-2">
                  <h3 className="text-[#010101] text-base font-bold">
                    Harold Equipado
                  </h3>
                  <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                    Business Manager
                  </p>
                </div>
              </div>

              {/* Business Manager 2 */}
              <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-lg text-center flex flex-col">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#C5C5C5]/20">
                  <img
                    src="assets/bussman2.jpg"
                    alt="Business Manager 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-4 px-2">
                  <h3 className="text-[#010101] text-base font-bold">
                    James Nemie Odiaman
                  </h3>
                  <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                    Business Manager
                  </p>
                </div>
              </div>
            </div>

            {/* Advisers Section */}
            <div className="mt-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-[#C5C5C5]/20"></div>
                <h2 className="text-[#F1F1F1] text-2xl font-bold px-4">
                  Our Advisers
                </h2>
                <div className="h-px flex-1 bg-[#C5C5C5]/20"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {/* Adviser 1 */}
                <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-md text-center">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-[#C5C5C5]/20">
                    <img
                      src="assets/adviser.jpg"
                      alt="Spiritual Adviser"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pb-3 px-1">
                    <h4 className="text-[#010101] text-sm font-bold">
                      Mariel Billones
                    </h4>
                    <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                      Adviser
                    </p>
                  </div>
                </div>

                {/* Adviser 2 */}
                <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-md text-center">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-[#C5C5C5]/20">
                    <img
                      src="assets/adviser2.jpg"
                      alt="Ministry Adviser"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pb-3 px-1">
                    <h4 className="text-[#010101] text-sm font-bold">
                      Raphah Cortel
                    </h4>
                    <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                      Adviser
                    </p>
                  </div>
                </div>

                {/* Adviser 3 */}
                <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-md text-center">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-[#C5C5C5]/20">
                    <img
                      src="assets/adviser3.jpg"
                      alt="Youth Mentor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pb-3 px-1">
                    <h4 className="text-[#010101] text-sm font-bold">
                      Pastor John Mark Mirabuena
                    </h4>
                    <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                      Adviser
                    </p>
                  </div>
                </div>

                {/* Adviser 4 */}
                <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-md text-center">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-[#C5C5C5]/20">
                    <img
                      src="assets/adviser4.jpg"
                      alt="Program Adviser"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pb-3 px-1">
                    <h4 className="text-[#010101] text-sm font-bold">
                      Pastor Dominic Ibanez
                    </h4>
                    <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                      Adviser
                    </p>
                  </div>
                </div>

                {/* Adviser 5 */}
                <div className="bg-[#F1F1F1] p-1 rounded-xl shadow-md text-center">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-[#C5C5C5]/20">
                    <img
                      src="assets/adviser5.jpg"
                      alt="Resource Adviser"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pb-3 px-1">
                    <h4 className="text-[#010101] text-sm font-bold">
                      Pastor Yancy Japhet Martinez
                    </h4>
                    <p className="text-[#C5C5C5] font-semibold text-xs uppercase tracking-widest mt-1">
                      Adviser
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auxiliary Organizations Section */}
      <section className="py-24 px-6" id="auxiliaries">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#F1F1F1]">
              Auxiliary Organizations
            </h2>
            <p className="text-[#C5C5C5] max-w-2xl mx-auto">
              Meet the specialized groups that form the heartbeat of our union.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* CABYF */}
            <div className="bg-[#0A1614] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col border border-[#C5C5C5]/10">
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/assets/CircuitA.png"
                  alt="CABYF Logo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-[#C5C5C5] text-[#010101] text-[10px] font-black px-3 py-1 rounded-full">
                  CABYF
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-4 text-[#F1F1F1]">
                  CABYF
                </h3>
                <p className="text-[#C5C5C5] text-sm mb-6 flex-1">
                  CABYF (Circuit A Baptist Youth Fellowship) is a community of
                  young believers from Baptist churches within Circuit A who are
                  united by faith, fellowship, and service...
                </p>
                <button
                  onClick={() => setSelectedOrg(ORG_DATA.CABYF)}
                  className="w-full py-3 rounded-xl border-2 border-[#C5C5C5] text-[#C5C5C5] font-bold hover:bg-[#C5C5C5] hover:text-[#010101] transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* CLBYC */}
            <div className="bg-[#0A1614] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col border border-[#C5C5C5]/10">
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/assets/clbyc.jpg"
                  alt="CLBYC Logo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-[#C5C5C5] text-[#010101] text-[10px] font-black px-3 py-1 rounded-full">
                  CLBYC
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-4 text-[#F1F1F1]">
                  CLBYC
                </h3>
                <p className="text-[#C5C5C5] text-sm mb-6 flex-1">
                  CLBYC (Central Lowland Baptist Youth Circuit) represents the
                  Baptist youth from churches located in the central lowland
                  areas of Capiz...
                </p>
                <button
                  onClick={() => setSelectedOrg(ORG_DATA.CLBYC)}
                  className="w-full py-3 rounded-xl border-2 border-[#C5C5C5] text-[#C5C5C5] font-bold hover:bg-[#C5C5C5] hover:text-[#010101] transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* CCBYF */}
            <div className="bg-[#0A1614] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col border border-[#C5C5C5]/10">
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/assets/ccbyf.jpg"
                  alt="CCBYF Logo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-[#C5C5C5] text-[#010101] text-[10px] font-black px-3 py-1 rounded-full">
                  CCBYF
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-4 text-[#F1F1F1]">
                  CCBYF
                </h3>
                <p className="text-[#C5C5C5] text-sm mb-6 flex-1">
                  CCBYF (Circuit C Baptist Youth Fellowship) is a fellowship of
                  Baptist youth from churches within Circuit C who come together
                  to grow in faith, leadership, and service...
                </p>
                <button
                  onClick={() => setSelectedOrg(ORG_DATA.CCBYF)}
                  className="w-full py-3 rounded-xl border-2 border-[#C5C5C5] text-[#C5C5C5] font-bold hover:bg-[#C5C5C5] hover:text-[#010101] transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Moments — Camp Video Compilation */}
      <CampVideoSection />

      {/* Gallery Section */}
      <section className="py-24 px-6" id="gallery">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#F1F1F1]">
              Gallery
            </h2>
            <p className="text-[#C5C5C5] max-w-2xl mx-auto">
              Capturing the joy, service, and unity of our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <PixelTransition
                key={n}
                className="!w-full !rounded-2xl !border-0"
                style={{ width: "100%" }}
                aspectRatio="100%"
                gridSize={8}
                pixelColor="#0A1614"
                animationStepDuration={0.2}
                firstContent={
                  <img
                    alt={`Gallery ${n}`}
                    className="w-full h-full object-cover"
                    src={`assets/gallery${n}.jpg`}
                  />
                }
                secondContent={
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A1614] gap-3 px-4 text-center">
                    <h1 className="text-[#F1F1F1] font-black text-lg leading-tight">
                      This is CAPBYFU!
                    </h1>
                    <p className="text-[#C5C5C5]/60 text-xs font-bold uppercase tracking-widest">
                      Capiz Baptist Youth Fellowship Union
                    </p>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Camp Countdown Section */}
      <CampCountdown
        targetDate={campSettings.camp_date}
        label={campSettings.camp_label}
      />

      {/* Merch Section */}
      <section className="py-20 px-6 bg-[#010101]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-[#C5C5C5]/50 mb-4">
              Official Camp Merchandise
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#F1F1F1]">
              CapBYFU Merch
            </h2>
            <p className="text-[#C5C5C5]/60 max-w-xl mx-auto text-sm leading-relaxed">
              Wear your faith. Represent CapBYFU at camp and beyond — hover to
              take a closer look.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { src: "assets/merch1.jpg", label: "Merch Item 1" },
              { src: "assets/merch2.jpg", label: "Merch Item 2" },
              { src: "assets/merch3.jpg", label: "Merch Item 3" },
            ].map((item, i) => (
              <motion.div
                key={item.src}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="rounded-2xl overflow-hidden border border-[#C5C5C5]/10 bg-[#0A1614] aspect-square"
              >
                <Lens
                  zoomFactor={2.5}
                  lensSize={160}
                  borderRadius="2xl"
                  shadowIntensity="heavy"
                  animationDuration={0.2}
                  blurEdge={false}
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    className="w-full h-full object-cover"
                  />
                </Lens>
              </motion.div>
            ))}
          </div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1.5}
            className="text-center text-[#C5C5C5]/30 text-xs font-bold mt-8 uppercase tracking-widest"
          >
            Available for pre-orders
          </motion.p>
        </div>
      </section>

      {/* Camp History Timeline */}
      <CampTimeline />

      {/* Church Map */}
      <ChurchMap />

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#C5C5C5] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F1F1F1]/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#010101]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-[#010101] mb-6">
              Ready to join our journey?
            </h2>
            <p className="text-[#010101]/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Become a part of a community that loves God and loves people. Find
              your home with CapBYFU today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className="bg-[#010101] text-[#F1F1F1] px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:bg-[#0A1614] transition-all"
              >
                Register Now
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-transparent border-2 border-[#010101] text-[#010101] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#010101] hover:text-[#F1F1F1] transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedOrg && (
          <OrgModal org={selectedOrg} onClose={() => setSelectedOrg(null)} />
        )}
      </AnimatePresence>
    </main>
  );
};

// ── Church coordinates ──────────────
const CHURCH_LOCATIONS = [
  // Circuit A — Dumarao & Cuartero area
  {
    id: "agbatuan",
    name: "Agbatuan Baptist Church",
    circuit: "A",
    lng: 122.82735975122985,
    lat: 11.278491810442212,
    address: "Brgy. Agbatuan, Dumarao, Capiz",
  },
  {
    id: "astorga",
    name: "Astorga Baptist Church Inc",
    circuit: "A",
    lng: 122.79832563227464,
    lat: 11.260161277735362,
    address: "Brgy. Astorga, Dumarao, Capiz",
  },
  {
    id: "east_villaflores",
    name: "East Villaflores Evangelical Church",
    circuit: "A",
    lng: 122.8359521848262,
    lat: 11.325370049100787,
    address: "Brgy. East Villaflores, Dumarao, Capiz",
  },
  {
    id: "hansol",
    name: "Hansol Baptist Church",
    circuit: "A",
    lng: 122.7707884324222,
    lat: 11.259938654531979,
    address: "Dumarao, Capiz",
  },
  {
    id: "hilltop",
    name: "Hilltop Baptist Church",
    circuit: "A",
    lng: 122.80736525575685,
    lat: 11.28272853993849,
    address: "Hilltop Area, Roxas City, Capiz",
  },
  {
    id: "lunayan",
    name: "Lunayan Baptist Church",
    circuit: "A",
    lng: 122.77189445153273,
    lat: 11.329039067964624,
    address: "Brgy. Lunayan, Dumarao, Capiz",
  },
  {
    id: "mahunodhunod",
    name: "Mahunodhunod Baptist Church",
    circuit: "A",
    lng: 122.81326495762995,
    lat: 11.279033813281679,
    address: "Brgy. Mahunodhunod, Dumarao, Capiz",
  },
  {
    id: "pamampangon",
    name: "Pamampangon Baptist Church",
    circuit: "A",
    lng: 122.78194119401348,
    lat: 11.26216101120926,
    address: "Brgy. Pamampangon, Dumarao, Capiz",
  },
  {
    id: "putian_community",
    name: "Puti-an Community Christian Church",
    circuit: "A",
    lng: 122.84794042076403,
    lat: 11.297393526036627,
    address: "Brgy. Putian, Cuartero, Capiz",
  },
  {
    id: "putian_evangelical",
    name: "Puti-an Evangelical Church",
    circuit: "A",
    lng: 122.84208359541621,
    lat: 11.287387015296275,
    address: "Brgy. Putian, Cuartero, Capiz",
  },
  {
    id: "san_antonio",
    name: "San Antonio Baptist Church",
    circuit: "A",
    lng: 122.81937905567871,
    lat: 11.317082476235264,
    address: "Brgy. San Antonio, Dumarao, Capiz",
  },

  // Circuit B — Roxas City, Pontevedra, Sigma, Panitan, Maayon + Masbate
  {
    id: "aglalana",
    name: "Aglalana Baptist Mission Church",
    circuit: "B",
    lng: 122.67110450865194,
    lat: 11.225305763376989,
    address: "Brgy. Aglalana, Dumarao, Capiz",
  },
  {
    id: "agsilab",
    name: "Agsilab Baptist Church",
    circuit: "B",
    lng: 122.56374299135133,
    lat: 11.523710840311894,
    address: "Roxas City, Capiz",
  },
  {
    id: "amaga",
    name: "Amaga Evangelical Church",
    circuit: "B",
    lng: 122.68127118136239,
    lat: 11.442000125652783,
    address: "Brgy. Amaga, Sigma, Capiz",
  },
  {
    id: "bago_chiquito",
    name: "Bago Chiquito Christian Church",
    circuit: "B",
    lng: 122.7897623736578,
    lat: 11.52459308693451,
    address: "Brgy. Bago Chiquito, Pontevedra, Capiz",
  },
  {
    id: "balid_evangelical",
    name: "Balud Evangelical Church (Balud, Masbate)",
    circuit: "B",
    lng: 123.23751749932335,
    lat: 12.043724217921525,
    address: "Brgy. Balid, Balud, Masbate",
  },
  {
    id: "capiz_evangelical",
    name: "Capiz Evangelical Church",
    circuit: "B",
    lng: 122.75279916473409,
    lat: 11.576611726222032,
    address: "Roxas Avenue, Roxas City, Capiz",
  },
  {
    id: "cec_maayon_bal",
    name: "CEC Maayon (Balighot)",
    circuit: "B",
    lng: 122.87869846486207,
    lat: 11.33878662722498,
    address: "Brgy. Balighot, Maayon, Capiz",
  },
  {
    id: "cec_maayon_fer",
    name: "CEC Maayon (Fernandez)",
    circuit: "B",
    lng: 122.76489508557997,
    lat: 11.379281630189187,
    address: "Brgy. Fernandez, Maayon, Capiz",
  },
  {
    id: "cec_milibili",
    name: "CEC Milibili",
    circuit: "B",
    lng: 122.76603820216194,
    lat: 11.562161193507837,
    address: "Brgy. Milibili, Roxas City, Capiz",
  },
  {
    id: "cec_pinaypayan",
    name: "CEC (Pinaypayan)",
    circuit: "B",
    lng: 122.76163033258742,
    lat: 11.52927544906014,
    address: "Brgy. Pinaypayan, Roxas City, Capiz",
  },
  {
    id: "christ_centered",
    name: "Christ Centered Church",
    circuit: "B",
    lng: 122.75274653401458,
    lat: 11.574408109647313,
    address: "Roxas City, Capiz",
  },
  {
    id: "dapadpan",
    name: "Dapadpan Baptist Church",
    circuit: "B",
    lng: 122.635972154504,
    lat: 11.493683297736093,
    address: "Brgy. Dapadpan, Pontevedra, Capiz",
  },
  {
    id: "hope_community",
    name: "Hope Community Baptist Church",
    circuit: "B",
    lng: 122.82487512963297,
    lat: 11.480379269116359,
    address: "Roxas City, Capiz",
  },
  {
    id: "lucero",
    name: "Lucero Baptist Church",
    circuit: "B",
    lng: 122.45994393959805,
    lat: 11.457898649333172,
    address: "Brgy. Lucero, Jamindan, Capiz",
  },
  {
    id: "malibas",
    name: "Malibas Baptist Church (Balud, Masbate)",
    circuit: "B",
    lng: 123.9010266310037,
    lat: 12.134345233257466,
    address: "Brgy. Malibas, Balud, Masbate",
  },
  {
    id: "manhoy",
    name: "Manhoy Baptist Church",
    circuit: "B",
    lng: 122.66319107404307,
    lat: 11.349102490313843,
    address: "Brgy. Manhoy, Pontevedra, Capiz",
  },
  {
    id: "nasagud",
    name: "Nasagud Evangelical Church",
    circuit: "B",
    lng: 122.74784103512467,
    lat: 11.527350203372377,
    address: "Brgy. Nasagud, Dumarao, Capiz",
  },
  {
    id: "nipa",
    name: "Nipa Baptist Church",
    circuit: "B",
    lng: 122.86763062484086,
    lat: 11.429778237091982,
    address: "Brgy. Nipa, Pontevedra, Capiz",
  },
  {
    id: "paglaum",
    name: "Paglaum Baptist Church",
    circuit: "B",
    lng: 122.67492351915949,
    lat: 11.342325610504192,
    address: "Poblacion Takas, Cuartero, Capiz",
  },
  {
    id: "pajo",
    name: "Pajo Baptist Church (Balud, Masbate)",
    circuit: "B",
    lng: 123.22013867680302,
    lat: 12.090119594351155,
    address: "Brgy. Pajo, Balud, Masbate",
  },
  {
    id: "pontevedra",
    name: "Pontevedra Baptist Church Inc.",
    circuit: "B",
    lng: 122.83029462610607,
    lat: 11.480597343213141,
    address: "Poblacion, Pontevedra, Capiz",
  },
  {
    id: "senores_memorial",
    name: "Rev. Leocadio Señeres Memorial Baptist Church",
    circuit: "B",
    lng: 122.66340548007305,
    lat: 11.307749141492994,
    address: "Brgy. Dangula, Dumarao, Capiz",
  },
  {
    id: "sublangon",
    name: "Sublangon Christian Church",
    circuit: "B",
    lng: 122.822497453091,
    lat: 11.481217628473026,
    address: "Brgy. Sublangon, Pontevedra, Capiz",
  },
  {
    id: "tinaytayan",
    name: "Tinaytayan Baptist Church",
    circuit: "B",
    lng: 122.67520432613,
    lat: 11.301530896174313,
    address: "Brgy. Tinaytayan, Dumarao, Capiz",
  },

  // Circuit C — Tapaz, Jamindan, Dumalag area
  {
    id: "aglungon",
    name: "Aglungon Baptist Church",
    circuit: "C",
    lng: 122.57394431741234,
    lat: 11.252957194031048,
    address: "Brgy. Aglungon, Jamindan, Capiz",
  },
  {
    id: "bag_ong_barrio",
    name: "Bag-ong Barrio Baptist Church",
    circuit: "C",
    lng: 122.57391777771372,
    lat: 11.25308769036964,
    address: "Brgy. Bag-ong Barrio, Tapaz, Capiz",
  },
  {
    id: "camburanan",
    name: "Camburanan Baptist Church",
    circuit: "C",
    lng: 122.51556099967347,
    lat: 11.34601343972216,
    address: "Brgy. Camburanan, Tapaz, Capiz",
  },
  {
    id: "christ_centered_c",
    name: "Christ Centered Church (Circuit C)",
    circuit: "C",
    lng: 122.539,
    lat: 11.255,
    address: "Tapaz, Capiz",
  },
  {
    id: "dumalag",
    name: "Dumalag Evangelical Church",
    circuit: "C",
    lng: 122.6239999218654,
    lat: 11.306927227644978,
    address: "Poblacion, Dumalag, Capiz",
  },
  {
    id: "duran",
    name: "Duran Baptist Church",
    circuit: "C",
    lng: 122.59597891291158,
    lat: 11.269046149169013,
    address: "Brgy. Duran, Dumalag, Capiz",
  },
  {
    id: "faith_christian",
    name: "Faith Christian Church",
    circuit: "C",
    lng: 122.38741762818692,
    lat: 11.176802882998178,
    address: "Tapaz, Capiz",
  },
  {
    id: "garangan",
    name: "Garangan Baptist Church",
    circuit: "C",
    lng: 122.47507944878355,
    lat: 11.198536251292856,
    address: "Brgy. Garangan, Jamindan, Capiz",
  },
  {
    id: "greenhills",
    name: "Greenhills Christian Church",
    circuit: "C",
    lng: 122.55,
    lat: 11.26,
    address: "Tapaz, Capiz",
  },
  {
    id: "hopevale",
    name: "Hopevale Baptist Church",
    circuit: "C",
    lng: 122.4918256708917,
    lat: 11.286917612682688,
    address: "Tapaz, Capiz",
  },
  {
    id: "katipunan",
    name: "Katipunan Evangelical Church",
    circuit: "C",
    lng: 122.49568145956887,
    lat: 11.202228520344086,
    address: "Brgy. Katipunan, Tapaz, Capiz",
  },
  {
    id: "libertad",
    name: "Libertad Baptist Church",
    circuit: "C",
    lng: 122.5051797652954,
    lat: 11.187573863420498,
    address: "Brgy. Libertad, Tapaz, Capiz",
  },
  {
    id: "malitbog",
    name: "Malitbog Baptist Church",
    circuit: "C",
    lng: 122.5271081619216,
    lat: 11.190922222584998,
    address: "Brgy. Malitbog, Jamindan, Capiz",
  },
  {
    id: "maludlud",
    name: "Maludlud Christian Church",
    circuit: "C",
    lng: 122.598096614684,
    lat: 11.241573599010477,
    address: "Brgy. Maludlud, Tapaz, Capiz",
  },
  {
    id: "romaje",
    name: "Romaje Baptist Church",
    circuit: "C",
    lng: 122.50630218902512,
    lat: 11.19378757646419,
    address: "Brgy. Romaje, Jamindan, Capiz",
  },
  {
    id: "san_francisco",
    name: "San Francisco Baptist Church",
    circuit: "C",
    lng: 122.55148319681967,
    lat: 11.2218657276289,
    address: "Brgy. San Francisco, Tapaz, Capiz",
  },
  {
    id: "san_miguel",
    name: "San Miguel Baptist Church",
    circuit: "C",
    lng: 122.6401982815219,
    lat: 11.27924178842887,
    address: "San Miguel Ilawod, Tapaz, Capiz",
  },
  {
    id: "sta_teresa",
    name: "Sta. Teresa Evangelical Church",
    circuit: "C",
    lng: 122.58766787694678,
    lat: 11.287399756895482,
    address: "Brgy. Sta. Teresa, Jamindan, Capiz",
  },
  {
    id: "sunrise",
    name: "Sunrise Baptist Church",
    circuit: "C",
    lng: 122.56907936197364,
    lat: 11.252014862635752,
    address: "Tapaz, Capiz",
  },
  {
    id: "switch",
    name: "Switch Baptist Church",
    circuit: "C",
    lng: 122.55827837683212,
    lat: 11.244744912117493,
    address: "Tapaz, Capiz",
  },
  {
    id: "taft",
    name: "Taft Baptist Church",
    circuit: "C",
    lng: 122.49401539961255,
    lat: 11.287409022124939,
    address: "Brgy. Taft, Tapaz, Capiz",
  },
  {
    id: "tapaz",
    name: "Tapaz Baptist Church",
    circuit: "C",
    lng: 122.53887454250737,
    lat: 11.261491836854944,
    address: "Poblacion, Tapaz, Capiz",
  },
  {
    id: "wright",
    name: "Wright Baptist Church",
    circuit: "C",
    lng: 122.47563107441792,
    lat: 11.194962221628396,
    address: "Brgy. Wright, Tapaz, Capiz",
  },
];

const CIRCUIT_META = {
  A: {
    color: "#ef4444",
    label: "Circuit A",
    count: CHURCH_LOCATIONS.filter((c) => c.circuit === "A").length,
  },
  B: {
    color: "#eab308",
    label: "Circuit B",
    count: CHURCH_LOCATIONS.filter((c) => c.circuit === "B").length,
  },
  C: {
    color: "#3b82f6",
    label: "Circuit C",
    count: CHURCH_LOCATIONS.filter((c) => c.circuit === "C").length,
  },
};

// Camp Video Section
const CAMP_VIDEOS = [
  {
    type: "local",
    src: "https://pub-f17ec93f80ac41a08d6109e1465414a6.r2.dev/camp-videos.mp4",
    poster: "assets/capbyfu.jpg",
    title: "CapBYFU Camp Compilation",
    year: "2025",
    description:
      "Relive the worship, fellowship, and transformative moments from our camps.",
  },
];

const VideoPlayer = ({ video, isActive, onActivate }) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    setPlaying(true);
    onActivate();
    if (video.type === "local") {
      setTimeout(() => videoRef.current?.play(), 50);
    }
  };

  // Pause local video when another becomes active
  useEffect(() => {
    if (!isActive && playing) {
      setPlaying(false);
      if (video.type === "local") videoRef.current?.pause();
    }
  }, [isActive]);

  const isLocal = video.type === "local";

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#010101] shadow-2xl shadow-black/60 group">
      {/* aspect ratio wrapper */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {/* ── Local video ── */}
        {isLocal && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={video.src}
            poster={video.poster || undefined}
            controls={playing}
            playsInline
            onEnded={() => setPlaying(false)}
          />
        )}

        {/* ── Overlay shown before play (both types) ── */}
        {!playing && (
          <>
            {/* Thumbnail — YouTube pulls from CDN, local uses poster or bg */}
            {!isLocal && (
              <img
                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
              />
            )}
            {isLocal && video.poster && (
              <img
                src={video.poster}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
              />
            )}
            {isLocal && !video.poster && (
              <div className="absolute inset-0 bg-[#0A1614]" />
            )}

            {/* Dark scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            {/* Play button */}
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center group/btn"
              aria-label={`Play ${video.title}`}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-white/10 animate-ping scale-110" />
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 group-hover/btn:scale-110"
                  style={{
                    background: "oklch(1 0 0 / 0.12)",
                    backdropFilter: "blur(16px) saturate(1.5)",
                    boxShadow:
                      "0 0 0 1px oklch(1 0 0 / 0.15), inset 0 0 0 1px oklch(1 0 0 / 0.08)",
                  }}
                >
                  <svg
                    className="w-6 h-6 text-white translate-x-0.5"
                    fill="currentColor"
                    viewBox="0 0 18 18"
                  >
                    <path d="m14.051 10.723-7.985 4.964a1.98 1.98 0 0 1-2.758-.638A2.06 2.06 0 0 1 3 13.964V4.036C3 2.91 3.895 2 5 2c.377 0 .747.109 1.066.313l7.985 4.964a2.057 2.057 0 0 1 .627 2.808c-.16.257-.373.475-.627.637" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Bottom meta bar */}
            <div
              className="absolute bottom-0 inset-x-0 px-4 py-3 flex items-end justify-between"
              style={{
                background:
                  "linear-gradient(to top, oklch(0 0 0 / 0.7), transparent)",
              }}
            >
              <div>
                <p className="text-white font-black text-sm leading-tight">
                  {video.title}
                </p>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  {video.year}
                </p>
              </div>
              {!isLocal && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
                  <svg
                    className="w-3.5 h-3.5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="text-white/70 text-[9px] font-bold uppercase tracking-wider">
                    YouTube
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Description strip */}
      <div className="px-4 py-3 border-t border-white/5">
        <p className="text-[#C5C5C5]/50 text-xs leading-relaxed">
          {video.description}
        </p>
      </div>
    </div>
  );
};

const CampVideoSection = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section className="py-24 px-6 bg-[#010101]" id="moments">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5C5C5]/40 mb-3">
                Camp Memories
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-[#F1F1F1]">
                Our Moments
              </h2>
              <p className="text-[#C5C5C5]/60 mt-2 max-w-md">
                Watch highlights from our camps, worship nights, and fellowship
                gatherings across Capiz.
              </p>
            </div>
            <a
              href="https://www.youtube.com/@CAPBYFUPAGE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5C5C5]/20 text-[#C5C5C5] font-bold text-sm hover:bg-[#C5C5C5]/10 hover:text-[#F1F1F1] transition-all whitespace-nowrap flex-shrink-0"
            >
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Visit YouTube Channel
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Video centered and large */}
        <div className="flex justify-center">
          {CAMP_VIDEOS.slice(0, 1).map((video, i) => {
            const videoId = video.id || `video-${i}`;
            return (
              <motion.div
                key={videoId}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="w-full max-w-6xl mx-auto"
              >
                <VideoPlayer
                  video={video}
                  isActive={activeVideo === videoId}
                  onActivate={() => setActiveVideo(videoId)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ── Church Map Section ───────────────────────────────────────────────────────
const ChurchMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const popupsRef = useRef([]);
  const [activeCircuit, setActiveCircuit] = useState("All");
  const [mapReady, setMapReady] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);

  const visibleChurches =
    activeCircuit === "All"
      ? CHURCH_LOCATIONS
      : CHURCH_LOCATIONS.filter((c) => c.circuit === activeCircuit);

  // Load MapLibre once on mount
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const init = async () => {
      // Add MapLibre styles if not present
      if (!document.getElementById("maplibre-css")) {
        const css = document.createElement("link");
        css.id = "maplibre-css";
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
        document.head.appendChild(css);

        // Add custom popup styling override to remove maplibre's default white box
        const customCss = document.createElement("style");
        customCss.innerHTML = `
          .custom-popup .maplibregl-popup-content {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .custom-popup .maplibregl-popup-tip {
            display: none !important;
          }
        `;
        document.head.appendChild(customCss);
      }

      if (!window.maplibregl) {
        await new Promise((res) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
          s.onload = res;
          document.head.appendChild(s);
        });
      }

      mapRef.current = new window.maplibregl.Map({
        container: mapContainer.current,
        style: "https://tiles.openfreemap.org/styles/dark",
        center: [122.63, 11.41],
        zoom: 9,
        attributionControl: false,
      });

      mapRef.current.addControl(
        new window.maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );
      mapRef.current.addControl(
        new window.maplibregl.AttributionControl({ compact: true }),
        "bottom-right",
      );

      mapRef.current.on("load", () => setMapReady(true));
    };

    init();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Rebuild markers on filter or map ready
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    setSelectedChurch(null);

    // Clean up old markers and popups
    markersRef.current.forEach((m) => m.remove());
    popupsRef.current.forEach((p) => p.remove());
    markersRef.current = [];
    popupsRef.current = [];

    visibleChurches.forEach((church) => {
      const color = CIRCUIT_META[church.circuit].color;

      // Custom DOM Element for Marker
      const el = document.createElement("div");
      el.style.cssText = `
        width:13px; height:13px; border-radius:50%;
        background:${color};
        border:2.5px solid rgba(255,255,255,0.6);
        box-shadow: 0 0 0 3px ${color}33, 0 2px 6px rgba(0,0,0,0.5);
        cursor:pointer;
      `;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedChurch(church);
        mapRef.current.flyTo({
          center: [church.lng, church.lat],
          zoom: 12,
          duration: 600,
        });
      });

      const marker = new window.maplibregl.Marker({ element: el })
        .setLngLat([church.lng, church.lat])
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [mapReady, activeCircuit]);

  return (
    <section className="py-20 px-6 bg-[#010101]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-[#C5C5C5]/50 mb-4">
            Across Capiz, Philippines
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#F1F1F1]">
            Our Member Churches
          </h2>
          <p className="text-[#C5C5C5]/60 max-w-xl mx-auto text-sm leading-relaxed">
            {CHURCH_LOCATIONS.length} churches united in faith across three
            circuits in the province of Capiz.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          className="flex items-center justify-center gap-6 mb-8 flex-wrap"
        >
          {Object.entries(CIRCUIT_META).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: meta.color }}
              />
              <span className="text-[#C5C5C5]/50 text-xs font-bold">
                {meta.label}
              </span>
              <span className="text-[#F1F1F1] text-xs font-black">
                {meta.count} churches
              </span>
            </div>
          ))}
        </motion.div>

        {/* Filter pills */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {["All", "A", "B", "C"].map((c) => (
            <button
              key={c}
              onClick={() => setActiveCircuit(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                activeCircuit === c
                  ? "bg-[#C5C5C5] text-[#010101]"
                  : "bg-[#0A1614] border border-[#C5C5C5]/15 text-[#C5C5C5]/50 hover:border-[#C5C5C5]/40 hover:text-[#C5C5C5]"
              }`}
            >
              {c === "All" ? (
                "All Circuits"
              ) : (
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: CIRCUIT_META[c].color,
                      display: "inline-block",
                    }}
                  />
                  Circuit {c}
                </span>
              )}
            </button>
          ))}
          <span className="text-[#C5C5C5]/25 text-xs font-bold pl-2">
            {visibleChurches.length} shown
          </span>
        </div>

        {/* Map */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={2}
          className="relative rounded-2xl overflow-hidden border border-[#C5C5C5]/10 shadow-2xl shadow-black/50"
          style={{ height: "520px" }}
        >
          <div
            ref={mapContainer}
            style={{ width: "100%", height: "100%" }}
            onClick={() => setSelectedChurch(null)}
          />

          {/* Church info panel — slides in on marker click */}
          <AnimatePresence>
            {selectedChurch && (
              <motion.div
                key={selectedChurch.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-5 right-5 z-30 w-72"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="bg-[#0A1614]/95 backdrop-blur-md border rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    borderColor: `${CIRCUIT_META[selectedChurch.circuit].color}40`,
                  }}
                >
                  {/* Colored top bar */}
                  <div
                    className="h-1 w-full"
                    style={{
                      background: CIRCUIT_META[selectedChurch.circuit].color,
                    }}
                  />
                  <div className="p-4">
                    {/* Circuit badge + close */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{
                          color: CIRCUIT_META[selectedChurch.circuit].color,
                          background: `${CIRCUIT_META[selectedChurch.circuit].color}15`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background:
                              CIRCUIT_META[selectedChurch.circuit].color,
                            display: "inline-block",
                          }}
                        />
                        {CIRCUIT_META[selectedChurch.circuit].label}
                      </span>
                      <button
                        onClick={() => setSelectedChurch(null)}
                        className="text-[#C5C5C5]/40 hover:text-[#C5C5C5] transition-colors p-1 rounded-lg hover:bg-[#C5C5C5]/10"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
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

                    {/* Church name */}
                    <h3 className="text-[#F1F1F1] font-black text-sm leading-snug mb-3">
                      {selectedChurch.name}
                    </h3>

                    {/* Address row */}
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-3.5 h-3.5 text-[#C5C5C5]/40 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                      <p className="text-[#C5C5C5]/60 text-xs leading-relaxed">
                        {selectedChurch.address}
                      </p>
                    </div>

                    {/* Coordinates */}
                    <div className="flex items-center gap-2 mt-2">
                      <svg
                        className="w-3.5 h-3.5 text-[#C5C5C5]/40 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                        />
                      </svg>
                      <p className="text-[#C5C5C5]/30 text-[10px] font-mono">
                        {selectedChurch.lat.toFixed(4)}°N,{" "}
                        {selectedChurch.lng.toFixed(4)}°E
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend overlay */}
          <div className="absolute bottom-5 left-5 z-20 bg-[#0A1614]/90 backdrop-blur-sm border border-[#C5C5C5]/15 rounded-xl px-4 py-3 flex flex-col gap-2">
            {Object.entries(CIRCUIT_META).map(([key, meta]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: meta.color }}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/60">
                  {meta.label}
                </span>
                <span className="text-[10px] font-black text-[#C5C5C5]/40 ml-1">
                  {meta.count}
                </span>
              </div>
            ))}
          </div>

          {/* Loading state */}
          {!mapReady && (
            <div className="absolute inset-0 bg-[#0A1614] flex flex-col items-center justify-center gap-3 z-10">
              <div className="w-9 h-9 rounded-full border-2 border-[#C5C5C5]/15 border-t-[#C5C5C5]/70 animate-spin" />
              <p className="text-[#C5C5C5]/40 text-xs font-black uppercase tracking-widest">
                Loading map…
              </p>
            </div>
          )}
        </motion.div>

        {/* Church list summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(CIRCUIT_META).map(([key, meta]) => (
            <div
              key={key}
              className="bg-[#0A1614] border border-[#C5C5C5]/10 rounded-xl p-4 hover:border-[#C5C5C5]/20 transition-colors cursor-pointer"
              onClick={() =>
                setActiveCircuit(activeCircuit === key ? "All" : key)
              }
              style={{ borderLeftColor: meta.color, borderLeftWidth: 3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
                <span className="text-xs text-[#C5C5C5]/40 font-bold">
                  {meta.count} churches
                </span>
              </div>
              <div className="space-y-1">
                {CHURCH_LOCATIONS.filter((c) => c.circuit === key).map((c) => (
                  <p
                    key={c.id}
                    className="text-[10px] text-[#C5C5C5]/50 font-medium leading-relaxed truncate"
                  >
                    {c.name}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPage;