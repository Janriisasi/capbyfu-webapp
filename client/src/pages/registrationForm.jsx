import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase, uploadFile, compressImage } from "../lib/supabase";

// Helper: human-readable file size
const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
import { useAuth } from "../context/authContext";
import {
  ROLES,
  SHIRT_SIZES,
  SHIRT_COLORS,
  PAYMENT_METHODS,
} from "../lib/constants";

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

// Color swatch option renderer for shirt colors
const renderColorOption = (opt) => (
  <span className="flex items-center gap-2">
    <span
      className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0"
      style={{
        backgroundColor:
          opt.toLowerCase().replace(" ", "") === "white"
            ? "#fff"
            : opt.toLowerCase(),
      }}
    />
    {opt}
  </span>
);

// ── Modals ──────────────────────────────────────────────────────────────────
const MinorConsentModal = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setUploading(true);
    try {
      onUpload(file);
      onClose();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010101]/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0A1614] border border-yellow-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-5 text-yellow-400">
          <svg
            className="w-7 h-7 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <div>
            <h3 className="font-black text-[#F1F1F1] text-base">
              Parental Consent Required
            </h3>
            <p className="text-yellow-400 text-xs">
              Participant is under 18 years old
            </p>
          </div>
        </div>
        <p className="text-[#C5C5C5] text-sm mb-5 leading-relaxed">
          Please upload a signed parental consent form (PDF or image). This is
          required for all minors.
        </p>
        <div
          onClick={() => document.getElementById("consent-file").click()}
          className="border-2 border-dashed border-[#C5C5C5]/20 rounded-xl p-6 text-center cursor-pointer hover:border-yellow-500/40 transition-colors mb-5"
        >
          <svg
            className="w-8 h-8 text-[#C5C5C5]/30 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          {file ? (
            <p className="text-[#F1F1F1] font-bold text-sm">{file.name}</p>
          ) : (
            <>
              <p className="text-[#C5C5C5] font-medium text-sm">
                Click to upload or drag and drop
              </p>
              <p className="text-[#C5C5C5]/40 text-xs mt-1 uppercase tracking-wider">
                PDF or Image up to 5MB
              </p>
            </>
          )}
          <input
            id="consent-file"
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#C5C5C5]/15 rounded-xl text-[#C5C5C5] font-bold text-sm hover:bg-[#C5C5C5]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 py-2.5 bg-yellow-500 text-black rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            Confirm Upload
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SuccessAnimation = ({ delegateName, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010101]/80 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0A1614] border border-green-500/30 rounded-3xl p-10 max-w-sm w-full shadow-2xl text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5"
      >
        <svg
          className="w-10 h-10 text-green-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </motion.div>
      <h3 className="text-xl font-black text-[#F1F1F1] mb-2">
        Successfully Encoded!
      </h3>
      <p className="text-[#C5C5C5] text-sm mb-7">
        {delegateName}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-[#C5C5C5]/15 rounded-xl text-[#C5C5C5] font-bold text-sm hover:bg-[#C5C5C5]/5 transition-colors"
        >
          View Dashboard
        </button>
        <button
          onClick={() => {
            onClose();
            window.scrollTo(0, 0);
          }}
          className="flex-1 py-2.5 bg-green-500 text-black rounded-xl font-bold text-sm hover:bg-green-400 transition-colors"
        >
          Add Another
        </button>
      </div>
    </motion.div>
  </div>
);

