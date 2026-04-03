import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import AdminLayout from "../../components/adminLayout";
import { supabase, uploadFile } from "../../lib/supabase";
import { CHURCHES } from "../../lib/constants";
import ImageViewerModal from "../../components/imageviewerModal";

// ── Reusable Custom Dropdown ────────────────────────────────────────────────
const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select…",
  renderOption,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(
    (o) => (typeof o === "string" ? o : o.value) === value,
  );
  const label = selected
    ? renderOption
      ? renderOption(selected, true)
      : typeof selected === "string"
        ? selected
        : selected.label
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm text-left transition-all ${
          open
            ? "border-[#C5C5C5]/60 ring-2 ring-[#C5C5C5]/20 bg-[#0A1614]"
            : "border-[#C5C5C5]/20 bg-[#0A1614] hover:border-[#C5C5C5]/40"
        }`}
      >
        <span
          className={value ? "text-[#F1F1F1] font-medium" : "text-[#C5C5C5]/50"}
        >
          {label || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[#C5C5C5]/60 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{ transformOrigin: "top" }}
            className="absolute z-50 mt-1.5 w-full bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-52 overflow-y-auto py-1">
              {options.map((opt) => {
                const val = typeof opt === "string" ? opt : opt.value;
                const isSelected = val === value;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      onChange(val);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3.5 py-2 text-sm text-left transition-colors ${
                      isSelected
                        ? "bg-[#C5C5C5]/15 text-[#F1F1F1] font-semibold"
                        : "text-[#C5C5C5] hover:bg-[#C5C5C5]/10 hover:text-[#F1F1F1]"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0 text-[#C5C5C5]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                    <span className={isSelected ? "" : "pl-[22px]"}>
                      {renderOption
                        ? renderOption(opt)
                        : typeof opt === "string"
                          ? opt
                          : opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChurchFeeStatusMenu = ({ church, onClose, onUpdateStatus }) => {
  const ref = useRef(null);
  const currentStatus = church?.church_fee_status || "Pending";

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = [
    { label: "Paid",            value: "Paid",                      icon: "check_circle",    color: "text-green-400", bg: "bg-green-400" },
    { label: "Pending",         value: "Pending",                   icon: "schedule",        color: "text-amber-400", bg: "bg-amber-400" },
    { label: "Invalid Proof",   value: "Invalid Proof of Payment",  icon: "error",           color: "text-red-400",   bg: "bg-red-400" },
  ];

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-2 z-[60] bg-[#0A1614] border border-[#C5C5C5]/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2.5 min-w-[210px] backdrop-blur-xl overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-[#C5C5C5]/10 mb-1.5 grow">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#C5C5C5]/30">Update Church Fee</p>
      </div>
      {options.map((opt) => {
        const isActive = currentStatus === opt.value;
        return (
          <button
            key={opt.value}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(church.id, opt.value);
              onClose();
            }}
            className={`flex items-center justify-between w-full px-4 py-2.5 text-xs transition-all hover:bg-[#C5C5C5]/10 group ${
              isActive ? "bg-[#C5C5C5]/5 text-[#F1F1F1]" : "text-[#C5C5C5]/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${opt.bg} ${isActive ? "scale-110" : "scale-100 opacity-60"} transition-all`} />
              <span className={`font-bold tracking-wide ${isActive ? "" : "group-hover:text-[#C5C5C5]"}`}>{opt.label}</span>
            </div>
            {isActive && (
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
};

const ContextMenu = ({ delegate, onClose, onDelete, onUpdateStatus, direction = "down", showDelete = true }) => {
  const ref = useRef(null);
  const currentStatus = delegate?.payment_status;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const statuses = [
    { label: "Paid", value: "Paid", icon: "check_circle", color: "text-green-400" },
    { label: "Pending", value: "Pending", icon: "schedule", color: "text-amber-400" },
    { label: "Invalid Consent", value: "Invalid Consent", icon: "assignment_late", color: "text-red-400" },
    { label: "Invalid Payment", value: "Invalid Payment", icon: "payments", color: "text-red-400" },
    { label: "Missing / Invalid Picture", value: "Missing / Invalid Picture", icon: "image_not_supported", color: "text-red-400" },
  ];

  return (
    <div
      ref={ref}
      className={`absolute right-0 top-full mt-1.5 z-50 bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl shadow-2xl py-1.5 min-w-[200px] max-h-72 overflow-y-auto`}
    >
      <p className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#C5C5C5]/40">Update Status</p>
      {statuses.map((s) => {
        const isActive = currentStatus === s.value || (currentStatus?.split(", ").includes(s.value));
        return (
          <button
            key={s.value}
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(delegate, s.value);
          }}
          className={`flex items-center justify-between w-full px-3 py-1.5 text-xs transition-colors hover:bg-[#C5C5C5]/10 ${
            isActive ? "text-[#F1F1F1] bg-[#C5C5C5]/5" : "text-[#C5C5C5]/70"
          }`}
        >
          <div className="flex items-center gap-2">
             <span className={`material-symbols-outlined text-[15px] ${s.color}`}>{s.icon}</span>
             <span className={isActive ? "font-bold" : ""}>{s.label}</span>
          </div>
          {isActive && (
            <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </button>
        );
      })}

      <div className="my-1 border-t border-[#C5C5C5]/10" />
      
      {!showDelete ? null : currentStatus === "Paid" ? (
        <div className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#C5C5C5]/30 cursor-not-allowed italic">
          <span className="material-symbols-outlined text-[15px]">lock</span>
          Cannot Delete (Paid)
        </div>
      ) : (
        <button
          onClick={onDelete}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">delete</span>
          Delete Delegate
        </button>
      )}
    </div>
  );
};

const toLocalDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIsoString = (localString) => {
  if (!localString) return null;
  const d = new Date(localString);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    cash: 0,
    online: 0,
    churches: 0,
    cashTotal: 0,
    onlineTotal: 0,
    churchCounts: {},
  });
  const [delegates, setDelegates] = useState([]);
  const [churches, setChurches] = useState([]);
  const [visitingGroups, setVisitingGroups] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [openVisitMenu, setOpenVisitMenu] = useState(null);
  const [openFeeMenu, setOpenFeeMenu] = useState(null); // church id
  const [page, setPage] = useState(0);
  const [viewerImage, setViewerImage] = useState(null); // { url, title }
  const [globalSettings, setGlobalSettings] = useState({
    id: 1,
    registration_mode: "auto",
    manual_status: "open",
    auto_start_date: "",
    auto_end_date: "",
    camp_date: "",
    camp_label: "",
    payment_qr_url: "",
    payment_name: "",
    payment_number: "",
    consent_template_url: "",
  });
  const [qrUploading, setQrUploading] = useState(false);
  const [consentUploading, setConsentUploading] = useState(false);
  const PAGE_SIZE = 5;

  useEffect(() => {
    fetchAll();
  }, [filter, page]);

  const fetchAll = async () => {
    setLoading(true);
    // Stats
    const { data: allDelegates } = await supabase
      .from("delegates")
      .select("id, church_id, role, payment_method, payment_status, include_merch");

    const { data: churchSettings } = await supabase
      .from("churches")
      .select("id, registration_fee, merch_fee, staff_discount_fee, church_fee, church_fee_status");

    const settingsMap = (churchSettings || []).reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    // Church registration status
    const { data: churchData } = await supabase
      .from("churches")
      .select(
        "id, name, circuit, registration_fee, merch_fee, staff_discount_fee, drive_link, church_fee, church_fee_payment_url, church_fee_status",
      );
    setChurches(churchData || []);

    if (allDelegates) {
      const cashDelegates = allDelegates.filter(
        (d) => d.payment_method === "Cash" || d.payment_method === "Free",
      );
      const onlineDelegates = allDelegates.filter(
        (d) => d.payment_method !== "Cash" && d.payment_method !== "Free",
      );
      const uniqueChurches = new Set(allDelegates.map((d) => d.church_id)).size;

      const calcAmount = (d) => {
        const s = settingsMap[d.church_id];
        if (!s) return 0;
        
        // Roles with 0 reg fee
        if (d.role === "Pastor" || d.role === "Guardian") {
          return d.include_merch ? (s.merch_fee || 200) : 0;
        }
        
        // Roles with potential discount
        let regFee = s.registration_fee || 160;
        if ((d.role === "Camp Staff" || d.role === "Facilitator") && s.staff_discount_fee != null) {
          regFee = s.staff_discount_fee;
        }
        
        return regFee + (d.include_merch ? (s.merch_fee || 200) : 0);
      };

      const cashTotal = cashDelegates
        .filter((d) => d.payment_status === "Paid")
        .reduce((sum, d) => sum + calcAmount(d), 0);

      const churchFeesPaid = (churchSettings || [])
        .filter(c => c.church_fee_status === "Paid")
        .reduce((sum, c) => sum + (c.church_fee || 0), 0);

      const onlineTotal = onlineDelegates
        .filter((d) => d.payment_status === "Paid")
        .reduce((sum, d) => sum + calcAmount(d), 0) + churchFeesPaid;
        
      const churchDataMap = (churchData || []).reduce((acc, c) => {
        acc[c.id] = c.name;
        return acc;
      }, {});
      const delegateCounts = allDelegates.reduce((acc, d) => {
        const churchName = churchDataMap[d.church_id];
        if (!churchName) return acc;
        if (!acc[churchName]) acc[churchName] = { total: 0, paid: 0 };
        acc[churchName].total++;
        if (d.payment_status === "Paid") acc[churchName].paid++;
        return acc;
      }, {});

      setStats({
        total: allDelegates.length,
        cash: cashDelegates.length,
        online: onlineDelegates.length,
        churches: uniqueChurches,
        cashTotal,
        onlineTotal,
        churchCounts: delegateCounts,
      });
    }

    // Global App Settings
    const { data: appSettings } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (appSettings) {
      setGlobalSettings({
        ...appSettings,
        auto_start_date: toLocalDatetimeLocal(appSettings.auto_start_date),
        auto_end_date: toLocalDatetimeLocal(appSettings.auto_end_date),
        camp_date: toLocalDatetimeLocal(appSettings.camp_date),
      });
    }

    // Delegates table
    let query = supabase
      .from("delegates")
      .select("*, churches(name, circuit)")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filter !== "All") query = query.eq("payment_status", filter);
    const { data: delegateData } = await query;
    setDelegates(delegateData || []);

    // Visiting churches — grouped with their delegates
    const visitingChurches = (churchData || []).filter(c => c.circuit === "Visiting");
    if (visitingChurches.length > 0) {
      const visitingIds = visitingChurches.map(c => c.id);
      const { data: visitingDelegates } = await supabase
        .from("delegates")
        .select("*, churches(name, circuit)")
        .in("church_id", visitingIds)
        .order("created_at", { ascending: false });
      const grouped = visitingChurches.map(church => ({
        church,
        delegates: (visitingDelegates || []).filter(d => d.church_id === church.id),
      })).filter(g => g.delegates.length > 0);
      setVisitingGroups(grouped);
    } else {
      setVisitingGroups([]);
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    const delegate = delegates.find(d => d.id === id) ||
      visitingGroups.flatMap(g => g.delegates).find(d => d.id === id);
    if (delegate?.payment_status === "Paid") {
      toast.error("Cannot delete a delegate with Paid status.");
      setOpenMenu(null);
      setOpenVisitMenu(null);
      return;
    }
    if (!confirm("Delete this delegate? This cannot be undone.")) return;
    const { error } = await supabase.from("delegates").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Delegate deleted");
    setDelegates((prev) => prev.filter((d) => d.id !== id));
    setVisitingGroups((prev) =>
      prev.map((g) => ({ ...g, delegates: g.delegates.filter((d) => d.id !== id) }))
          .filter((g) => g.delegates.length > 0)
    );
    setOpenMenu(null);
    setOpenVisitMenu(null);
  };

  const handleUpdateStatus = async (delegate, newStatus) => {
    let finalStatus = "";
    const current = delegate.payment_status || "Pending";

    if (newStatus === "Paid" || newStatus === "Pending") {
      finalStatus = newStatus;
    } else {
      let flags =
        current === "Paid" || current === "Pending"
          ? []
          : current.split(", ").filter(Boolean);

      if (flags.includes(newStatus)) {
        flags = flags.filter((f) => f !== newStatus);
      } else {
        flags.push(newStatus);
      }
      finalStatus = flags.length > 0 ? flags.join(", ") : "Pending";
    }

    const { error } = await supabase
      .from("delegates")
      .update({ payment_status: finalStatus })
      .eq("id", delegate.id);

    if (error) {
      toast.error("Update failed");
      return;
    }
    toast.success(`Status updated to ${finalStatus}`);
    
    const updater = (prev) =>
      prev.map((d) =>
        d.id === delegate.id ? { ...d, payment_status: finalStatus } : d
      );

    setDelegates(updater);
    setVisitingGroups((prev) =>
      prev.map((g) => ({
        ...g,
        delegates: updater(g.delegates),
      }))
    );

    if (newStatus === "Paid" || newStatus === "Pending") {
      setOpenMenu(null);
      setOpenVisitMenu(null);
    }
  };

  const handleDriveLinkUpdate = async (churchId, link) => {
    const { error } = await supabase
      .from("churches")
      .update({ drive_link: link })
      .eq("id", churchId);
    if (error) toast.error("Update failed");
    else toast.success("Drive link updated");
  };

  const handleFeeUpdate = async (churchId, field, value) => {
    const { error } = await supabase
      .from("churches")
      .update({ [field]: parseInt(value) })
      .eq("id", churchId);
    if (error) toast.error("Update failed");
    else toast.success("Fee updated");
  };

  const handleChurchFeeStatusUpdate = async (churchId, status) => {
    const { error } = await supabase
      .from("churches")
      .update({ church_fee_status: status })
      .eq("id", churchId);
    if (error) toast.error("Update failed");
    else {
      toast.success("Church fee status updated");
      setChurches(prev => prev.map(c => c.id === churchId ? { ...c, church_fee_status: status } : c));
    }
  };

  const handleBulkFeeUpdate = async (field, value) => {
    // For staff_discount_fee, empty string means remove the discount (null)
    const parsed = value === "" || value === null ? null : parseInt(value);
    if (parsed !== null && (isNaN(parsed) || parsed < 0)) { toast.error("Enter a valid amount"); return; }
    const updateValue = parsed;
    // staff_discount_fee applies to ALL churches (including Visiting); reg/merch fees skip Visiting
    // Note: Supabase REST blocks unfiltered UPDATEs, so use neq on a dummy non-existent value for "all"
    const query = supabase.from("churches").update({ [field]: updateValue });
    const { error } = (field === "staff_discount_fee" || field === "church_fee")
      ? await query.neq("circuit", "__none__")   // matches all rows (no church has circuit "__none__")
      : await query.neq("circuit", "Visiting");
    if (error) toast.error("Failed to update.");
    else {
      const label = field === "registration_fee" ? "reg fees" : field === "merch_fee" ? "merch fees" : "staff & facilitator fees";
      toast.success(updateValue === null ? `Staff/facilitator discount cleared (will use reg fee)` : `All ${label} set to ₱${updateValue}`);
      setChurches((prev) => prev.map((c) => {
        if (field === "staff_discount_fee" || field === "church_fee") return { ...c, [field]: updateValue };
        return c.circuit !== "Visiting" ? { ...c, [field]: updateValue } : c;
      }));
    }
  };

  // Instantly saves — used for dropdowns & toggle buttons only
  const handleGlobalSettingsUpdate = async (field, value) => {
    const updated = { ...globalSettings, [field]: value };
    setGlobalSettings(updated);
    
    const payload = {
      ...updated,
      id: 1,
      auto_start_date: toIsoString(updated.auto_start_date),
      auto_end_date: toIsoString(updated.auto_end_date),
      camp_date: toIsoString(updated.camp_date)
    };

    const { error } = await supabase
      .from("app_settings")
      .upsert(payload);
    if (error) {
      toast.error("Failed to update.");
      console.error(error);
    } else {
      toast.success("Successfully updated!");
    }
  };

  // Only updates local state while typing — pair with handleGlobalSettingsBlur on onBlur
  const handleGlobalSettingsChange = (field, value) => {
    setGlobalSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Saves to Supabase — call this on onBlur for text/date inputs
  const handleGlobalSettingsBlur = async () => {
    const payload = {
      ...globalSettings,
      id: 1,
      auto_start_date: toIsoString(globalSettings.auto_start_date),
      auto_end_date: toIsoString(globalSettings.auto_end_date),
      camp_date: toIsoString(globalSettings.camp_date)
    };

    const { error } = await supabase
      .from("app_settings")
      .upsert(payload);
    if (error) {
      toast.error("Failed to update.");
      console.error(error);
    } else {
      toast.success("Successfully updated!");
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrUploading(true);
    try {
      const path = `payment_qrs/${Date.now()}.webp`;
      const url = await uploadFile("announcement-images", path, file, true);
      const updated = { ...globalSettings, payment_qr_url: url };
      setGlobalSettings(updated);
      
      const payload = {
        ...updated,
        id: 1,
        auto_start_date: toIsoString(updated.auto_start_date),
        auto_end_date: toIsoString(updated.auto_end_date),
        camp_date: toIsoString(updated.camp_date)
      };

      await supabase.from("app_settings").upsert(payload);
      toast.success("QR Code updated");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setQrUploading(false);
    }
  };

  const handleConsentTemplateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setConsentUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `consent_templates/${Date.now()}.${ext}`;
      // Upload as-is (no compression for PDFs and docs)
      const { data, error: uploadError } = await supabase.storage
        .from("consent-forms")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from("consent-forms")
        .getPublicUrl(path);
      const url = publicUrl;
      const updated = { ...globalSettings, consent_template_url: url };
      setGlobalSettings(updated);
      const payload = {
        ...updated,
        id: 1,
        auto_start_date: toIsoString(updated.auto_start_date),
        auto_end_date: toIsoString(updated.auto_end_date),
        camp_date: toIsoString(updated.camp_date),
      };
      await supabase.from("app_settings").upsert(payload);
      toast.success("Consent template uploaded! Church admins can now download it.");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setConsentUploading(false);
      e.target.value = "";
    }
  };

  // ── Analytics data ───────────────────────────────────────────────────────
  // Top 7 churches by delegate count for bar chart
  const topChurchesChart = Object.entries(stats.churchCounts || {})
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 7)
    .map(([name, counts]) => ({
      name: name.replace(" Baptist Church", "").replace(" Church", "").slice(0, 14),
      delegates: counts.total,
    }));

  // Payment breakdown for the donut-style bars
  const paidCount = stats.total > 0 ? Object.values(stats.churchCounts).reduce((sum, c) => sum + c.paid, 0) : 0;
  const pendingCount = stats.total - paidCount;
  const onlineCount = stats.online;

  const paymentBreakdown = [
    { label: "Paid", value: paidCount, total: stats.total, color: "#22c55e" },
    { label: "Pending", value: pendingCount, total: stats.total, color: "#f59e0b" },
    { label: "Online Cash", value: onlineCount, total: stats.total, color: "#38bdf8" },
  ];

  return (
    <>
      <AdminLayout title="Admin Dashboard Overview" headerRight={null}>
        {/* Global Settings */}
        <div className="bg-[#0A1614] p-4 md:p-6 rounded-xl border border-[#C5C5C5]/15 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-[#F1F1F1]">
                Registration Open/Close Settings
              </h4>
              <p className="text-[#C5C5C5]/60 text-xs mt-1">
                Configure when the registration form is accessible to church
                admins and members.
              </p>
            </div>
            <div className="w-52">
              <CustomDropdown
                value={globalSettings.registration_mode}
                onChange={(val) =>
                  handleGlobalSettingsUpdate("registration_mode", val)
                }
                options={[
                  { value: "auto", label: "Automatic (By Date)" },
                  { value: "manual", label: "Manual Override" },
                ]}
                placeholder="Select mode…"
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {globalSettings.registration_mode === "auto" ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-4 items-end"
              >
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/60 mb-1.5">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={globalSettings.auto_start_date || ""}
                    onChange={(e) => handleGlobalSettingsChange("auto_start_date", e.target.value)}
                    className="w-full sm:w-auto bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 rounded-lg px-3 py-2 text-sm text-[#F1F1F1] focus:border-[#C5C5C5]/40 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/60 mb-1.5">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={globalSettings.auto_end_date || ""}
                    onChange={(e) => handleGlobalSettingsChange("auto_end_date", e.target.value)}
                    className="w-full sm:w-auto bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 rounded-lg px-3 py-2 text-sm text-[#F1F1F1] focus:border-[#C5C5C5]/40 outline-none transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGlobalSettingsBlur}
                  className="px-5 py-2 mt-auto bg-[#F1F1F1] hover:bg-[#C5C5C5] text-[#0A1614] rounded-lg text-sm font-bold transition-all shadow-md ml-auto sm:ml-0"
                >
                  Save Dates
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-4 items-center"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/60">
                  Manual Status:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleGlobalSettingsUpdate("manual_status", "open")
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${globalSettings.manual_status === "open" ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : "bg-[#C5C5C5]/10 text-green-400 hover:bg-[#C5C5C5]/20"}`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() =>
                      handleGlobalSettingsUpdate("manual_status", "closed")
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${globalSettings.manual_status === "closed" ? "bg-red-500 text-black shadow-lg shadow-red-500/20" : "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"}`}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Camp Countdown Settings */}
        <div className="bg-[#0A1614] p-4 md:p-6 rounded-xl border border-[#C5C5C5]/15 shadow-sm mb-8">
          <div className="mb-5">
            <h4 className="font-bold text-[#F1F1F1]">Camp Countdown Timer</h4>
            <p className="text-[#C5C5C5]/60 text-xs mt-1">
              Set the target date and a custom label for the public-facing countdown on the landing page.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/60 mb-1.5">
                Camp Date & Time
              </label>
              <input
                type="datetime-local"
                value={globalSettings.camp_date || ""}
                onChange={(e) => handleGlobalSettingsChange("camp_date", e.target.value)}
                className="w-full bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 rounded-lg px-3 py-2 text-sm text-[#F1F1F1] focus:border-[#C5C5C5]/40 outline-none transition-colors"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/60 mb-1.5">
                Countdown Heading
              </label>
              <input
                type="text"
                value={globalSettings.camp_label || ""}
                onChange={(e) => handleGlobalSettingsChange("camp_label", e.target.value)}
                placeholder="e.g. Camp is Almost Here"
                className="w-full bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 rounded-lg px-3 py-2 text-sm text-[#F1F1F1] placeholder-[#C5C5C5]/30 focus:border-[#C5C5C5]/40 outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 items-end">
              <button
                type="button"
                onClick={handleGlobalSettingsBlur}
                className="px-5 py-2 bg-green-500 text-[#0A1614] rounded-lg text-sm font-bold transition-all shadow-md flex-1 sm:flex-none h-[38px]"
              >
                Save
              </button>
              {globalSettings.camp_date && (
                <button
                  onClick={() => {
                    const updated = { ...globalSettings, camp_date: "", camp_label: "" };
                    setGlobalSettings(updated);
                    const payload = {
                      ...updated,
                      id: 1,
                      auto_start_date: toIsoString(updated.auto_start_date),
                      auto_end_date: toIsoString(updated.auto_end_date),
                      camp_date: null
                    };
                    supabase.from("app_settings").upsert(payload).then(({ error }) => {
                      if (error) toast.error("Failed to clear timer");
                      else toast.success("Timer cleared");
                    });
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-bold transition-all h-[38px]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {globalSettings.camp_date && (
            <p className="mt-3 text-[10px] text-[#C5C5C5]/40 font-bold uppercase tracking-widest">
              Counting down to:{" "}
              <span className="text-[#C5C5C5]/60">
                {new Date(globalSettings.camp_date).toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </p>
          )}
        </div>

        {/* Payment Configuration */}
        <div className="bg-[#0A1614] p-4 md:p-6 rounded-xl border border-[#C5C5C5]/15 shadow-sm mb-8">
          <div className="mb-5">
            <h4 className="font-bold text-[#F1F1F1]">Payment Settings</h4>
            <p className="text-[#C5C5C5]/60 text-xs mt-1">
              Upload the QR code and provide details for registration payments.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* QR Upload */}
            <div className="col-span-1 border border-[#C5C5C5]/15 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-[#C5C5C5]/5 relative overflow-hidden">
              <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center opacity-0 hover:opacity-100 bg-[#0A1614]/80 backdrop-blur-sm transition-all z-10">
                <svg className="w-8 h-8 text-[#C5C5C5] mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm font-bold text-[#C5C5C5]">Change QR Code</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleQrUpload} disabled={qrUploading} />
              </label>
              
              {qrUploading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[140px]">
                  <div className="w-8 h-8 border-4 border-[#C5C5C5]/20 border-t-[#C5C5C5] rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-[#C5C5C5] mt-3">Uploading...</span>
                </div>
              ) : globalSettings.payment_qr_url ? (
                <div className="relative w-full aspect-square max-w-[180px]">
                  <img src={globalSettings.payment_qr_url} alt="Payment QR" className="w-full h-full object-contain rounded-lg" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[140px] text-[#C5C5C5]/40">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM16.875 16.875h.008v.008h-.008v-.008zM16.875 19.125h.008v.008h-.008v-.008zM19.125 16.875h.008v.008h-.008v-.008zM19.125 19.125h.008v.008h-.008v-.008zM13.5 16.875h.008v.008h-.008v-.008zM13.5 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                  <p className="text-xs font-bold uppercase tracking-widest px-4 text-center">No QR uploaded</p>
                  <label className="mt-3 px-4 py-1.5 rounded-full border border-[#C5C5C5]/20 hover:bg-[#C5C5C5]/10 text-xs cursor-pointer transition-colors text-[#F1F1F1]">
                    Upload QR
                    <input type="file" className="hidden" accept="image/*" onChange={handleQrUpload} disabled={qrUploading} />
                  </label>
                </div>
              )}
            </div>

            {/* Payment Info Form */}
            <div className="col-span-1 md:col-span-1 lg:col-span-2 space-y-4 flex flex-col justify-center">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/60 mb-1.5">
                  Account Name
                </label>
                <input
                  type="text"
                  value={globalSettings.payment_name || ""}
                  onChange={(e) => handleGlobalSettingsChange("payment_name", e.target.value)}
                  placeholder="e.g. Juan De La Cruz"
                  className="w-full bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 rounded-lg px-3 py-2.5 text-sm text-[#F1F1F1] placeholder-[#C5C5C5]/30 focus:border-[#C5C5C5]/40 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/60 mb-1.5">
                  Account Number
                </label>
                <input
                  type="tel"
                  maxLength="11"
                  value={globalSettings.payment_number || ""}
                  onChange={(e) => handleGlobalSettingsChange("payment_number", e.target.value)}
                  placeholder="e.g. 09123456789"
                  className="w-full bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 rounded-lg px-3 py-2.5 text-sm text-[#F1F1F1] placeholder-[#C5C5C5]/30 focus:border-[#C5C5C5]/40 outline-none transition-colors"
                />
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGlobalSettingsBlur}
                  className="w-full md:w-auto px-6 bg-green-500 text-black py-2.5 rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  Save Payment Details
                </button>
                <p className="text-[10px] text-[#C5C5C5]/50 mt-2">
                  Click the button above to explicitly save your updated payment names and numbers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Consent Form Template */}
        <div className="bg-[#0A1614] p-4 md:p-6 rounded-xl border border-[#C5C5C5]/15 shadow-sm mb-8">
          <div className="mb-5">
            <h4 className="font-bold text-[#F1F1F1]">Consent Form Template</h4>
            <p className="text-[#C5C5C5]/60 text-xs mt-1">
              Upload a consent form template for church admins to download. They will use it to collect parental consent for delegates under 18.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {globalSettings.consent_template_url ? (
              <div className="flex items-center gap-3 flex-1 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-green-400">Template uploaded</p>
                  <p className="text-[10px] text-green-400/60 truncate mt-0.5">{globalSettings.consent_template_url.split("/").pop()}</p>
                </div>
                <a
                  href={globalSettings.consent_template_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-green-400 hover:text-green-300 underline underline-offset-2 flex-shrink-0"
                >
                  View
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1 bg-[#C5C5C5]/5 border border-[#C5C5C5]/15 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-[#C5C5C5]/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-xs text-[#C5C5C5]/40 italic">No consent template uploaded yet</p>
              </div>
            )}
            <div className="flex-shrink-0">
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm cursor-pointer transition-all ${
                consentUploading
                  ? "border-[#C5C5C5]/10 text-[#C5C5C5]/30 bg-[#C5C5C5]/5 cursor-not-allowed"
                  : "border-[#C5C5C5]/25 text-[#C5C5C5] hover:bg-[#C5C5C5]/10 bg-[#C5C5C5]/5"
              }`}>
                {consentUploading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                )}
                {consentUploading ? "Uploading..." : globalSettings.consent_template_url ? "Replace Template" : "Upload Template"}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleConsentTemplateUpload}
                  disabled={consentUploading}
                />
              </label>
              <p className="text-[10px] text-[#C5C5C5]/30 mt-1.5">Accepts PDF, Word, or image files</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {[
            {
              label: "Total Delegates",
              value: stats.total,
              icon: "groups",
              color: "text-[#C5C5C5] bg-[#C5C5C5]/10",
            },
            {
              label: "Estimated Collections",
              value: `₱${stats.onlineTotal.toLocaleString()}`,
              icon: "credit_card",
              color: "text-blue-500 bg-blue-500/10",
            },
            {
              label: "Participating Churches",
              value: stats.churches,
              icon: "church",
              color: "text-amber-500 bg-amber-500/10",
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0A1614] p-4 md:p-6 rounded-xl border border-[#C5C5C5]/15 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`size-10 rounded-lg flex items-center justify-center ${s.color}`}
                >
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
              </div>
              <p className="text-[#C5C5C5]/70 text-xs md:text-sm font-medium">
                {s.label}
              </p>
              <h3 className="text-xl md:text-2xl font-black mt-1 text-[#F1F1F1]">
                {s.value}
              </h3>
            </motion.div>
          ))}
        </div>

        {/* ── Analytics Section ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">

          {/* Delegates by Church — Bar Chart */}
          <div className="lg:col-span-2 bg-[#0A1614] rounded-xl border border-[#C5C5C5]/15 p-4 md:p-6">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-[#F1F1F1] text-sm">Delegates by Church</h4>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/40">Top 7</span>
            </div>
            <p className="text-[#C5C5C5]/50 text-xs mb-5">Registration volume per member church</p>
            {topChurchesChart.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-[#C5C5C5]/30 text-sm">
                No delegate data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topChurchesChart} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(197,197,197,0.07)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#C5C5C5", opacity: 0.5, fontSize: 10, fontWeight: 700 }}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#C5C5C5", opacity: 0.4, fontSize: 10 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(197,197,197,0.05)" }}
                    contentStyle={{
                      background: "#0A1614",
                      border: "1px solid rgba(197,197,197,0.15)",
                      borderRadius: "10px",
                      color: "#F1F1F1",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    itemStyle={{ color: "#C5C5C5" }}
                    labelStyle={{ color: "#F1F1F1", fontWeight: 900, marginBottom: 4 }}
                  />
                  <Bar dataKey="delegates" radius={[6, 6, 0, 0]}>
                    {topChurchesChart.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === 0 ? "#C5C5C5" : `rgba(197,197,197,${0.55 - i * 0.07})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Payment & Method Breakdown */}
          <div className="bg-[#0A1614] rounded-xl border border-[#C5C5C5]/15 p-4 md:p-6 flex flex-col">
            <h4 className="font-bold text-[#F1F1F1] text-sm mb-1">Registration Breakdown</h4>
            <p className="text-[#C5C5C5]/50 text-xs mb-6">Payment status &amp; method split</p>

            <div className="space-y-5 flex-1">
              {paymentBreakdown.map((item) => {
                const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                        <span className="text-xs font-bold text-[#C5C5C5]">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#F1F1F1]">{item.value}</span>
                        <span className="text-[10px] font-bold text-[#C5C5C5]/40">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[#C5C5C5]/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total summary pill */}
            <div className="mt-6 pt-4 border-t border-[#C5C5C5]/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/40">Total Registered</span>
              <span className="text-xl font-black text-[#F1F1F1]">{stats.total}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Church registration status */}
          <div className="bg-[#0A1614] p-4 md:p-6 rounded-xl border border-[#C5C5C5]/15 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-[#F1F1F1]">Church Registration Status</h4>
              <span className="text-[10px] font-black text-[#C5C5C5]/40 uppercase tracking-widest">
                {churches.filter(c => c.circuit !== "Visiting").length} churches
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {[
                { color: "bg-green-500",  label: "Active" },
                { color: "bg-amber-500",  label: "Low" },
                { color: "bg-[#C5C5C5]/20", label: "None" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  <span className="text-[10px] text-[#C5C5C5]/50 font-bold">{l.label}</span>
                </div>
              ))}
            </div>

            {/* Scrollable list — custom scrollbar */}
            <style>{`
              .church-scroll::-webkit-scrollbar { width: 4px; }
              .church-scroll::-webkit-scrollbar-track { background: transparent; }
              .church-scroll::-webkit-scrollbar-thumb { background: rgba(197,197,197,0.2); border-radius: 99px; }
              .church-scroll::-webkit-scrollbar-thumb:hover { background: rgba(197,197,197,0.35); }
            `}</style>
            <div
              className="church-scroll flex-1 space-y-3 overflow-y-auto pr-2"
              style={{
                maxHeight: "420px",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(197,197,197,0.2) transparent",
              }}
            >
                {churches
                  .filter(c => c.circuit !== "Visiting")
                  .sort((a, b) => {
                    // Sort: has delegates first, then alphabetically
                    const aCount = stats.churchCounts?.[a.name]?.total || 0;
                    const bCount = stats.churchCounts?.[b.name]?.total || 0;
                    if (bCount !== aCount) return bCount - aCount;
                    return a.name.localeCompare(b.name);
                  })
                  .map((church) => {
                    const total = stats.churchCounts?.[church.name]?.total || 0;
                    const paid  = stats.churchCounts?.[church.name]?.paid || 0;
                    const maxDelegates = Math.max(...churches.map(c => stats.churchCounts?.[c.name]?.total || 0), 1);
                    const pct   = Math.min((total / maxDelegates) * 100, 100);
                    const circuitColor =
                      church.circuit === "A" ? "#22c55e" :
                      church.circuit === "B" ? "#38bdf8" : "#f59e0b";

                    return (
                      <div key={church.id} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: circuitColor }} />
                            <span className="text-[11px] font-bold text-[#C5C5C5] truncate">
                              {church.name
                                .replace(" Baptist Church", "")
                                .replace(" Evangelical Church", "")
                                .replace(" Christian Church", "")
                                .replace(" Inc.", "")
                                .replace(" Inc", "")
                                .trim()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {paid > 0 && (
                              <span className="text-[9px] font-black text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                {paid} paid
                              </span>
                            )}
                            <span className="text-[10px] font-black text-[#C5C5C5]/50 w-6 text-right">{total}</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-[#C5C5C5]/8 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, total > 0 ? 3 : 0)}%`,
                              background: total === 0
                                ? "transparent"
                                : pct > 50
                                  ? "#22c55e"
                                  : pct > 15
                                    ? "#f59e0b"
                                    : "#f59e0b",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Registration management table */}
          <div className="lg:col-span-2 bg-[#0A1614] rounded-xl border border-[#C5C5C5]/15 overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 border-b border-[#C5C5C5]/15 flex items-center justify-between">
              <h4 className="font-bold text-[#F1F1F1]">
                Registration Management
              </h4>
              <div className="w-36">
                <CustomDropdown
                  value={filter}
                  onChange={(val) => setFilter(val)}
                  options={[
                    { value: "All", label: "All Status" },
                    { value: "Paid", label: "Paid" },
                    { value: "Pending", label: "Pending" },
                    { value: "Invalid Consent", label: "Invalid Consent" },
                    { value: "Invalid Payment", label: "Invalid Payment" },
                    { value: "Missing / Invalid Picture", label: "Missing / Invalid Picture" },
                  ]}
                  placeholder="All Status"
                />
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-[#C5C5C5]/5 text-[#C5C5C5]/60 text-[10px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3">Delegate</th>
                    <th className="px-6 py-3">Church</th>
                    <th className="px-6 py-3">Payment</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5C5C5]/10">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-[#C5C5C5]/60"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : delegates.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-[#C5C5C5]/60"
                      >
                        No delegates found
                      </td>
                    </tr>
                  ) : (
                    delegates.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-[#C5C5C5]/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-[#F1F1F1]">
                            {d.full_name}
                          </p>
                          <div className="mt-1">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-[#C5C5C5]/10 text-[#C5C5C5]/60 text-[10px] font-bold uppercase whitespace-nowrap">
                              {d.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#C5C5C5]/70 truncate max-w-[120px]">
                          {d.churches?.name}
                        </td>
                        <td className="px-6 py-4">
                          {d.payment_proof_url ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewerImage({
                                  url: d.payment_proof_url,
                                  title: "Proof of Payment",
                                });
                              }}
                              className="flex items-center gap-1.5 text-xs text-[#C5C5C5] font-bold bg-[#C5C5C5]/10 px-2 py-1 rounded hover:bg-[#C5C5C5]/15 transition-colors"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
                                />
                              </svg>
                              Proof
                            </button>
                          ) : (
                            <span className="text-xs text-[#C5C5C5]/60 font-bold bg-[#C5C5C5]/10 px-2 py-1 rounded">
                              {d.payment_method}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              d.payment_status === "Paid"
                                ? "bg-green-500/10 text-green-400"
                                : d.payment_status === "Pending"
                                ? "bg-amber-500/10 text-amber-400"
                                : d.payment_status === "Invalid Consent"
                                ? "bg-red-500/10 text-red-400"
                                : d.payment_status === "Invalid Payment"
                                ? "bg-red-500/10 text-red-400"
                                : d.payment_status === "Missing / Invalid Picture"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-[#C5C5C5]/10 text-[#C5C5C5]"
                            }`}
                          >
                            {d.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button
                            onClick={() => {
                              setOpenVisitMenu(null);
                              setOpenMenu(openMenu === d.id ? null : d.id);
                            }}
                            className="text-[#C5C5C5]/70 hover:text-[#C5C5C5] p-1 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                            </svg>
                          </button>
                          {openMenu === d.id && (
                            <ContextMenu
                              delegate={d}
                              onClose={() => setOpenMenu(null)}
                              onDelete={() => handleDelete(d.id)}
                              onUpdateStatus={handleUpdateStatus}
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 md:p-4 border-t border-[#C5C5C5]/15 flex items-center justify-between">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs font-bold text-[#C5C5C5]/70 hover:text-[#F1F1F1] disabled:opacity-30 transition-colors px-3 py-1 border border-[#C5C5C5]/20 rounded-lg"
              >
                ← Prev
              </button>
              <span className="text-xs text-[#C5C5C5]/60 font-bold">
                Page {page + 1}
              </span>
              <button
                disabled={delegates.length < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs font-bold text-[#C5C5C5]/70 hover:text-[#F1F1F1] disabled:opacity-30 transition-colors px-3 py-1 border border-[#C5C5C5]/20 rounded-lg"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Visiting Churches */}
        {visitingGroups.length > 0 && (
          <div className="bg-[#0A1614] border border-amber-500/20 rounded-xl overflow-visible mb-8">
            <div className="p-4 md:p-6 border-b border-amber-500/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[#F1F1F1]">Visiting Churches</h4>
                <p className="text-[#C5C5C5]/60 text-xs mt-0.5">
                  {visitingGroups.length} visiting {visitingGroups.length === 1 ? "church" : "churches"} · {visitingGroups.reduce((s, g) => s + g.delegates.length, 0)} delegates
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#C5C5C5]/10">
              {visitingGroups.map(({ church, delegates: vDelegates }) => (
                <div key={church.id} className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-black text-amber-400 uppercase tracking-wide">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      Visiting
                    </span>
                    <h5 className="font-black text-[#F1F1F1] text-sm">{church.name}</h5>
                    <span className="text-[#C5C5C5]/40 text-xs">— {vDelegates.length} {vDelegates.length === 1 ? "delegate" : "delegates"}</span>
                  </div>

                  {/* Mobile: cards, Desktop: table */}
                  <div className="rounded-xl border border-[#C5C5C5]/10 overflow-visible">
                    {/* Desktop table — hidden on mobile */}
                    <div className="hidden md:block overflow-x-auto overflow-y-visible">
                      <table className="w-full text-left">
                        <thead className="bg-[#C5C5C5]/5 text-[#C5C5C5]/50 text-[10px] uppercase tracking-wider font-bold">
                          <tr>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2">Payment</th>
                            <th className="px-4 py-2 text-center">Status</th>
                            <th className="px-4 py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C5C5C5]/10">
                          {vDelegates.map((d) => (
                            <tr key={d.id} className="hover:bg-[#C5C5C5]/5 transition-colors">
                              <td className="px-4 py-3 text-sm font-bold text-[#F1F1F1]">{d.full_name}</td>
                               <td className="px-4 py-3">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-[#C5C5C5]/10 text-[#C5C5C5]/60 text-[10px] font-bold uppercase whitespace-nowrap">
                                  {d.role}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {d.payment_proof_url ? (
                                  <button
                                    onClick={() => setViewerImage({ url: d.payment_proof_url, title: "Proof of Payment" })}
                                    className="flex items-center gap-1 text-xs text-[#C5C5C5] font-bold bg-[#C5C5C5]/10 px-2 py-1 rounded hover:bg-[#C5C5C5]/15 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                                    </svg>
                                    Proof
                                  </button>
                                ) : (
                                  <span className="text-xs text-[#C5C5C5]/30 italic">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenu(null);
                                    setOpenVisitMenu(openVisitMenu === d.id ? null : d.id);
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all max-w-[120px] ${
                                    d.payment_status === "Paid"
                                      ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                      : d.payment_status === "Pending"
                                      ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                      : d.payment_status === "Invalid Consent"
                                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                      : d.payment_status === "Invalid Payment"
                                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                      : d.payment_status === "Missing / Invalid Picture"
                                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                      : "bg-[#C5C5C5]/10 text-[#C5C5C5] hover:bg-[#C5C5C5]/20"
                                  }`}
                                >
                                  <span className="truncate">
                                    {d.payment_status === "Missing / Invalid Picture" ? "Missing Pic" : d.payment_status}
                                  </span>
                                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                                {openVisitMenu === d.id && (
                                  <ContextMenu
                                    delegate={d}
                                    onClose={() => setOpenVisitMenu(null)}
                                    onDelete={() => handleDelete(d.id)}
                                    onUpdateStatus={handleUpdateStatus}
                                    direction="up"
                                    showDelete={false}
                                  />
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {d.payment_status === "Paid" ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-[#C5C5C5]/30 italic px-2.5 py-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                                    Paid
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleDelete(d.id)}
                                    className="inline-flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards — visible only on mobile */}
                    <div className="md:hidden divide-y divide-[#C5C5C5]/10">
                      {vDelegates.map((d) => (
                        <div key={d.id} className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#F1F1F1] truncate">{d.full_name}</p>
                              <p className="text-xs text-[#C5C5C5]/50 mt-0.5">{d.role}</p>
                            </div>
                            <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-0.5 ${
                              d.payment_status === "Paid" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                            }`}>
                              {d.payment_status}
                            </span>
                          </div>
                          {/* Action row */}
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            {d.payment_proof_url && (
                              <button
                                onClick={() => setViewerImage({ url: d.payment_proof_url, title: "Proof of Payment" })}
                                className="flex items-center gap-1.5 text-[11px] text-[#C5C5C5] font-bold bg-[#C5C5C5]/10 px-2.5 py-1 rounded-lg hover:bg-[#C5C5C5]/15 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                                </svg>
                                Proof
                              </button>
                            )}
                            <button
                              onClick={() => handleTogglePayment(d)}
                              className="flex items-center gap-1.5 text-[11px] text-[#C5C5C5] font-bold bg-[#C5C5C5]/10 px-2.5 py-1 rounded-lg hover:bg-[#C5C5C5]/15 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                              </svg>
                              Toggle Payment
                            </button>
                            <button
                              onClick={() => handleDelete(d.id)}
                              className="flex items-center gap-1.5 text-[11px] text-red-400 font-bold bg-red-500/10 px-2.5 py-1 rounded-lg hover:bg-red-500/15 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Google Drive Links & Fee Settings per church */}
        <div className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-[#C5C5C5]/15">
            <h4 className="font-bold text-[#F1F1F1] text-sm md:text-base">
              Church Settings — Drive Links & Registration Fees
            </h4>
            <p className="text-[#C5C5C5]/60 text-sm mt-1">
              Set fees for all churches at once, or update Drive links per church
            </p>
          </div>

          {/* ── Bulk fee setters ── */}
          <div className="px-6 py-4 border-b border-[#C5C5C5]/10 bg-[#C5C5C5]/3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/40 mb-3">Set All Churches</p>
            <div className="flex flex-wrap gap-4">
              <BulkFeeInput
                label="Registration Fee (₱)"
                field="registration_fee"
                defaultValue={churches.find(c => c.circuit !== "Visiting")?.registration_fee || 160}
                onApply={handleBulkFeeUpdate}
              />
              <BulkFeeInput
                label="Merch Fee (₱)"
                field="merch_fee"
                defaultValue={churches.find(c => c.circuit !== "Visiting")?.merch_fee || 200}
                onApply={handleBulkFeeUpdate}
              />
              <BulkFeeInput
                label="Camp Staff & Facilitator Fee (₱)"
                field="staff_discount_fee"
                defaultValue={churches.find(c => c.circuit !== "Visiting" && c.staff_discount_fee != null)?.staff_discount_fee || 120}
                onApply={handleBulkFeeUpdate}
                allowEmpty
              />
              <BulkFeeInput
                label="Church Fee (₱)"
                field="church_fee"
                defaultValue={churches.find(c => c.circuit !== "Visiting")?.church_fee || 200}
                onApply={handleBulkFeeUpdate}
              />
            </div>
          </div>

          {/* ── Per-church drive links ── */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#C5C5C5]/5 text-[#C5C5C5]/60 text-[10px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3">Church</th>
                  <th className="px-6 py-3">Circuit</th>
                  <th className="px-6 py-3">Church Fee (₱)</th>
                  <th className="px-6 py-3">Fee Status</th>
                  <th className="px-6 py-3">Fee Proof</th>
                  <th className="px-6 py-3 text-center">Reg Fee</th>
                  <th className="px-6 py-3 text-center">Merch Fee</th>
                  <th className="px-6 py-3 text-center">Staff Fee</th>
                  <th className="px-6 py-3 text-right">Drive Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5C5C5]/10">
                {churches.map((church) => (
                  <ChurchSettingsRow
                    key={church.id}
                    church={church}
                    onDriveUpdate={handleDriveLinkUpdate}
                    onFeeUpdate={handleFeeUpdate}
                    onStatusUpdate={handleChurchFeeStatusUpdate}
                    onViewImage={(url) => setViewerImage({ url, title: "Church Fee Proof" })}
                    openFeeMenu={openFeeMenu}
                    setOpenFeeMenu={setOpenFeeMenu}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>

      <ImageViewerModal
        url={viewerImage?.url}
        title={viewerImage?.title}
        onClose={() => setViewerImage(null)}
      />
    </>
  );
};

const BulkFeeInput = ({ label, field, defaultValue, onApply, placeholder, allowEmpty }) => {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          {value !== "" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C5C5C5]/50 text-sm font-bold">₱</span>}
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={allowEmpty ? "0" : ""}
            className={`${value !== "" ? "pl-7" : "pl-3"} pr-3 py-2 bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 rounded-lg text-sm text-[#F1F1F1] font-bold w-36 focus:ring-1 focus:ring-green-500/40 focus:border-green-500/40 outline-none`}
          />
        </div>
        <button
          onClick={() => onApply(field, value)}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Apply to All
        </button>
      </div>
    </div>
  );
};

const ChurchSettingsRow = ({ church, onDriveUpdate, onFeeUpdate, onStatusUpdate, onViewImage, openFeeMenu, setOpenFeeMenu }) => {
  const [link, setLink] = useState(church.drive_link || "");

  const status = church.church_fee_status || "Pending";
  const statusColor = status === "Paid" ? "green" : status === "Invalid Proof of Payment" ? "red" : "amber";

  return (
    <tr className="hover:bg-[#C5C5C5]/5 transition-colors">
      <td className="px-6 py-3 text-sm font-bold text-[#F1F1F1] max-w-[200px] truncate">
        <div className="flex items-center gap-2">
          {church.circuit === "Visiting" && (
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" title="Visiting Church"></span>
          )}
          {church.name}
        </div>
      </td>
      <td className="px-6 py-3 text-xs text-[#C5C5C5]/70 font-bold">
        {church.circuit}
      </td>
      <td className="px-6 py-3">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-[#F1F1F1]">₱{church.church_fee ?? 0}</span>
        </div>
      </td>
      <td className="px-6 py-3 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenFeeMenu(openFeeMenu === church.id ? null : church.id);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
            statusColor === "green" ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20" :
            statusColor === "red" ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" :
            "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${
            statusColor === "green" ? "bg-green-400" : statusColor === "red" ? "bg-red-400" : "bg-amber-400"
          }`} />
          {status === "Invalid Proof of Payment" ? "Invalid Proof" : status}
          <svg className={`w-3 h-3 transition-transform ${openFeeMenu === church.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {openFeeMenu === church.id && (
          <ChurchFeeStatusMenu
            church={church}
            onClose={() => setOpenFeeMenu(null)}
            onUpdateStatus={onStatusUpdate}
          />
        )}
      </td>
      <td className="px-6 py-3">
        {church.church_fee_payment_url ? (
          <button
            onClick={() => onViewImage(church.church_fee_payment_url)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#C5C5C5]/10 hover:bg-[#C5C5C5]/20 border border-[#C5C5C5]/20 text-[#C5C5C5] rounded text-[10px] font-black uppercase tracking-widest transition-all group"
          >
            <svg className="w-3 h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Review
          </button>
        ) : (
          <span className="text-[10px] font-black text-[#C5C5C5]/20 uppercase tracking-widest italic">No Proof</span>
        )}
      </td>
      <td className="px-6 py-3 text-center">
        <span className="text-sm font-black text-[#F1F1F1]">₱{church.registration_fee}</span>
      </td>
      <td className="px-6 py-3 text-center">
        <span className="text-sm font-black text-[#F1F1F1]">₱{church.merch_fee}</span>
      </td>
      <td className="px-6 py-3 text-center">
        {church.staff_discount_fee != null ? (
          <span className="text-sm font-black text-blue-400">₱{church.staff_discount_fee}</span>
        ) : (
          <span className="text-[10px] text-[#C5C5C5]/30 italic uppercase font-bold">Standard</span>
        )}
      </td>
      <td className="px-6 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="text-xs bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 rounded-lg px-3 py-1.5 text-[#C5C5C5] w-48 focus:ring-1 focus:ring-[#C5C5C5]/40 outline-none"
          />
          <button
            onClick={() => onDriveUpdate(church.id, link)}
            className="text-xs font-bold text-[#C5C5C5] bg-[#C5C5C5]/10 px-3 py-1.5 rounded-lg hover:bg-[#C5C5C5]/15 transition-colors whitespace-nowrap"
          >
            Save
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminDashboard;