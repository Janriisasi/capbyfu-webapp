import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "../../lib/supabase";

// ─── palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#04080f",
  card: "#080f1a",
  border: "rgba(0,200,120,0.12)",
  green: "#00c878",
  blue: "#38bdf8",
  amber: "#f59e0b",
  red: "#f43f5e",
  purple: "#a78bfa",
  text: "#e2f0eb",
  muted: "rgba(226,240,235,0.45)",
  dim: "rgba(226,240,235,0.18)",
};

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString();
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : "0.0");
const ago = (ts) => {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// ─── card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, className = "", glow }) => (
  <div
    className={`rounded-2xl border p-5 ${className}`}
    style={{
      background: C.card,
      borderColor: glow ? `${glow}30` : C.border,
      boxShadow: glow ? `0 0 24px ${glow}12` : "none",
    }}
  >
    {children}
  </div>
);

// ─── stat tile ────────────────────────────────────────────────────────────────
const StatTile = ({ label, value, sub, color, icon }) => (
  <Card glow={color}>
    <div className="flex items-start justify-between mb-3">
      <p
        className="text-[10px] font-black uppercase tracking-[0.2em]"
        style={{ color: C.muted }}
      >
        {label}
      </p>
      <span className="text-lg">{icon}</span>
    </div>
    <p className="text-3xl font-black tabular-nums" style={{ color }}>
      {value}
    </p>
    {sub && (
      <p className="text-xs mt-1.5" style={{ color: C.muted }}>
        {sub}
      </p>
    )}
  </Card>
);

// ─── section header ───────────────────────────────────────────────────────────
const SectionHead = ({ title, sub }) => (
  <div className="mb-4">
    <h2
      className="text-sm font-black uppercase tracking-[0.18em]"
      style={{ color: C.green }}
    >
      {title}
    </h2>
    {sub && (
      <p className="text-xs mt-0.5" style={{ color: C.muted }}>
        {sub}
      </p>
    )}
  </div>
);

// ─── custom tooltip ───────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs"
      style={{ background: C.card, borderColor: C.border }}
    >
      <p className="font-bold mb-1" style={{ color: C.text }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <b>{fmt(p.value)}</b>
        </p>
      ))}
    </div>
  );
};

// ─── main component ───────────────────────────────────────────────────────────
const DevDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);

  // raw data
  const [delegates, setDelegates] = useState([]);
  const [churches, setChurches] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // derived
  const [regByDay, setRegByDay] = useState([]);
  const [circuitStats, setCircuitStats] = useState([]);
  const [payStats, setPayStats] = useState([]);
  const [roleStats, setRoleStats] = useState([]);
  const [churchRank, setChurchRank] = useState([]);
  const [hourHeat, setHourHeat] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // ── fetch all ────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);

    const [{ data: del }, { data: chu }, { data: ann }] = await Promise.all([
      supabase
        .from("delegates")
        .select("*, churches(name, circuit)")
        .order("created_at", { ascending: true }),
      supabase.from("churches").select("*"),
      supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    const D = del || [];
    const Ch = chu || [];
    const An = ann || [];

    setDelegates(D);
    setChurches(Ch);
    setAnnouncements(An);

    // ── registrations per day (last 30 days) ─────────────────────────────
    const dayMap = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { date: key, total: 0, paid: 0, pending: 0 };
    }
    D.forEach((d) => {
      const key = d.created_at?.slice(0, 10);
      if (dayMap[key]) {
        dayMap[key].total++;
        if (d.payment_status === "Paid") dayMap[key].paid++;
        else dayMap[key].pending++;
      }
    });
    const dayArr = Object.values(dayMap).map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
    setRegByDay(dayArr);

    // ── circuit breakdown ─────────────────────────────────────────────────
    const circMap = { A: 0, B: 0, C: 0, Visiting: 0 };
    D.forEach((d) => {
      const c = d.churches?.circuit;
      if (c) circMap[c] = (circMap[c] || 0) + 1;
    });
    setCircuitStats([
      { name: "Circuit A", value: circMap.A, color: C.green },
      { name: "Circuit B", value: circMap.B, color: C.blue },
      { name: "Circuit C", value: circMap.C, color: C.amber },
      { name: "Visiting", value: circMap.Visiting, color: C.purple },
    ]);

    // ── payment status ────────────────────────────────────────────────────
    const paid = D.filter((d) => d.payment_status === "Paid").length;
    const pending = D.length - paid;
    setPayStats([
      { name: "Paid", value: paid, color: C.green },
      { name: "Pending", value: pending, color: C.amber },
    ]);

    // ── role breakdown ────────────────────────────────────────────────────
    const roleMap = {};
    D.forEach((d) => {
      roleMap[d.role] = (roleMap[d.role] || 0) + 1;
    });
    setRoleStats(
      Object.entries(roleMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    );

    // ── top churches by registrations ─────────────────────────────────────
    const chMap = {};
    D.forEach((d) => {
      const n = d.churches?.name || "Unknown";
      if (!chMap[n]) chMap[n] = { name: n, total: 0, paid: 0 };
      chMap[n].total++;
      if (d.payment_status === "Paid") chMap[n].paid++;
    });
    setChurchRank(
      Object.values(chMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map((c) => ({
          ...c,
          shortName: c.name
            .replace(/ Baptist| Evangelical| Christian| Church| Inc\.?/gi, "")
            .trim()
            .slice(0, 22),
        })),
    );

    // ── hour-of-day heatmap ───────────────────────────────────────────────
    const hMap = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: 0,
    }));
    D.forEach((d) => {
      const h = new Date(d.created_at).getHours();
      hMap[h].count++;
    });
    setHourHeat(hMap);

    // ── recent activity feed ──────────────────────────────────────────────
    const recent = [...D]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 12);
    setRecentActivity(recent);

    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchAll, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchAll]);

  // ── derived stats ─────────────────────────────────────────────────────────
  const totalDelegates = delegates.length;
  const totalPaid = delegates.filter((d) => d.payment_status === "Paid").length;
  const totalPending = totalDelegates - totalPaid;
  const totalMerch = delegates.filter((d) => d.include_merch).length;
  const totalChurches = churches.filter((c) => c.circuit !== "Visiting").length;
  const churchesReg = new Set(delegates.map((d) => d.church_id)).size;
  const todayCount = delegates.filter(
    (d) => d.created_at?.slice(0, 10) === new Date().toISOString().slice(0, 10),
  ).length;
  const peakDay = regByDay.reduce((max, d) => (d.total > max.total ? d : max), {
    total: 0,
    label: "—",
  });
  const totalRevenue = delegates
    .filter((d) => d.payment_status === "Paid")
    .reduce((s, d) => {
      const ch = churches.find((c) => c.id === d.church_id);
      return (
        s +
        (ch?.registration_fee || 160) +
        (d.include_merch ? ch?.merch_fee || 200 : 0)
      );
    }, 0);

  // ── loading skeleton ──────────────────────────────────────────────────────
  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: C.green, borderTopColor: "transparent" }}
          />
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: C.muted }}
          >
            Loading dev console…
          </p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen font-mono"
      style={{ background: C.bg, color: C.text }}
    >
      {/* ── top bar ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 border-b flex items-center justify-between px-6 py-3"
        style={{
          background: `${C.bg}ee`,
          borderColor: C.border,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: C.green }}
          />
          <span
            className="text-xs font-black uppercase tracking-[0.25em]"
            style={{ color: C.green }}
          >
            DEV CONSOLE
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border font-bold"
            style={{ borderColor: C.border, color: C.muted }}
          >
            CapBYFU · Internal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px]" style={{ color: C.dim }}>
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className="text-[10px] font-bold px-3 py-1 rounded-full border transition-all"
            style={{
              borderColor: autoRefresh ? C.green : C.border,
              color: autoRefresh ? C.green : C.muted,
              background: autoRefresh ? `${C.green}10` : "transparent",
            }}
          >
            {autoRefresh ? "● AUTO" : "○ MANUAL"}
          </button>
          <button
            onClick={fetchAll}
            className="text-[10px] font-bold px-3 py-1 rounded-full border transition-all hover:opacity-80"
            style={{ borderColor: C.border, color: C.muted }}
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      <div className="px-6 py-8 max-w-[1600px] mx-auto space-y-10">
        {/* ── KPI row ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SectionHead
            title="Overview"
            sub="Real-time snapshot from Supabase"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <StatTile
              label="Total Delegates"
              value={fmt(totalDelegates)}
              color={C.green}
              icon="👥"
            />
            <StatTile
              label="Paid"
              value={fmt(totalPaid)}
              color={C.green}
              icon="✅"
              sub={`${pct(totalPaid, totalDelegates)}%`}
            />
            <StatTile
              label="Pending"
              value={fmt(totalPending)}
              color={C.amber}
              icon="⏳"
              sub={`${pct(totalPending, totalDelegates)}%`}
            />
            <StatTile
              label="With Merch"
              value={fmt(totalMerch)}
              color={C.purple}
              icon="👕"
              sub={`${pct(totalMerch, totalDelegates)}%`}
            />
            <StatTile
              label="Revenue"
              value={`₱${fmt(totalRevenue)}`}
              color={C.green}
              icon="💰"
            />
            <StatTile
              label="Churches Active"
              value={`${churchesReg}/${totalChurches}`}
              color={C.blue}
              icon="⛪"
              sub="registered / total"
            />
            <StatTile
              label="Today"
              value={fmt(todayCount)}
              color={C.blue}
              icon="📅"
              sub="new today"
            />
            <StatTile
              label="Peak Day"
              value={fmt(peakDay.total)}
              color={C.amber}
              icon="📈"
              sub={peakDay.label}
            />
          </div>
        </motion.div>

        {/* ── registrations over time ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionHead
            title="Registration Activity"
            sub="Delegates registered per day — last 30 days"
          />
          <Card>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={regByDay}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.blue} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: C.muted, fontSize: 9 }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: C.muted, fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: C.muted }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke={C.green}
                  fill="url(#gTotal)"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="paid"
                  name="Paid"
                  stroke={C.blue}
                  fill="url(#gPaid)"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke={C.amber}
                  fill="none"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="4 2"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* ── middle row: donut charts + bar charts ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* payment donut */}
            <Card>
              <SectionHead title="Payment Status" />
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={payStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {payStats.map((e, i) => (
                      <Cell key={i} fill={e.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 10, color: C.muted }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-1">
                <p className="text-2xl font-black" style={{ color: C.green }}>
                  {pct(totalPaid, totalDelegates)}%
                </p>
                <p className="text-[10px]" style={{ color: C.muted }}>
                  payment rate
                </p>
              </div>
            </Card>

            {/* circuit donut */}
            <Card>
              <SectionHead title="By Circuit" />
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={circuitStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {circuitStats.map((e, i) => (
                      <Cell key={i} fill={e.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 10, color: C.muted }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {circuitStats.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: c.color }}
                    />
                    <span className="text-[10px]" style={{ color: C.muted }}>
                      {c.name}: <b style={{ color: C.text }}>{c.value}</b>
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* role breakdown */}
            <Card>
              <SectionHead title="By Role" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={roleStats}
                  layout="vertical"
                  margin={{ left: 0, right: 8 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: C.muted, fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: C.muted, fontSize: 9 }}
                    width={72}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTip />} />
                  <Bar
                    dataKey="value"
                    name="Count"
                    radius={[0, 4, 4, 0]}
                    fill={C.blue}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </motion.div>

        {/* ── hourly heatmap ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHead
            title="Hour-of-Day Activity"
            sub="When delegates register (all time)"
          />
          <Card>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={hourHeat}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={C.border}
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: C.muted, fontSize: 8 }}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fill: C.muted, fontSize: 8 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="count" name="Registrations" radius={[3, 3, 0, 0]}>
                  {hourHeat.map((e, i) => (
                    <Cell
                      key={i}
                      fill={
                        e.count === Math.max(...hourHeat.map((h) => h.count))
                          ? C.green
                          : `${C.green}40`
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* ── top churches bar ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <SectionHead title="Top Churches by Registrations" sub="Top 10" />
          <Card>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={churchRank}
                margin={{ top: 4, right: 4, bottom: 40, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={C.border}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="shortName"
                  tick={{
                    fill: C.muted,
                    fontSize: 8,
                    angle: -30,
                    textAnchor: "end",
                  }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: C.muted, fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: C.muted }} />
                <Bar
                  dataKey="total"
                  name="Total"
                  radius={[3, 3, 0, 0]}
                  fill={C.blue}
                />
                <Bar
                  dataKey="paid"
                  name="Paid"
                  radius={[3, 3, 0, 0]}
                  fill={C.green}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* ── bottom row: activity feed + church table ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* recent activity feed */}
            <div>
              <SectionHead
                title="Live Activity Feed"
                sub="12 most recent registrations"
              />
              <Card className="overflow-hidden">
                <div
                  className="space-y-0 divide-y"
                  style={{ borderColor: C.border }}
                >
                  {recentActivity.map((d, i) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-3 py-2.5 px-1"
                      style={{ borderColor: C.border }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                        style={{ background: `${C.green}20`, color: C.green }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-bold truncate"
                          style={{ color: C.text }}
                        >
                          {d.full_name}
                        </p>
                        <p
                          className="text-[10px] truncate"
                          style={{ color: C.muted }}
                        >
                          {d.churches?.name} · {d.role}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full`}
                          style={{
                            background:
                              d.payment_status === "Paid"
                                ? `${C.green}20`
                                : `${C.amber}20`,
                            color:
                              d.payment_status === "Paid" ? C.green : C.amber,
                          }}
                        >
                          {d.payment_status}
                        </span>
                        <p
                          className="text-[9px] mt-0.5"
                          style={{ color: C.dim }}
                        >
                          {ago(d.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p
                      className="text-xs py-6 text-center"
                      style={{ color: C.muted }}
                    >
                      No registrations yet
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* church registration status table */}
            <div>
              <SectionHead
                title="Church Registration Status"
                sub="All circuits — sorted by delegate count"
              />
              <Card className="overflow-hidden p-0">
                <div className="overflow-y-auto" style={{ maxHeight: 460 }}>
                  <table className="w-full text-left">
                    <thead
                      className="sticky top-0"
                      style={{ background: C.card }}
                    >
                      <tr
                        className="text-[9px] font-black uppercase tracking-widest"
                        style={{ color: C.muted }}
                      >
                        <th className="px-4 py-3">Church</th>
                        <th className="px-4 py-3">Ckt</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Paid</th>
                        <th className="px-4 py-3 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ borderColor: C.border }}
                    >
                      {churchRank
                        .concat(
                          churches
                            .filter(
                              (c) =>
                                c.circuit !== "Visiting" &&
                                !churchRank.find((r) => r.name === c.name),
                            )
                            .map((c) => ({
                              name: c.name,
                              shortName: c.name.slice(0, 22),
                              total: 0,
                              paid: 0,
                            })),
                        )
                        .map((c, i) => (
                          <tr
                            key={i}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <td
                              className="px-4 py-2 text-[10px] font-bold max-w-[160px] truncate"
                              style={{ color: C.text }}
                            >
                              {c.name}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className="text-[9px] font-black px-1.5 py-0.5 rounded"
                                style={{
                                  background:
                                    c.circuit === "A"
                                      ? `${C.green}20`
                                      : c.circuit === "B"
                                        ? `${C.blue}20`
                                        : `${C.amber}20`,
                                  color:
                                    c.circuit === "A"
                                      ? C.green
                                      : c.circuit === "B"
                                        ? C.blue
                                        : C.amber,
                                }}
                              >
                                {c.circuit || "?"}
                              </span>
                            </td>
                            <td
                              className="px-4 py-2 text-[10px] font-black text-right"
                              style={{ color: C.text }}
                            >
                              {c.total}
                            </td>
                            <td
                              className="px-4 py-2 text-[10px] font-black text-right"
                              style={{ color: C.green }}
                            >
                              {c.paid}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <div
                                  className="w-14 h-1.5 rounded-full overflow-hidden"
                                  style={{ background: `${C.green}20` }}
                                >
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${pct(c.paid, c.total || 1)}%`,
                                      background: C.green,
                                    }}
                                  />
                                </div>
                                <span
                                  className="text-[9px] w-8 text-right"
                                  style={{ color: C.muted }}
                                >
                                  {pct(c.paid, c.total || 1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* ── announcements + storage info ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* announcement stats */}
            <div className="md:col-span-1">
              <SectionHead title="Announcements" />
              <Card>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px]" style={{ color: C.muted }}>
                      Total posts
                    </span>
                    <span
                      className="text-lg font-black"
                      style={{ color: C.text }}
                    >
                      {announcements.length}
                    </span>
                  </div>
                  {["Event", "News", "Blog", "Announcement"].map((cat) => {
                    const cnt = announcements.filter(
                      (a) => a.category === cat,
                    ).length;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span style={{ color: C.muted }}>{cat}</span>
                          <span style={{ color: C.text }}>{cnt}</span>
                        </div>
                        <div
                          className="h-1 rounded-full"
                          style={{ background: `${C.green}20` }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct(cnt, announcements.length || 1)}%`,
                              background: C.green,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* merch stats */}
            <div className="md:col-span-1">
              <SectionHead title="Merchandise" />
              <Card>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px]" style={{ color: C.muted }}>
                      Merch orders
                    </span>
                    <span
                      className="text-lg font-black"
                      style={{ color: C.purple }}
                    >
                      {totalMerch}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px]" style={{ color: C.muted }}>
                      No merch
                    </span>
                    <span
                      className="text-lg font-black"
                      style={{ color: C.muted }}
                    >
                      {totalDelegates - totalMerch}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: `${C.purple}20` }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct(totalMerch, totalDelegates || 1)}%`,
                        background: C.purple,
                      }}
                    />
                  </div>
                  <p className="text-[10px]" style={{ color: C.muted }}>
                    {pct(totalMerch, totalDelegates)}% ordered merch
                  </p>
                  {["Camper", "Facilitator", "Camp Staff"].map((role) => {
                    const withMerch = delegates.filter(
                      (d) => d.role === role && d.include_merch,
                    ).length;
                    const roleTotal = delegates.filter(
                      (d) => d.role === role,
                    ).length;
                    return (
                      <div
                        key={role}
                        className="flex justify-between text-[10px]"
                      >
                        <span style={{ color: C.muted }}>{role}</span>
                        <span style={{ color: C.text }}>
                          {withMerch}/{roleTotal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* system info */}
            <div className="md:col-span-1">
              <SectionHead title="System" />
              <Card>
                <div className="space-y-3 text-[10px]">
                  {[
                    { label: "Database", val: "Supabase PostgreSQL", ok: true },
                    { label: "Auth", val: "bcrypt + RPC", ok: true },
                    { label: "Storage", val: "Supabase Storage", ok: true },
                    {
                      label: "Churches",
                      val: `${churches.length} rows`,
                      ok: true,
                    },
                    {
                      label: "Delegates",
                      val: `${totalDelegates} rows`,
                      ok: true,
                    },
                    {
                      label: "Announcements",
                      val: `${announcements.length} rows`,
                      ok: true,
                    },
                    {
                      label: "Auto-refresh",
                      val: autoRefresh ? "ON (30s)" : "OFF",
                      ok: autoRefresh,
                    },
                  ].map(({ label, val, ok }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <span style={{ color: C.muted }}>{label}</span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: ok ? C.green : C.amber }}
                        />
                        <span style={{ color: C.text }}>{val}</span>
                      </div>
                    </div>
                  ))}
                  <div
                    className="pt-2 border-t"
                    style={{ borderColor: C.border }}
                  >
                    <p style={{ color: C.dim }}>Built with React + Supabase</p>
                    <p style={{ color: C.dim }}>
                      © CapBYFU {new Date().getFullYear()} — Dev Only
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DevDashboard;