// ── Main Form ───────────────────────────────────────────────────────────────
const RegistrationForm = () => {
  const navigate = useNavigate();
  const { churchAdmin, logoutChurchAdmin } = useAuth();
  const [delegatesCount, setDelegatesCount] = useState(0);
  const [estimatedCollection, setEstimatedCollection] = useState(0);
  const [churchSettings, setChurchSettings] = useState({
    registration_fee: 160,
    merch_fee: 200,
    staff_discount_fee: null, // null means no discount
    drive_link: "",
  });
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consentFile, setConsentFile] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null); // { original, compressed }
  const [paymentInfo, setPaymentInfo] = useState({ name: "", number: "", qrUrl: "" });

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  
  // NEW STATES FOR BATCH REGISTRATION
  const [step, setStep] = useState(1);
  const [delegatesList, setDelegatesList] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("GCash");

  const [form, setForm] = useState({
    full_name: "",
    nickname: "",
    age: "",
    contact_number: "",
    guardian_name: "",
    role: "Camper",
    include_merch: false,
    shirt_color: "",
    shirt_size: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: delegates } = await supabase
        .from("delegates")
        .select("id, include_merch, role")
        .eq("church_id", churchAdmin.churchId);
      const { data: settings } = await supabase
        .from("churches")
        .select("registration_fee, merch_fee, staff_discount_fee, drive_link")
        .eq("id", churchAdmin.churchId)
        .single();

      const { data: appSettings } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (appSettings) {
        if (appSettings.registration_mode === "manual") {
          setIsRegistrationOpen(appSettings.manual_status === "open");
        } else {
          const now = new Date();
          const start = appSettings.auto_start_date
            ? new Date(appSettings.auto_start_date)
            : null;
          const end = appSettings.auto_end_date
            ? new Date(appSettings.auto_end_date)
            : null;
          let open = true;
          if (start && now < start) open = false;
          if (end && now > end) open = false;
          setIsRegistrationOpen(open);
        }
        setPaymentInfo({
          name: appSettings.payment_name || "",
          number: appSettings.payment_number || "",
          qrUrl: appSettings.payment_qr_url || ""
        });
      }

      if (settings) setChurchSettings(settings);
      if (delegates) {
        setDelegatesCount(delegates.length);
        const total = delegates.reduce(
          (sum, d) => {
            let baseFee = parseInt(settings?.registration_fee) ?? 160;
            if (["Pastor", "Guardian"].includes(d.role)) {
              baseFee = 0;
            } else if (["Camp Staff", "Facilitator"].includes(d.role)) {
              const discountFee = settings?.staff_discount_fee;
              if (discountFee !== null && discountFee !== undefined && discountFee !== "") {
                baseFee = parseInt(discountFee) ?? 0;
              }
            }
            return sum + baseFee + (d.include_merch ? (parseInt(settings?.merch_fee) || 200) : 0);
          },
          0,
        );
        setEstimatedCollection(total);
      }
    };
    fetchData();
  }, [churchAdmin.churchId]);

  const handleAgeChange = (e) =>
    setForm((f) => ({ ...f, age: e.target.value }));

  const handleAgeBlur = (e) => {
    const age = parseInt(e.target.value);
    if (age > 0 && age < 18 && !consentFile) setShowConsentModal(true);
  };

  const handleAddToBatch = (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return toast.error("Full name is required");
    if (!form.age) return toast.error("Age is required");
    if (parseInt(form.age) < 18 && !consentFile) {
      toast.error("Parental consent form is required for minors");
      setShowConsentModal(true);
      return;
    }

    setDelegatesList([...delegatesList, { ...form, consentFile }]);
    toast.success(`${form.full_name} added to batch!`);

    setForm({
      full_name: "",
      nickname: "",
      age: "",
      contact_number: "",
      guardian_name: "",
      role: "Camper",
      include_merch: false,
      shirt_color: "",
      shirt_size: "",
    });
    setConsentFile(null);
    window.scrollTo(0, 0);
  };

  const removeDelegate = (index) => {
    setDelegatesList(delegatesList.filter((_, i) => i !== index));
    toast.success("Delegate removed from batch");
  };

  const editDelegate = (index) => {
    const d = delegatesList[index];
    setForm({
      full_name: d.full_name,
      nickname: d.nickname || "",
      age: d.age,
      contact_number: d.contact_number,
      guardian_name: d.guardian_name,
      role: d.role,
      include_merch: d.include_merch,
      shirt_color: d.shirt_color,
      shirt_size: d.shirt_size,
    });
    setConsentFile(d.consentFile);
    setDelegatesList(delegatesList.filter((_, i) => i !== index));
    setStep(1);
    window.scrollTo(0, 0);
    toast.info(`Editing ${d.full_name}`);
  };

  const handleSubmitBatch = async () => {
    if (delegatesList.length === 0) return toast.error("No delegates in batch");

    // Free roles: Pastor/Guardian registration fee is waived
    // BUT if they include_merch, they must pay the merch fee and submit proof
    const freeRoles = ["Pastor", "Guardian"];
    const discountRoles = ["Camp Staff", "Facilitator"];

    const getEffectiveFee = (d) => {
      const role = d.role;
      const merchFee = d.include_merch ? (churchSettings.merch_fee || 200) : 0;
      if (freeRoles.includes(role)) return merchFee; // reg fee is 0, only pay merch if ordered
      const discountFee = churchSettings.staff_discount_fee;
      if (discountRoles.includes(role) && discountFee !== null && discountFee !== undefined && discountFee !== "") {
        return parseInt(discountFee) + merchFee;
      }
      return (parseInt(churchSettings.registration_fee) ?? 160) + merchFee;
    };

    // A delegate needs payment if their total fee > 0
    const needsPayment = (d) => getEffectiveFee(d) > 0;
    const anyNeedsPayment = delegatesList.some(needsPayment);
    const allFree = !anyNeedsPayment;

    if (!allFree && ["GCash", "GoTyme"].includes(paymentMethod) && !paymentProofFile) {
      // Give a specific message if it's only merch causing the payment requirement
      const onlyMerchPaying = delegatesList
        .filter(needsPayment)
        .every(d => freeRoles.includes(d.role) && d.include_merch);
      if (onlyMerchPaying) {
        return toast.error("Pastor/Guardian merch orders require proof of payment for the merch fee");
      }
      return toast.error("Proof of payment is required for online payments");
    }

    setSubmitting(true);
    try {
      let payment_proof_url = null;
      if (paymentProofFile) {
        const path = `payments/${churchAdmin.churchId}/${Date.now()}.webp`;
        payment_proof_url = await uploadFile("payment-proofs", path, paymentProofFile, true);
      }

      const insertRows = [];
      for (let i = 0; i < delegatesList.length; i++) {
        const d = delegatesList[i];
        let consent_url = null;
        if (d.consentFile) {
          const path = `consent/${churchAdmin.churchId}/${Date.now()}_${d.consentFile.name}`;
          consent_url = await uploadFile("consent-forms", path, d.consentFile, false);
        }

        const isTrulyFree = !needsPayment(d); // free only if reg fee = 0 AND no merch

        insertRows.push({
          church_id: churchAdmin.churchId,
          full_name: d.full_name.trim(),
          nickname: d.nickname?.trim() || null,
          age: parseInt(d.age),
          contact_number: d.contact_number.trim(),
          guardian_name: d.guardian_name.trim(),
          role: d.role,
          include_merch: d.include_merch,
          shirt_color: d.include_merch ? d.shirt_color : null,
          shirt_size: d.include_merch ? d.shirt_size : null,
          payment_method: isTrulyFree ? "Free" : paymentMethod,
          payment_proof_url: isTrulyFree ? null : payment_proof_url,
          consent_url,
          payment_status: isTrulyFree ? "Paid" : "Pending",
        });
      }

      const { error } = await supabase.from("delegates").insert(insertRows);
      if (error) throw error;

      const grandTotal = delegatesList.reduce((acc, d) => acc + getEffectiveFee(d), 0);

      setDelegatesCount((c) => c + delegatesList.length);
      setEstimatedCollection((c) => c + grandTotal);
      setShowSuccess(true);

      setDelegatesList([]);
      setPaymentProofFile(null);
      setCompressedSize(null);
      setStep(1);
      window.scrollTo(0, 0);
    } catch (err) {
      toast.error("Failed to save delegates: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Roles that don't need to pay at all
  const FREE_ROLES = ["Pastor", "Guardian"];
  // Roles that get a discounted fee (if staff_discount_fee is set)
  const DISCOUNT_ROLES = ["Camp Staff", "Facilitator"];

  // Returns the registration fee only (not merch)
  const getRoleFee = (role) => {
    if (FREE_ROLES.includes(role)) return 0;
    const discountFee = churchSettings.staff_discount_fee;
    if (DISCOUNT_ROLES.includes(role) && discountFee !== null && discountFee !== undefined && discountFee !== "") {
      return parseInt(discountFee) ?? 0;
    }
    return parseInt(churchSettings.registration_fee) ?? 160;
  };

  // A delegate needs payment if reg fee > 0 OR they ordered merch
  const delegateNeedsPayment = (d) => getRoleFee(d.role) > 0 || d.include_merch;
  const delegatesNeedingPayment = delegatesList.filter(delegateNeedsPayment);
  const allDelegatesFree = delegatesList.length > 0 && delegatesNeedingPayment.length === 0;

  const needsProof = ["GCash", "GoTyme"].includes(paymentMethod) && !allDelegatesFree;

  // Input class reused throughout
  const inputCls =
    "w-full rounded-xl border border-[#C5C5C5]/20 bg-[#0A1614] text-[#F1F1F1] placeholder-[#C5C5C5]/30 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#C5C5C5]/30 focus:border-[#C5C5C5]/50 outline-none transition-all";
  const labelCls =
    "block text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/60 mb-1.5";
  const sectionCls =
    "bg-[#0A1614] p-5 rounded-xl border border-[#C5C5C5]/10 shadow-sm";
  const sectionTitleCls =
    "text-base font-bold text-[#F1F1F1] flex items-center gap-2 mb-5";

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[#010101] overflow-x-hidden font-display">
      {/* Header */}
      <header className="w-full border-b border-[#C5C5C5]/10 bg-[#0A1614]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo — replace logo.png with your own file */}
            <img
              src="/assets/logo.png"
              alt="CapBYFU Logo"
              className="h-32 w-32 object-contain"
            />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold uppercase text-[#C5C5C5]/50 leading-none">
                  Church President
                </p>
                <p className="text-sm font-bold text-[#F1F1F1]">
                  {churchAdmin.churchName}
                </p>
              </div>
              <button
                onClick={() => navigate("/register/dashboard")}
                className="bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 text-[#C5C5C5] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#C5C5C5]/20 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  logoutChurchAdmin();
                  navigate("/register");
                }}
                className="text-[#C5C5C5]/40 hover:text-red-400 transition-colors p-1.5"
                title="Logout"
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
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Church info banner */}
          <div className="mb-6 bg-[#0A1614] rounded-2xl border border-[#C5C5C5]/10 overflow-hidden">
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5C5C5]/50">
                      Authenticated Session
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-[#F1F1F1]">
                    {churchAdmin.churchName}
                  </h2>
                  <p className="text-[#C5C5C5]/50 text-xs">
                    Circuit {churchAdmin.circuit}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#C5C5C5]/5 border border-[#C5C5C5]/10 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#C5C5C5]/40 mb-0.5">
                      Delegates Encoded
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-[#F1F1F1]">
                        {delegatesCount}
                      </span>
                      <span className="text-xs text-[#C5C5C5]/40 font-medium">
                        Members
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#C5C5C5]/5 border border-[#C5C5C5]/10 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#C5C5C5]/40 mb-0.5">
                      Est. Collection
                    </p>
                    <span className="text-xl font-black text-[#C5C5C5]">
                      ₱{estimatedCollection.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-black text-[#F1F1F1] mb-1 tracking-tight">
              Delegate Registration
            </h2>
            <p className="text-[#C5C5C5]/50 text-sm">
              Encode a new member from your local church for the upcoming Youth
              Camp.
            </p>
          </div>

          {!isRegistrationOpen ? (
            <div className="bg-[#0A1614] border border-red-500/20 rounded-2xl p-10 text-center max-w-2xl mx-auto shadow-2xl mt-10">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-[#F1F1F1] mb-3">
                Registration is Currently Closed
              </h3>
              <p className="text-[#C5C5C5]/70 text-sm mb-6 leading-relaxed">
                The registration period for the upcoming Youth Camp is currently
                not open. Please check with your super admin or return at a
                later date.
              </p>
              <button
                type="button"
                onClick={() => navigate("/register/dashboard")}
                className="bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 text-[#C5C5C5] px-6 py-3 rounded-xl font-bold hover:bg-[#C5C5C5]/20 hover:text-[#F1F1F1] transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleAddToBatch} className="space-y-5">
              {/* Personal Info */}
              <section className={sectionCls}>
                <h3 className={sectionTitleCls}>
                  <svg
                    className="w-4 h-4 text-[#C5C5C5]/60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, full_name: e.target.value }))
                        }
                        placeholder="Juan Dela Cruz"
                        className={inputCls}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Nickname (for ID) *</label>
                      <input
                        type="text"
                        value={form.nickname}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, nickname: e.target.value }))
                        }
                        placeholder="Juani"
                        className={inputCls}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Age *</label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={handleAgeChange}
                      onBlur={handleAgeBlur}
                      placeholder="Enter age"
                      min="1"
                      max="100"
                      className={inputCls}
                      required
                    />
                    {parseInt(form.age) < 18 && form.age && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-500 text-xs font-bold">
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
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                          />
                        </svg>
                        {consentFile
                          ? `Consent: ${consentFile.name} ✓`
                          : "Parental consent required"}
                        <button
                          type="button"
                          onClick={() => setShowConsentModal(true)}
                          className="underline"
                        >
                          {consentFile ? "Change" : "Upload"}
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Contact Number</label>
                    <input
                      type="tel"
                      maxLength="11"
                      value={form.contact_number}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        if (v.length <= 11)
                          setForm((f) => ({ ...f, contact_number: v }));
                      }}
                      placeholder="09123456789"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className={labelCls}>
                      Guardian / Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={form.guardian_name}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          guardian_name: e.target.value,
                        }))
                      }
                      placeholder="Parent or Guardian Name"
                      className={inputCls}
                    />
                  </div>
                </div>
              </section>

              {/* ID Upload / Google Drive */}
              <section className={sectionCls}>
                <h3 className={sectionTitleCls}>
                  <svg
                    className="w-4 h-4 text-[#C5C5C5]/60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                    />
                  </svg>
                  ID Upload
                </h3>
                {churchSettings.drive_link ? (
                  <div className="bg-[#C5C5C5]/5 border border-[#C5C5C5]/10 rounded-xl p-4">
                    <p className="text-sm text-[#C5C5C5]/60 mb-3">
                      Please upload the delegate's 1:1 picture. Make sure to rename the file as [Full Name].jpg/png (e.g. Juan Dela Cruz.jpg) to avoid confusion.
                    </p>
                    <a
                      href={churchSettings.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 text-[#F1F1F1] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#C5C5C5]/20 transition-colors"
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
                      Open {churchAdmin.churchName} Drive Folder
                    </a>
                  </div>
                ) : (
                  <p className="text-[#C5C5C5]/40 text-sm italic">
                    No Google Drive link set. Please ask the admin to set it in
                    the dashboard.
                  </p>
                )}
              </section>

              {/* Assignment */}
              <section className={sectionCls}>
                <h3 className={sectionTitleCls}>
                  <svg
                    className="w-4 h-4 text-[#C5C5C5]/60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                    />
                  </svg>
                  Assignment
                </h3>
                <label className={labelCls}>Role in Camp</label>
                <CustomDropdown
                  value={form.role}
                  onChange={(val) => setForm((f) => ({ ...f, role: val }))}
                  options={ROLES}
                  placeholder="Select role…"
                />
              </section>

              {/* Merchandise */}
              <section className={sectionCls}>
                <h3 className={sectionTitleCls}>
                  <svg
                    className="w-4 h-4 text-[#C5C5C5]/60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  Merchandise{" "}
                  <span className="text-xs font-normal text-[#C5C5C5]/40 ml-1">
                    (Optional)
                  </span>
                </h3>
                <div className="space-y-4">
                  {/* Shirt toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#C5C5C5]/5 border border-[#C5C5C5]/10 rounded-xl">
                    <div>
                      <p className="font-bold text-[#F1F1F1] text-sm">
                        Shirt Order (+₱{churchSettings.merch_fee || 200})
                      </p>
                      <p className="text-xs text-[#C5C5C5]/40">
                        Include official camp shirt in registration?
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.include_merch}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            include_merch: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[#C5C5C5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C5C5C5]/80"></div>
                    </label>
                  </div>

                  {form.include_merch && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Shirt Color</label>
                        <input
                          type="text"
                          value={form.shirt_color}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              shirt_color: e.target.value,
                            }))
                          }
                          placeholder="e.g. White, Black…"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Shirt Size</label>
                        <CustomDropdown
                          value={form.shirt_size}
                          onChange={(val) =>
                            setForm((f) => ({ ...f, shirt_size: val }))
                          }
                          options={SHIRT_SIZES}
                          placeholder="Select size…"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Submit to Batch / Proceed */}
              <div className="pb-8 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 hover:bg-[#C5C5C5]/20 text-[#F1F1F1] py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Delegate to Batch
                </button>
                {delegatesList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setStep(2); window.scrollTo(0, 0); }}
                    className="w-full bg-[#F1F1F1] hover:bg-[#C5C5C5] text-[#010101] py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 text-base shadow-lg"
                  >
                    View Batch ({delegatesList.length}) & Proceed to Payment
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => setStep(1)} 
                  className="text-sm font-bold text-[#C5C5C5]/60 hover:text-[#C5C5C5] transition-colors flex items-center gap-2 bg-[#0A1614] px-3 py-1.5 rounded-lg border border-[#C5C5C5]/10 hover:border-[#C5C5C5]/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  Add More Delegates
                </button>
                <div className="text-sm font-bold text-[#F1F1F1] px-3 py-1.5 rounded-lg bg-[#0A1614] border border-[#C5C5C5]/10 flex items-center gap-1.5">
                  <span className="w-2h-2 rounded-full bg-green-400"></span>
                  <span className="text-green-400">{delegatesList.length}</span> in Batch
                </div>
              </div>

              {/* Preview Table */}
              <section className={sectionCls}>
                <h3 className={sectionTitleCls}>
                  <svg className="w-4 h-4 text-[#C5C5C5]/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  Review Batch Details
                </h3>
                <div className="border border-[#C5C5C5]/10 rounded-xl overflow-hidden bg-[#C5C5C5]/5 overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#C5C5C5]/5 border-b border-[#C5C5C5]/10 text-xs uppercase tracking-wider text-[#C5C5C5]/60 font-bold">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3 text-center">Age (Consent)</th>
                        <th className="px-4 py-3 text-center">Merch</th>
                        <th className="px-4 py-3 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5C5C5]/10 text-[#F1F1F1] font-medium">
                      {delegatesList.map((d, index) => (
                        <tr key={index} className="hover:bg-[#C5C5C5]/5">
                          <td className="px-4 py-3">{d.full_name}</td>
                          <td className="px-4 py-3 text-[#C5C5C5]/80">{d.role}</td>
                          <td className="px-4 py-3 text-center">
                            {d.age} {d.consentFile ? <span className="text-green-400 text-xs ml-1" title="Consent Form attached">✓</span> : null}
                          </td>
                          <td className="px-4 py-3 text-center text-xs">
                            {d.include_merch ? (
                               <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Yes</span>
                            ) : (
                               <span className="bg-[#C5C5C5]/10 text-[#C5C5C5]/40 px-2 py-0.5 rounded-full">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => editDelegate(index)}
                                className="text-[#C5C5C5]/40 hover:text-blue-400 transition-colors p-1"
                                title="Edit"
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
                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => removeDelegate(index)}
                                className="text-[#C5C5C5]/40 hover:text-red-400 transition-colors p-1"
                                title="Remove"
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
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {delegatesList.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-[#C5C5C5]/40 italic">No delegates added yet. Go back and add some!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Payment Section */}
              <section className={sectionCls}>
                <h3 className={sectionTitleCls}>
                  <svg className="w-4 h-4 text-[#C5C5C5]/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  Payment For Batch
                </h3>

                {/* All-free notice: Pastor/Guardian don't pay */}
                {allDelegatesFree && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3 mb-4">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-green-400">No Payment Required</p>
                    </div>
                  </div>
                )}

                {/* Partial free notice */}
                {!allDelegatesFree && delegatesList.some(d => FREE_ROLES.includes(d.role)) && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-3 mb-4">
                    <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    <p className="text-xs text-blue-400/80">Pastor/Guardian delegates are exempt from registration fees and will be marked as Paid automatically.</p>
                  </div>
                )}

                {needsProof && (paymentInfo.qrUrl || paymentInfo.name || paymentInfo.number) && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row gap-5 mb-4 items-center sm:items-start">
                    {paymentInfo.qrUrl && (
                      <div className="flex-shrink-0 w-24 h-24 bg-white p-1.5 rounded-lg border border-[#C5C5C5]/20 shadow-xl">
                        <img src={paymentInfo.qrUrl} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
                      <p className="text-xs text-amber-500/80 font-bold mb-2">Please transfer the payment to:</p>
                      {paymentInfo.name && (
                        <p className="text-sm font-bold text-amber-400"><span className="text-[10px] text-amber-500/50 mr-2 uppercase tracking-widest">Name:</span> {paymentInfo.name}</p>
                      )}
                      {paymentInfo.number && (
                        <p className="text-sm font-bold text-amber-400"><span className="text-[10px] text-amber-500/50 mr-2 uppercase tracking-widest">No.:</span> {paymentInfo.number}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Payment method — only show if some delegates need payment */}
                  {!allDelegatesFree && (
                    <div>
                      <label className={labelCls}>Payment Method</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2.5 rounded-xl border font-bold text-sm transition-all ${
                              paymentMethod === method
                                ? "border-[#C5C5C5]/60 bg-[#C5C5C5]/15 text-[#F1F1F1]"
                                : "border-[#C5C5C5]/10 text-[#C5C5C5]/40 hover:border-[#C5C5C5]/30 hover:text-[#C5C5C5]"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-[#C5C5C5]/5 border border-[#C5C5C5]/10 rounded-xl space-y-2">
                    {/* Per-delegate fee breakdown */}
                    {delegatesList.map((d, i) => {
                      const regFee = getRoleFee(d.role);
                      const isFreeRole = FREE_ROLES.includes(d.role);
                      const isDiscount = DISCOUNT_ROLES.includes(d.role) && churchSettings.staff_discount_fee != null;
                      const merchFee = d.include_merch ? (churchSettings.merch_fee || 200) : 0;
                      return (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-[#C5C5C5]/60 truncate max-w-[180px]">
                            {d.full_name} <span className="text-[#C5C5C5]/40">({d.role})</span>
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`font-bold ${isFreeRole ? "text-green-400" : isDiscount ? "text-blue-400" : "text-[#F1F1F1]"}`}>
                              {isFreeRole ? "FREE" : `₱${regFee.toLocaleString()}`}
                              {isDiscount && <span className="text-[9px] text-blue-400/60 ml-1">discount</span>}
                            </span>
                            {d.include_merch && (
                              <span className="text-purple-400 font-bold">
                                +₱{merchFee.toLocaleString()} merch
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between border-t border-[#C5C5C5]/10 pt-2">
                      <span className="text-sm font-bold text-[#C5C5C5]">
                        Grand Total
                      </span>
                      <span className="text-xl font-black text-[#F1F1F1]">
                        ₱{delegatesList.reduce((acc, d) => {
                          return acc + getRoleFee(d.role) + (d.include_merch ? (churchSettings.merch_fee || 200) : 0);
                        }, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {needsProof && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className={`${labelCls} text-red-400`}>
                          Proof of Payment * (Required for {paymentMethod})
                        </label>
                        <div
                          onClick={() => document.getElementById("payment-proof").click()}
                          className="border-2 border-dashed border-[#C5C5C5]/15 rounded-xl p-5 text-center cursor-pointer hover:border-[#C5C5C5]/30 transition-colors"
                        >
                          {paymentProofFile ? (
                            <div className="space-y-1">
                              <p className="text-green-400 font-bold text-sm truncate max-w-[220px] mx-auto">
                                ✓ {paymentProofFile.name}
                              </p>
                              {compressedSize ? (
                                <div className="flex items-center justify-center gap-2 text-xs font-bold">
                                  <span className="text-[#C5C5C5]/50 line-through">
                                    {fmtSize(compressedSize.original)}
                                  </span>
                                  <span className="text-[#C5C5C5]/40">→</span>
                                  <span className="text-green-400">
                                    {fmtSize(compressedSize.compressed)}
                                  </span>
                                  <span className="text-green-500/70 bg-green-500/10 px-1.5 py-0.5 rounded-full text-[10px]">
                                    -{Math.round((1 - compressedSize.compressed / compressedSize.original) * 100)}%
                                  </span>
                                </div>
                              ) : (
                                <p className="text-[#C5C5C5]/40 text-xs animate-pulse">
                                  Calculating compression…
                                </p>
                              )}
                            </div>
                          ) : (
                            <>
                              <svg className="w-7 h-7 text-[#C5C5C5]/20 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                              </svg>
                              <p className="text-[#C5C5C5]/50 font-medium text-sm">
                                Click to upload screenshot/photo
                              </p>
                              <p className="text-[#C5C5C5]/30 text-xs mt-1">
                                Upload 1 receipt for the entire batch.
                              </p>
                            </>
                          )}
                          <input
                            id="payment-proof"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              setPaymentProofFile(file);
                              setCompressedSize(null);
                              const compressed = await compressImage(file);
                              setCompressedSize({
                                original: file.size,
                                compressed: compressed.size,
                              });
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>



              {/* Submit Batch */}
              <div className="pb-8">
                <button
                  type="button"
                  onClick={handleSubmitBatch}
                  disabled={submitting || delegatesList.length === 0}
                  className="w-full bg-[#F1F1F1] hover:bg-[#C5C5C5] text-[#010101] py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-base shadow-lg"
                >
                  {submitting ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Submit Batch of {delegatesList.length} Delegate{delegatesList.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showConsentModal && (
          <MinorConsentModal
            onClose={() => setShowConsentModal(false)}
            onUpload={(file) => {
              setConsentFile(file);
              toast.success("Consent form attached!");
            }}
          />
        )}
        {showSuccess && (
          <SuccessAnimation
            delegateName="The encoded delegate(s) have been successfully submitted."
            onClose={() => {
              setShowSuccess(false);
              navigate("/register/dashboard");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationForm;