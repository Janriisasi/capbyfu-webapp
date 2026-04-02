import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AdminLayout from "../../components/adminLayout";
import { supabase } from "../../lib/supabase";
import { CHURCHES } from "../../lib/constants";
import ImageViewerModal from "../../components/imageviewerModal";
import ExcelJS from "exceljs";

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

const DelegateModal = ({ delegate, onClose, onTogglePayment, onViewImage }) => {
  if (!delegate) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0A1614] border border-[#C5C5C5]/20 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-xl text-[#F1F1F1]">
            {delegate.full_name}
          </h3>
          <button
            onClick={onClose}
            className="text-[#C5C5C5]/70 hover:text-[#F1F1F1] transition-colors p-1"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <InfoRow label="Full Name" value={delegate.full_name} />
          <InfoRow label="Nickname" value={delegate.nickname || "N/A"} />
          <InfoRow label="Age" value={delegate.age} />
          <InfoRow label="Contact" value={delegate.contact_number || "N/A"} />
          <InfoRow label="Guardian" value={delegate.guardian_name || "N/A"} />
          <InfoRow label="Church" value={delegate.churches?.name || "N/A"} />
          <InfoRow label="Circuit" value={delegate.churches?.circuit || "N/A"} />
          <InfoRow label="Role" value={delegate.role} badge />
        </div>

        {delegate.include_merch && (
          <div className="mt-4 p-4 bg-[#C5C5C5]/10 rounded-xl space-y-2">
            <p className="text-xs font-bold text-[#C5C5C5]/70 uppercase tracking-wider">
              Merchandise
            </p>
            <div className="flex gap-4 text-sm text-[#C5C5C5]">
              <span>
                Size:{" "}
                <strong className="text-[#F1F1F1]">
                  {delegate.shirt_size || "N/A"}
                </strong>
              </span>
              <span>
                Color:{" "}
                <strong className="text-[#F1F1F1]">
                  {delegate.shirt_color || "N/A"}
                </strong>
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {delegate.payment_proof_url && (
            <button
              onClick={() =>
                onViewImage(delegate.payment_proof_url, "Proof of Payment")
              }
              className="flex items-center gap-2 bg-[#C5C5C5]/10 text-[#C5C5C5] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#C5C5C5]/15 transition-colors"
            >
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
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
                />
              </svg>
              View Proof of Payment
            </button>
          )}
          {delegate.consent_url && (
            <button
              onClick={() => onViewImage(delegate.consent_url, "Consent Form")}
              className="flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-500/20 transition-colors"
            >
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              View Consent Form
            </button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-[#C5C5C5]/15 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#C5C5C5]/60 mb-1">Payment Status</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase ${
                delegate.payment_status === "Paid"            ? "bg-green-500/10 text-green-400"   :
                delegate.payment_status === "Pending"         ? "bg-yellow-500/10 text-yellow-400" :
                (delegate.payment_status?.includes("Invalid") || delegate.payment_status?.includes("Missing")) ? "bg-red-500/10 text-red-400" :
                "bg-red-500/10 text-red-400"
              }`}
            >
              {delegate.payment_status || "Pending"}
            </span>
          </div>
          <button
            onClick={() => {
              onTogglePayment(delegate);
            }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              delegate.payment_status === "Paid"
                ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                : "bg-green-500 text-black hover:bg-green-400"
            }`}
          >
            Mark as {delegate.payment_status === "Paid" ? "Pending" : "Paid"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const InfoRow = ({ label, value, badge }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[10px] font-bold text-[#C5C5C5]/60 uppercase tracking-wider">
      {label}
    </p>
    {badge ? (
      <span className="inline-flex w-fit px-2 py-0.5 rounded-full bg-[#C5C5C5]/10 text-[#C5C5C5] text-xs font-bold">
        {value}
      </span>
    ) : (
      <p className="text-[#F1F1F1] font-medium">{value}</p>
    )}
  </div>
);

// ── Approval Status Badge ─────────────────────────────────────────────────────
const ApprovalBadge = ({ status }) => {
  const map = {
    approved: "bg-green-500/15 text-green-400 border border-green-500/20",
    declined: "bg-red-500/15 text-red-400 border border-red-500/20",
    pending:  "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  };
  const label = { approved: "Approved", declined: "Declined", pending: "Pending Review" };
  const s = status || "pending";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[s]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s === "approved" ? "bg-green-400" : s === "declined" ? "bg-red-400" : "bg-yellow-400"} animate-pulse`} />
      {label[s]}
    </span>
  );
};

// ── Status Context Menu (mirrors adminDashboard) ──────────────────────────────
const StatusContextMenu = ({ delegate, onClose, onUpdateStatus }) => {
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
    { label: "Paid",            value: "Paid",            color: "text-green-400",  dot: "bg-green-400"  },
    { label: "Pending",         value: "Pending",         color: "text-amber-400",  dot: "bg-amber-400"  },
    { label: "Invalid Consent", value: "Invalid Consent", color: "text-red-400",    dot: "bg-red-400"    },
    { label: "Invalid Payment", value: "Invalid Payment", color: "text-red-400",    dot: "bg-red-400"    },
    { label: "Missing / Invalid Picture", value: "Missing / Invalid Picture", color: "text-red-400", dot: "bg-red-400" },
  ];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1.5 z-50 bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl shadow-2xl py-2 min-w-[200px]"
    >
      <p className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/40 mb-1">
        Update Status
      </p>
      {statuses.map((s) => {
        const isActive = currentStatus === s.value || (currentStatus?.split(", ").includes(s.value));
        return (
          <button
            key={s.value}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(delegate, s.value);
            }}
            className={`flex items-center justify-between w-full px-4 py-2 text-sm transition-colors hover:bg-[#C5C5C5]/10 ${
              isActive
                ? "text-[#F1F1F1] bg-[#C5C5C5]/5"
                : "text-[#C5C5C5]/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
              <span className={isActive ? "font-bold" : ""}>{s.label}</span>
            </div>
            {isActive && (
              <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
};

const AdminRegistrations = () => {
  const [delegates, setDelegates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChurch, setSelectedChurch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDelegate, setSelectedDelegate] = useState(null);
  const [page, setPage] = useState(0);
  const [viewerImage, setViewerImage] = useState(null);
  const [openMenu, setOpenMenu] = useState(null); // delegate id with open context menu

  // Visiting church approvals
  const [visitingChurches, setVisitingChurches] = useState([]);
  const [visitingLoading, setVisitingLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const PAGE_SIZE = 25;

  useEffect(() => {
    fetchDelegates();
  }, [selectedChurch, selectedStatus, selectedRole, page]);

  useEffect(() => {
    fetchVisitingChurches();
  }, []);

  const fetchDelegates = async () => {
    setLoading(true);
    let query = supabase
      .from("delegates")
      .select("*, churches!inner(name, circuit)")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (selectedChurch) query = query.eq("churches.name", selectedChurch);
    if (selectedStatus) query = query.eq("payment_status", selectedStatus);
    if (selectedRole) query = query.eq("role", selectedRole);

    const { data } = await query;
    setDelegates(data || []);
    setLoading(false);
  };

  const fetchVisitingChurches = async () => {
    setVisitingLoading(true);
    const { data, error } = await supabase
      .from("churches")
      .select("id, name, circuit, approval_status, created_at")
      .eq("circuit", "Visiting")
      .order("created_at", { ascending: false });
    if (!error) setVisitingChurches(data || []);
    setVisitingLoading(false);
  };

  const handleApproval = async (churchId, newStatus) => {
    setApprovingId(churchId);
    const { error } = await supabase
      .from("churches")
      .update({ approval_status: newStatus })
      .eq("id", churchId);

    if (error) {
      toast.error("Failed to update approval status");
    } else {
      toast.success(
        newStatus === "approved"
          ? "Visiting church approved! They can now add delegates."
          : "Visiting church declined."
      );
      setVisitingChurches((prev) =>
        prev.map((c) => (c.id === churchId ? { ...c, approval_status: newStatus } : c))
      );
    }
    setApprovingId(null);
  };

  const handleTogglePayment = async (delegate) => {
    const newStatus = delegate.payment_status === "Paid" ? "Pending" : "Paid";
    await handleUpdateStatus(delegate, newStatus);
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
    
    setDelegates((prev) =>
      prev.map((d) =>
        d.id === delegate.id ? { ...d, payment_status: finalStatus } : d,
      ),
    );
    if (selectedDelegate?.id === delegate.id) {
      setSelectedDelegate((prev) => ({ ...prev, payment_status: finalStatus }));
    }
    if (newStatus === "Paid" || newStatus === "Pending") {
      setOpenMenu(null);
    }
  };

  // ── Client-side search filter ───────────────────────────────────────────────
  const filteredDelegates = searchQuery.trim()
    ? delegates.filter((d) => {
        const q = searchQuery.toLowerCase();
        return (
          d.full_name?.toLowerCase().includes(q) ||
          d.contact_number?.toLowerCase().includes(q) ||
          d.churches?.name?.toLowerCase().includes(q)
        );
      })
    : delegates;

  const roleCounts = delegates.reduce((acc, d) => {
    acc[d.role] = (acc[d.role] || 0) + 1;
    return acc;
  }, {});

  const ROLES = ["Camper", "Facilitator", "Camp Staff", "Guardian", "Pastor"];

  const pendingVisiting = visitingChurches.filter((c) => !c.approval_status || c.approval_status === "pending");

  const handleExport = async () => {
    const tid = toast.loading("Preparing export…");
    try {
      const { data: all, error } = await supabase
        .from("delegates")
        .select("*, churches(name, circuit, registration_fee, merch_fee, staff_discount_fee, church_fee, church_fee_status)")
        .order("created_at", { ascending: true });
      if (error) throw error;

      const wb = new ExcelJS.Workbook();
      wb.creator = "CapBYFU";
      wb.created = new Date();

      const applyHeaderStyle = (cell, bgArgb = "FF0A1614") => {
        cell.font = { bold: true, color: { argb: "FFF1F1F1" }, name: "Arial", size: 10 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgArgb } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = { bottom: { style: "medium", color: { argb: "FF22C55E" } } };
      };
      const styleHeaderRow = (row, bgArgb) => {
        row.eachCell((cell) => applyHeaderStyle(cell, bgArgb));
        row.height = 28;
      };
      const styleTotalsRow = (row) => {
        row.eachCell((cell) => {
          cell.font = { bold: true, name: "Arial", size: 10 };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
          cell.border = { top: { style: "medium", color: { argb: "FF22C55E" } } };
        });
        row.height = 20;
      };

      const SBG = {
        personal: "FF1E3A2F",
        payment:  "FF1A2E3F",
        merch:    "FF2E1A3F",
        docs:     "FF3F2E1A",
        meta:     "FF2E2E2E",
      };

      const GROUPS = [
        { label: "PERSONAL INFO", start: 1,  end: 7,  bg: SBG.personal },
        { label: "PAYMENT",       start: 8,  end: 11, bg: SBG.payment  },
        { label: "MERCHANDISE",   start: 12, end: 15, bg: SBG.merch    },
        { label: "DOCUMENTS",     start: 16, end: 18, bg: SBG.docs     },
        { label: "META",          start: 19, end: 20, bg: SBG.meta     },
      ];

      const COL_HEADERS = [
        "#", "Full Name", "Nickname", "Age", "Role", "Contact Number", "Guardian Name",
        "Payment Status", "Payment Method", "Registration Fee (₱)", "Registered At",
        "Ordered Merch?", "Shirt Size", "Shirt Color",
        "Consent Form", "Payment Proof", "ID Image",
        "Church", "Circuit",
      ];

      const COL_WIDTHS = [5, 30, 15, 6, 15, 18, 24, 16, 16, 22, 22, 14, 12, 14, 14, 16, 16, 14, 36];

      const applyGroupRows = (ws, dataRowStart) => {
        GROUPS.forEach(({ label, start, end, bg }) => {
          const cell = ws.getRow(dataRowStart - 2).getCell(start);
          cell.value = label;
          applyHeaderStyle(cell, bg);
          cell.alignment = { horizontal: "center", vertical: "middle" };
          if (end > start) ws.mergeCells(dataRowStart - 2, start, dataRowStart - 2, end);
        });
        ws.getRow(dataRowStart - 2).height = 22;

        COL_HEADERS.forEach((h, i) => {
          const cell = ws.getRow(dataRowStart - 1).getCell(i + 1);
          cell.value = h;
          const grp = GROUPS.find((g) => i + 1 >= g.start && i + 1 <= g.end);
          applyHeaderStyle(cell, grp?.bg || "FF0A1614");
        });
        ws.getRow(dataRowStart - 1).height = 26;
      };

      const buildDelegateRow = (ws, d, idx) => {
        const church = d.churches;
        const status = d.payment_status;
        const isPaid = status === "Paid";
        const isInvalid = status && (status.includes("Invalid") || status.includes("Missing"));
        
        let fee = church?.registration_fee || 160;
        if (d.role === "Pastor" || d.role === "Guardian") fee = 0;
        else if ((d.role === "Camp Staff" || d.role === "Facilitator") && church?.staff_discount_fee != null) fee = church.staff_discount_fee;
        
        const merchFee = church?.merch_fee || 200;
        const totalFee = fee + (d.include_merch ? merchFee : 0);
        const r = ws.addRow([
          idx,
          d.full_name,
          d.nickname || "",
          d.age,
          d.role,
          d.contact_number || "",
          d.guardian_name || "",
          status || "Pending",
          d.payment_method || "Online",
          totalFee,
          d.created_at ? new Date(d.created_at).toLocaleString("en-PH") : "",
          d.include_merch ? "Yes" : "No",
          d.shirt_size || "—",
          d.shirt_color || "—",
          d.age >= 18 ? "N/A (Adult)" : (d.consent_url ? "✓ Uploaded" : "✗ Missing"),
          d.payment_proof_url ? "✓ Uploaded" : "✗ Missing",
          d.id_image_url ? "✓ Uploaded" : "Check Google Drive",
          d.churches?.name || "",
          d.churches?.circuit || "",
        ]);
        r.height = 18;
        r.getCell(9).numFmt = "₱#,##0";

        // Status coloring
        let bgColor = "FFFFF3CD"; // Default amber for pending
        let fgColor = "FFB45309"; 

        if (isPaid) {
          bgColor = "FFD1FAE5";
          fgColor = "FF16A34A";
        } else if (isInvalid) {
          bgColor = "FFFEE2E2";
          fgColor = "FFB91C1C";
        }

        r.getCell(7).fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        r.getCell(7).font = { bold: true, color: { argb: fgColor }, name: "Arial" };
        r.getCell(14).font = { color: { argb: d.age >= 18 ? "FF9CA3AF" : (d.consent_url ? "FF16A34A" : "FFDC2626") }, name: "Arial" };
        r.getCell(15).font = { color: { argb: d.payment_proof_url ? "FF16A34A" : "FFB45309" }, name: "Arial" };
        r.getCell(16).font = { color: { argb: d.id_image_url ? "FF16A34A" : "FFB45309" }, name: "Arial" };
        if (d.include_merch) {
          r.getCell(11).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDE9FE" } };
          r.getCell(11).font = { bold: true, color: { argb: "FF7C3AED" }, name: "Arial" };
        }
        return r;
      };

      const byChurch = {};
      (all || []).forEach((d) => {
        const name = d.churches?.name || "Unknown";
        if (!byChurch[name]) byChurch[name] = [];
        byChurch[name].push(d);
      });
      const churchNames = Object.keys(byChurch).sort();

      const summaryWs = wb.addWorksheet("📋 Summary");
      summaryWs.columns = [
        { header: "Church",              key: "church",    width: 38 },
        { header: "Circuit",             key: "circuit",   width: 13 },
        { header: "Total Delegates",     key: "total",     width: 18 },
        { header: "Paid",                key: "paid",      width: 10 },
        { header: "Pending",             key: "pending",   width: 12 },
        { header: "Church Fee (₱)",      key: "churchFee", width: 18 },
        { header: "Merch Orders",        key: "merch",     width: 14 },
        { header: "Total Collected (₱)", key: "collected", width: 22 },
      ];
      styleHeaderRow(summaryWs.getRow(1));

      let gTotal = 0, gPaid = 0, gPending = 0, gCollected = 0, gMerch = 0;
      churchNames.forEach((church) => {
        const rows = byChurch[church];
        const paid = rows.filter((r) => r.payment_status === "Paid").length;
        const pending = rows.length - paid;
        const merch = rows.filter((r) => r.include_merch).length;
        const cSettings = rows[0]?.churches;
        const churchFee = cSettings?.church_fee || 0;
        const isChurchFeePaid = cSettings?.church_fee_status === "Paid";
        
        const delegateCollection = rows.filter((r) => r.payment_status === "Paid")
          .reduce((s, r) => {
            const c = r.churches;
            let fee = c?.registration_fee || 160;
            if (r.role === "Pastor" || r.role === "Guardian") fee = 0;
            else if ((r.role === "Camp Staff" || r.role === "Facilitator") && c?.staff_discount_fee != null) fee = c.staff_discount_fee;
            return s + fee + (r.include_merch ? (c?.merch_fee || 200) : 0);
          }, 0);
        
        const collected = delegateCollection + (isChurchFeePaid ? churchFee : 0);
        const row = summaryWs.addRow({
          church,
          circuit: rows[0]?.churches?.circuit || "",
          total: rows.length,
          paid,
          pending,
          churchFee: isChurchFeePaid ? churchFee : `(${churchFee} Pending)`,
          merch,
          collected
        });
        row.getCell("paid").font    = { bold: true, color: { argb: "FF16A34A" }, name: "Arial" };
        row.getCell("pending").font = { bold: true, color: { argb: "FFB45309" }, name: "Arial" };
        row.getCell("merch").font   = { bold: true, color: { argb: "FF7C3AED" }, name: "Arial" };
        row.getCell("collected").numFmt = "₱#,##0";
        row.height = 18;
        gTotal += rows.length; gPaid += paid; gPending += pending;
        gMerch += merch; gCollected += collected;
      });
      const sumTot = summaryWs.addRow(["TOTAL", "", gTotal, gPaid, gPending, gMerch, gCollected]);
      styleTotalsRow(sumTot);
      sumTot.getCell("collected").numFmt = "₱#,##0";
      sumTot.getCell(1).font = { bold: true, name: "Arial", size: 11 };

      const masterWs = wb.addWorksheet("📊 All Delegates");
      masterWs.columns = COL_WIDTHS.map((w, i) => ({ key: `c${i}`, width: w }));
      applyGroupRows(masterWs, 3);
      let masterIdx = 1;
      churchNames.forEach((church) => {
        const rows = byChurch[church];
        rows.forEach((d) => buildDelegateRow(masterWs, d, masterIdx++));
      });

      churchNames.forEach((church) => {
        const rows = byChurch[church];
        const circuit = rows[0]?.churches?.circuit || "";
        const sheetName = church.replace(/[/\\?*[\]:]/g, "").slice(0, 31);
        const ws = wb.addWorksheet(sheetName);
        ws.columns = COL_WIDTHS.map((w, i) => ({ key: `c${i}`, width: w }));
        const titleRow = ws.getRow(1);
        titleRow.getCell(1).value = `${church}  •  ${circuit}`;
        titleRow.getCell(1).font  = { bold: true, size: 13, color: { argb: "FF0A1614" }, name: "Arial" };
        titleRow.getCell(1).fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FF22C55E" } };
        ws.mergeCells(1, 1, 1, COL_WIDTHS.length);
        titleRow.height = 28;
        GROUPS.forEach(({ label, start, end, bg }) => {
          const cell = ws.getRow(2).getCell(start);
          cell.value = label;
          applyHeaderStyle(cell, bg);
          cell.alignment = { horizontal: "center", vertical: "middle" };
          if (end > start) ws.mergeCells(2, start, 2, end);
        });
        ws.getRow(2).height = 22;
        COL_HEADERS.forEach((h, i) => {
          const cell = ws.getRow(3).getCell(i + 1);
          cell.value = h;
          const grp = GROUPS.find((g) => i + 1 >= g.start && i + 1 <= g.end);
          applyHeaderStyle(cell, grp?.bg || "FF0A1614");
        });
        ws.getRow(3).height = 26;
        rows.forEach((d, i) => buildDelegateRow(ws, d, i + 1));
        const paid = rows.filter((r) => r.payment_status === "Paid").length;
        const merch = rows.filter((r) => r.include_merch).length;
        const cSettings = rows[0]?.churches;
        const churchFee = cSettings?.church_fee || 0;
        const isChurchFeePaid = cSettings?.church_fee_status === "Paid";

        const collected = rows.filter((r) => r.payment_status === "Paid")
          .reduce((s, r) => {
            const c = r.churches;
            let fee = c?.registration_fee || 160;
            if (r.role === "Pastor" || r.role === "Guardian") fee = 0;
            else if ((r.role === "Camp Staff" || r.role === "Facilitator") && c?.staff_discount_fee != null) fee = c.staff_discount_fee;
            return s + fee + (r.include_merch ? (c?.merch_fee || 200) : 0);
          }, 0) + (isChurchFeePaid ? churchFee : 0);
        ws.addRow([]);
        const totRow = ws.addRow([
          "", `${rows.length} delegate(s)   •   Paid: ${paid}   •   Pending: ${rows.length - paid}   •   Merch: ${merch}`,
          "", "", "", "", "", `${paid}/${rows.length} Paid`, "", collected,
          "", `${merch} orders`, "", "", "", "", "", "", "",
        ]);
        totRow.getCell(10).numFmt = "₱#,##0";
        styleTotalsRow(totRow);
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CapBYFU_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded!", { id: tid });
    } catch (err) {
      console.error(err);
      toast.error("Export failed", { id: tid });
    }
  };

  return (
    <>
      <AdminLayout
        title="Registration Management"
        headerRight={
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden sm:inline">Export to Excel</span>
          </button>
        }
      >
        {/* ── Visiting Church Approvals ───────────────────────────────────────── */}
        <div className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-xl overflow-hidden mb-8">
          <div className="p-5 border-b border-[#C5C5C5]/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[#F1F1F1] text-sm">Visiting Church Approvals</h4>
                <p className="text-[#C5C5C5]/50 text-xs">Approve or decline visiting churches before they can register delegates</p>
              </div>
            </div>
            {pendingVisiting.length > 0 && (
              <span className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-black px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                {pendingVisiting.length} Pending
              </span>
            )}
          </div>

          {visitingLoading ? (
            <div className="p-8 text-center text-[#C5C5C5]/40 text-sm">Loading…</div>
          ) : visitingChurches.length === 0 ? (
            <div className="p-8 text-center text-[#C5C5C5]/40 text-sm">
              No visiting churches have registered yet.
            </div>
          ) : (
            <div className="divide-y divide-[#C5C5C5]/10">
              {visitingChurches.map((church) => {
                const status = church.approval_status || "pending";
                const isProcessing = approvingId === church.id;
                return (
                  <motion.div
                    key={church.id}
                    layout
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-[#C5C5C5]/3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#C5C5C5]/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#C5C5C5]/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#F1F1F1]">{church.name}</p>
                        <p className="text-xs text-[#C5C5C5]/40">
                          Registered{" "}
                          {church.created_at
                            ? new Date(church.created_at).toLocaleDateString("en-PH", {
                                year: "numeric", month: "short", day: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                      <ApprovalBadge status={status} />
                    </div>

                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      {status !== "approved" && (
                        <button
                          onClick={() => handleApproval(church.id, "approved")}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 border border-green-500/25 text-green-400 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                          Approve
                        </button>
                      )}
                      {status !== "declined" && (
                        <button
                          onClick={() => handleApproval(church.id, "declined")}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-400 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          Decline
                        </button>
                      )}
                      {status === "declined" && (
                        <button
                          onClick={() => handleApproval(church.id, "pending")}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5C5C5]/10 hover:bg-[#C5C5C5]/20 border border-[#C5C5C5]/20 text-[#C5C5C5]/60 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Role summary */}
        <div className="flex flex-wrap gap-3 mb-6">
          {ROLES.map((role) => (
            <div
              key={role}
              className="bg-[#0A1614] border border-[#C5C5C5]/15 px-4 py-2 rounded-lg text-sm"
            >
              <span className="text-[#C5C5C5]/70">{role}: </span>
              <span className="font-black text-[#F1F1F1]">
                {roleCounts[role] || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5C5C5]/40 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, contact, or church…"
              className="w-full pl-10 pr-4 py-2.5 bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl text-sm text-[#F1F1F1] placeholder-[#C5C5C5]/30 focus:outline-none focus:border-[#C5C5C5]/50 focus:ring-2 focus:ring-[#C5C5C5]/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C5C5C5]/40 hover:text-[#C5C5C5] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="w-48">
            <CustomDropdown
              value={selectedChurch}
              onChange={(val) => {
                setSelectedChurch(val === "__all__" ? "" : val);
                setPage(0);
              }}
              options={[
                { value: "__all__", label: "All Churches" },
                ...CHURCHES.map((c) => ({ value: c.name, label: c.name })),
              ]}
              placeholder="All Churches"
            />
          </div>
          <div className="w-36">
            <CustomDropdown
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val === "__all__" ? "" : val);
                setPage(0);
              }}
              options={[
                { value: "__all__", label: "All Status" },
                { value: "Paid", label: "Paid" },
                { value: "Pending", label: "Pending" },
                { value: "Invalid Consent", label: "Invalid Consent" },
                { value: "Invalid Payment", label: "Invalid Payment" },
                { value: "Missing / Invalid Picture", label: "Missing / Invalid Picture" },
              ]}
              placeholder="All Status"
            />
          </div>
          <div className="w-40">
            <CustomDropdown
              value={selectedRole}
              onChange={(val) => {
                setSelectedRole(val === "__all__" ? "" : val);
                setPage(0);
              }}
              options={[
                { value: "__all__", label: "All Roles" },
                ...ROLES.map((r) => ({ value: r, label: r })),
              ]}
              placeholder="All Roles"
            />
          </div>
        </div>

        <div className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#C5C5C5]/15 flex items-center justify-between">
            <h4 className="font-bold text-[#F1F1F1]">
              Delegates —{" "}
              {searchQuery ? `${filteredDelegates.length} of ${delegates.length} results` : `${delegates.length} results`}
            </h4>
            {searchQuery && filteredDelegates.length === 0 && (
              <span className="text-xs text-[#C5C5C5]/40">No matches for "{searchQuery}"</span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#C5C5C5]/60">Loading...</div>
          ) : (
            <div className="overflow-x-auto pb-40">
              <table className="w-full text-left">
                <thead className="bg-[#C5C5C5]/5 text-[#C5C5C5]/60 text-[10px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3">Delegate</th>
                    <th className="px-6 py-3">Church</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Age</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Docs</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5C5C5]/10">
                  {filteredDelegates.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-[#C5C5C5]/60"
                      >
                        {searchQuery ? `No delegates matching "${searchQuery}"` : "No delegates found"}
                      </td>
                    </tr>
                  ) : (
                    filteredDelegates.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-[#C5C5C5]/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedDelegate(d)}
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-[#F1F1F1]">
                            {d.full_name}
                          </p>
                          {d.contact_number && (
                            <p className="text-xs text-[#C5C5C5]/60">
                              {d.contact_number}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#C5C5C5]/70">
                          {d.churches?.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#C5C5C5]/10 text-[#C5C5C5] text-[10px] font-bold uppercase whitespace-nowrap">
                            {d.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#C5C5C5]/70">
                          {d.age}
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
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {d.payment_status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            {d.payment_proof_url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewerImage({
                                    url: d.payment_proof_url,
                                    title: "Proof of Payment",
                                  });
                                }}
                                className="text-[10px] text-[#C5C5C5] bg-[#C5C5C5]/10 px-2 py-1 rounded font-bold hover:bg-[#C5C5C5]/15 transition-colors"
                              >
                                Proof
                              </button>
                            )}
                            {d.consent_url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewerImage({
                                    url: d.consent_url,
                                    title: "Consent Form",
                                  });
                                }}
                                className="text-[10px] text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded font-bold hover:bg-yellow-500/20 transition-colors"
                              >
                                Consent
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View delegate details */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDelegate(d);
                              }}
                              className="text-[#C5C5C5]/70 hover:text-[#F1F1F1] transition-colors p-1"
                              title="View details"
                            >
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
                                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                />
                              </svg>
                            </button>
                            {/* Status context menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenu(openMenu === d.id ? null : d.id);
                                }}
                                className="text-[#C5C5C5]/70 hover:text-[#F1F1F1] hover:bg-[#C5C5C5]/10 transition-colors p-1 rounded-lg"
                                title="Change status"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="5" r="1.5" />
                                  <circle cx="12" cy="12" r="1.5" />
                                  <circle cx="12" cy="19" r="1.5" />
                                </svg>
                              </button>
                              <AnimatePresence>
                                {openMenu === d.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                    transition={{ duration: 0.12 }}
                                  >
                                    <StatusContextMenu
                                      delegate={d}
                                      onClose={() => setOpenMenu(null)}
                                      onUpdateStatus={handleUpdateStatus}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-[#C5C5C5]/15 flex items-center justify-between">
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

        <AnimatePresence>
          {selectedDelegate && (
            <DelegateModal
              delegate={selectedDelegate}
              onClose={() => setSelectedDelegate(null)}
              onTogglePayment={handleTogglePayment}
              onViewImage={(url, title) => setViewerImage({ url, title })}
            />
          )}
        </AnimatePresence>
      </AdminLayout>

      <ImageViewerModal
        url={viewerImage?.url}
        title={viewerImage?.title}
        onClose={() => setViewerImage(null)}
      />
    </>
  );
};

export default AdminRegistrations;