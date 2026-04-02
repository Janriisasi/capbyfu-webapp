import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/authContext";
import ImageViewerModal from "../components/imageviewerModal";

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

/* ─── Edit Delegate Modal ─────────────────────────────────────── */
const ROLES = ["Camper", "Facilitator", "Camp Staff", "Guardian", "Pastor"];
const PAYMENT_METHODS = ["GCash", "GoTyme"];
const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const EditDelegateModal = ({ delegate, onClose, onSave, driveLink }) => {
  const [form, setForm] = useState({
    full_name: delegate.full_name || "",
    age: delegate.age || "",
    contact_number: delegate.contact_number || "",
    guardian_name: delegate.guardian_name || "",
    role: delegate.role || "Camper",
    payment_method: delegate.payment_method || "GCash",
    payment_status: delegate.payment_status || "Pending", // kept internally, not editable
    include_merch: delegate.include_merch || false,
    shirt_size: delegate.shirt_size || "",
    shirt_color: delegate.shirt_color || "",
    consent_url: delegate.consent_url || null,
    payment_proof_url: delegate.payment_proof_url || null,
  });
  const [saving, setSaving] = useState(false);
  const [consentFile, setConsentFile] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (delegate.payment_status === "Paid") {
      toast.error("Cannot edit a delegate with Paid status.");
      return;
    }
    if (!form.full_name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.age || isNaN(form.age)) {
      toast.error("Valid age is required");
      return;
    }
    setSaving(true);
    const isFree = ["Pastor", "Guardian"].includes(form.role);
    const finalPaymentStatus = isFree ? "Paid" : form.payment_status;
    const finalPaymentMethod = isFree ? "Free" : form.payment_method;

    const updateData = {
      full_name: form.full_name.trim(),
      age: parseInt(form.age),
      contact_number: form.contact_number.trim(),
      guardian_name: form.guardian_name.trim(),
      role: form.role,
      payment_method: finalPaymentMethod,
      payment_status: finalPaymentStatus,
      include_merch: form.include_merch,
      shirt_size: form.include_merch ? form.shirt_size : null,
      shirt_color: form.include_merch ? form.shirt_color.trim() : null,
    };

    try {
      // Handle Consent Upload
      if (consentFile) {
        const { uploadFile } = await import("../lib/supabase");
        const path = `consent/${delegate.church_id}/${Date.now()}_${consentFile.name}`;
        const url = await uploadFile("consent-forms", path, consentFile, false);
        updateData.consent_url = url;
      }

      // Handle Payment Proof Upload
      if (paymentProofFile) {
        const { uploadFile } = await import("../lib/supabase");
        const path = `payments/${delegate.church_id}/${Date.now()}.webp`;
        const url = await uploadFile("payment-proofs", path, paymentProofFile, true);
        updateData.payment_proof_url = url;
      }

      const { error } = await supabase
        .from("delegates")
        .update(updateData)
        .eq("id", delegate.id);

      if (error) throw error;

      toast.success("Delegate updated!");
      onSave();
      onClose();
    } catch (err) {
      toast.error("Failed to save changes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

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
        className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#C5C5C5]/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C5C5C5]/10 rounded-lg text-[#C5C5C5]">
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
            </div>
            <div>
              <h2 className="font-black text-[#F1F1F1] text-sm leading-none">
                Edit Delegate
              </h2>
              <p className="text-[#C5C5C5]/40 text-xs mt-0.5">
                {delegate.full_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#C5C5C5]/40 hover:text-[#F1F1F1] transition-colors p-1.5 hover:bg-[#C5C5C5]/10 rounded-lg"
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

        {/* Scrollable body */}
        <div
          className="overflow-y-auto flex-1 px-7 py-6 space-y-5
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-[#0A1614]
          [&::-webkit-scrollbar-thumb]:bg-[#0A1614]
          [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {/* Personal Info */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/40 mb-3 border-b border-[#C5C5C5]/10 pb-2">
              Personal Information
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50">
                  Full Name *
                </label>
                <input
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className="w-full bg-[#010101] border border-[#C5C5C5]/15 rounded-xl px-4 py-2.5 text-sm text-[#F1F1F1] placeholder:text-[#C5C5C5]/30 focus:ring-1 focus:ring-[#C5C5C5]/40 outline-none transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50">
                  Age *
                </label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => set("age", e.target.value)}
                  className="w-full bg-[#010101] border border-[#C5C5C5]/15 rounded-xl px-4 py-2.5 text-sm text-[#F1F1F1] placeholder:text-[#C5C5C5]/30 focus:ring-1 focus:ring-[#C5C5C5]/40 outline-none transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50">
                  Contact Number
                </label>
                <input
                  value={form.contact_number}
                  onChange={(e) => set("contact_number", e.target.value)}
                  className="w-full bg-[#010101] border border-[#C5C5C5]/15 rounded-xl px-4 py-2.5 text-sm text-[#F1F1F1] placeholder:text-[#C5C5C5]/30 focus:ring-1 focus:ring-[#C5C5C5]/40 outline-none transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50">
                  Guardian Name
                </label>
                <input
                  value={form.guardian_name}
                  onChange={(e) => set("guardian_name", e.target.value)}
                  className="w-full bg-[#010101] border border-[#C5C5C5]/15 rounded-xl px-4 py-2.5 text-sm text-[#F1F1F1] placeholder:text-[#C5C5C5]/30 focus:ring-1 focus:ring-[#C5C5C5]/40 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Role & Payment */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/40 mb-3 border-b border-[#C5C5C5]/10 pb-2">
              Role & Payment
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50">
                  Role
                </label>
                <CustomDropdown
                  value={form.role}
                  onChange={(val) => set("role", val)}
                  options={ROLES}
                  placeholder="Select role…"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50">
                  Payment Method
                </label>
                <CustomDropdown
                  value={form.payment_method}
                  onChange={(val) => set("payment_method", val)}
                  options={PAYMENT_METHODS}
                  placeholder="Select method…"
                />
              </div>
            </div>
          </div>

          {/* Merchandise */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/40 mb-3 border-b border-[#C5C5C5]/10 pb-2">
              Merchandise
            </p>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <div
                onClick={() => set("include_merch", !form.include_merch)}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.include_merch ? "bg-[#C5C5C5]" : "bg-[#C5C5C5]/20"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.include_merch ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
              <span className="text-sm font-bold text-[#C5C5C5]">
                Include Merchandise
              </span>
            </label>
            {form.include_merch && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50">
                    Shirt Size
                  </label>
                  <CustomDropdown
                    value={form.shirt_size}
                    onChange={(val) => set("shirt_size", val)}
                    options={SHIRT_SIZES}
                    placeholder="Select size…"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50">
                    Shirt Color
                  </label>
                  <input
                    value={form.shirt_color}
                    onChange={(e) => set("shirt_color", e.target.value)}
                    placeholder="e.g. White"
                    className="w-full bg-[#010101] border border-[#C5C5C5]/15 rounded-xl px-4 py-2.5 text-sm text-[#F1F1F1] placeholder:text-[#C5C5C5]/30 focus:ring-1 focus:ring-[#C5C5C5]/40 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Individual Photo Redirect */}
          {driveLink && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex items-center justify-between gap-4">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Individual Photo</h4>
                  <p className="text-[#C5C5C5]/60 text-xs">Upload participant photo to GDrive folder</p>
               </div>
               <a 
                 href={driveLink}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
               >
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                 </svg>
                 Open GDrive
               </a>
            </div>
          )}

          {/* Documents */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/40 mb-3 border-b border-[#C5C5C5]/10 pb-2">
              Registration Documents
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Consent Form */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50 flex items-center justify-between">
                  <span>Parental Consent Form</span>
                  {form.consent_url && <span className="text-green-500 lowercase font-normal italic">Uploaded</span>}
                </label>
                <div 
                  onClick={() => document.getElementById('edit-consent-upload').click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${consentFile ? 'border-green-500/40 bg-green-500/5' : 'border-[#C5C5C5]/15 hover:border-[#C5C5C5]/30 bg-[#010101]'}`}
                >
                  <svg className={`w-6 h-6 mx-auto mb-1 ${consentFile ? 'text-green-400' : 'text-[#C5C5C5]/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-[10px] font-bold text-[#C5C5C5]/60 uppercase leading-tight">
                    {consentFile ? consentFile.name : (form.consent_url ? 'Replace Consent Form' : 'Upload Consent Form')}
                  </p>
                  <input 
                    id="edit-consent-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,image/*"
                    onChange={(e) => setConsentFile(e.target.files[0])}
                  />
                </div>
              </div>

              {/* Payment Proof */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/50 flex items-center justify-between">
                  <span>Proof of Payment</span>
                  {form.payment_proof_url && <span className="text-green-500 lowercase font-normal italic">Uploaded</span>}
                </label>
                <div 
                  onClick={() => document.getElementById('edit-payment-upload').click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${paymentProofFile ? 'border-green-500/40 bg-green-500/5' : 'border-[#C5C5C5]/15 hover:border-[#C5C5C5]/30 bg-[#010101]'}`}
                >
                  <svg className={`w-6 h-6 mx-auto mb-1 ${paymentProofFile ? 'text-green-400' : 'text-[#C5C5C5]/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[10px] font-bold text-[#C5C5C5]/60 uppercase leading-tight">
                    {paymentProofFile ? paymentProofFile.name : (form.payment_proof_url ? 'Replace Payment Proof' : 'Upload Payment Proof')}
                  </p>
                  <input 
                    id="edit-payment-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setPaymentProofFile(e.target.files[0])}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-[#C5C5C5]/10 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#C5C5C5]/15 rounded-xl text-[#C5C5C5] font-bold text-sm hover:bg-[#C5C5C5]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-[#F1F1F1] hover:bg-[#C5C5C5] text-[#010101] rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <>
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
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Delete Confirm Modal ────────────────────────────────────── */
const DeleteConfirmModal = ({ delegate, onClose, onConfirm }) => (
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
      className="bg-[#0A1614] border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl p-7"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-400"
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
        </div>
        <div>
          <h3 className="font-black text-[#F1F1F1] text-base">
            Delete Delegate?
          </h3>
          <p className="text-[#C5C5C5]/60 text-sm mt-1 leading-relaxed">
            You're about to remove{" "}
            <span className="text-[#F1F1F1] font-bold">
              {delegate?.full_name}
            </span>{" "}
            from the list. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#C5C5C5]/15 rounded-xl text-[#C5C5C5] font-bold text-sm hover:bg-[#C5C5C5]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

/* ─── Main Component ──────────────────────────────────────────── */
const ChurchAdminDashboard = () => {
  const navigate = useNavigate();
  const { churchAdmin, logoutChurchAdmin } = useAuth();
  const [delegates, setDelegates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    registration_fee: 160,
    merch_fee: 200,
    drive_link: "",
    church_fee: 0,
    church_fee_payment_url: null,
    church_fee_status: "Pending",
    staff_discount_fee: null,
  });
  const [paymentInfo, setPaymentInfo] = useState({ name: "", number: "", qrUrl: "" });
  const [consentTemplateUrl, setConsentTemplateUrl] = useState("");
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  // "pending" | "approved" | "declined" — only relevant for visiting churches
  const [approvalStatus, setApprovalStatus] = useState("approved");
  const [viewerImage, setViewerImage] = useState(null);
  const [editDelegate, setEditDelegate] = useState(null);
  const [deleteDelegate, setDeleteDelegate] = useState(null);

  useEffect(() => {
    fetchDelegates();
  }, []);

  const fetchDelegates = async () => {
    const { data: d } = await supabase
      .from("delegates")
      .select("*")
      .eq("church_id", churchAdmin.churchId)
      .order("created_at", { ascending: false });

    const { data: s } = await supabase
      .from("churches")
      .select("registration_fee, merch_fee, staff_discount_fee, circuit, approval_status, drive_link, church_fee, church_fee_payment_url, church_fee_status")
      .eq("id", churchAdmin.churchId)
      .single();

    // For visiting churches, check approval gate
    if (s?.circuit === "Visiting") {
      setApprovalStatus(s?.approval_status || "pending");
    }

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
      setConsentTemplateUrl(appSettings.consent_template_url || "");
    }

    if (s) setSettings(s);
    setDelegates(d || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteDelegate) return;
    if (deleteDelegate.payment_status === "Paid") {
      toast.error("Cannot delete a delegate with Paid status.");
      setDeleteDelegate(null);
      return;
    }
    const { error } = await supabase
      .from("delegates")
      .delete()
      .eq("id", deleteDelegate.id);
    if (error) {
      toast.error("Failed to delete delegate");
      return;
    }
    toast.success(`${deleteDelegate.full_name} removed`);
    setDeleteDelegate(null);
    fetchDelegates();
  };

  const handleChurchFeeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Uploading church fee proof...");
    try {
      const { uploadFile } = await import("../lib/supabase");
      const path = `church-fees/${churchAdmin.churchId}/${Date.now()}.webp`;
      const url = await uploadFile("payment-proofs", path, file, true);

      const { error } = await supabase
        .from("churches")
        .update({
          church_fee_payment_url: url,
          church_fee_status: "Pending" // Reset to pending on re-upload
        })
        .eq("id", churchAdmin.churchId);

      if (error) throw error;

      toast.success("Church fee proof uploaded successfully!", { id: toastId });
      fetchDelegates();
    } catch (err) {
      toast.error("Upload failed: " + err.message, { id: toastId });
    }
  };

  const stats = delegates.reduce(
    (acc, d) => {
      acc.total++;
      if (d.payment_status === "Paid") acc.paid++;
      else acc.pending++;
      acc.campers += d.role === "Camper" ? 1 : 0;
      acc.facilitators += d.role === "Facilitator" ? 1 : 0;
      acc.staff += d.role === "Camp Staff" ? 1 : 0;
      acc.guardians += d.role === "Guardian" ? 1 : 0;
      acc.pastors += d.role === "Pastor" ? 1 : 0;
      
      let regFee = settings.registration_fee;
      if (d.role === "Pastor" || d.role === "Guardian") regFee = 0;
      else if ((d.role === "Camp Staff" || d.role === "Facilitator") && settings.staff_discount_fee != null) {
        regFee = settings.staff_discount_fee;
      }

      acc.collection += regFee + (d.include_merch ? settings.merch_fee : 0);
      return acc;
    },
    {
      total: 0,
      paid: 0,
      pending: 0,
      campers: 0,
      facilitators: 0,
      staff: 0,
      guardians: 0,
      pastors: 0,
      collection: settings.church_fee || 0, // start with church fee
    },
  );

  const roleCards = [
    { label: "Campers", value: stats.campers },
    { label: "Facilitators", value: stats.facilitators },
    { label: "Camp Staff", value: stats.staff },
    { label: "Guardians", value: stats.guardians },
    { label: "Pastors", value: stats.pastors },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#010101] text-[#F1F1F1] font-display">
        {/* Header — matches registrationForm header exactly */}
        <header className="w-full border-b border-[#C5C5C5]/10 bg-[#0A1614]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex items-center justify-between h-20">
              {/* Logo — same as registrationForm */}
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
                  onClick={() => {
                    if (approvalStatus === "pending") {
                      toast.error("Your approval is still pending.");
                    } else if (approvalStatus === "declined") {
                      toast.error(
                        "Your access has been declined by the admin.",
                      );
                    } else if (isRegistrationOpen) {
                      navigate("/register/form");
                    } else {
                      toast.error("Registration is currently closed.");
                    }
                  }}
                  disabled={
                    !isRegistrationOpen || approvalStatus !== "approved"
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isRegistrationOpen && approvalStatus === "approved"
                      ? "bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 text-[#C5C5C5] hover:bg-[#C5C5C5]/20 cursor-pointer"
                      : "bg-[#C5C5C5]/5 border border-[#C5C5C5]/10 text-[#C5C5C5]/30 cursor-not-allowed"
                  }`}
                >
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
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Add Delegate
                </button>
                <button
                  onClick={() => {
                    logoutChurchAdmin();
                    navigate("/");
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

        <main className="py-6">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-5">
            {!isRegistrationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3"
              >
                <svg
                  className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
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
                <div>
                  <h4 className="font-bold text-yellow-500 text-sm">
                    Registration is Closed
                  </h4>
                  <p className="text-[#C5C5C5]/70 text-xs mt-1">
                    You cannot encode new delegates at this moment. Please wait
                    for the super admin to open the registration period.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Visiting church approval gate ────────────────────────────── */}
            {approvalStatus === "pending" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-amber-400"
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
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-400 text-sm">
                    Approval Pending
                  </h4>
                  <p className="text-[#C5C5C5]/70 text-xs mt-1 leading-relaxed">
                    Your visiting church registration is awaiting admin
                    approval. You'll be able to register delegates once a
                    CapBYFU admin reviews your account. Please check back later
                    or contact a CapBYFU officer.
                  </p>
                </div>
              </motion.div>
            )}

            {approvalStatus === "declined" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-red-400 text-sm">
                    Access Declined
                  </h4>
                  <p className="text-[#C5C5C5]/70 text-xs mt-1 leading-relaxed">
                    Your visiting church registration has been declined by the
                    admin. You are not permitted to register delegates. Please
                    contact a CapBYFU officer if you believe this is a mistake.
                  </p>
                  <button
                    onClick={() => {
                      logoutChurchAdmin();
                      navigate("/");
                    }}
                    className="mt-3 text-xs font-bold text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
                  >
                    Sign out →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Church info banner */}
            <div className="bg-[#0A1614] rounded-2xl border border-[#C5C5C5]/10 overflow-hidden">
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
                  {/* Church Fee Display */}
                    <div className="bg-[#C5C5C5]/5 border border-[#C5C5C5]/10 rounded-xl px-4 py-3 relative group/fee">
                      <div className="flex items-center justify-between gap-4 mb-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                          Church Fee
                        </p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                          settings.church_fee_status === "Paid" ? "bg-green-500/20 text-green-400" :
                          settings.church_fee_status === "Invalid" ? "bg-red-500/20 text-red-400" :
                          "bg-amber-500/20 text-amber-400"
                        }`}>
                          {settings.church_fee_status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-[#F1F1F1]">
                            ₱{(settings.church_fee || 0).toLocaleString()}
                          </span>
                        </div>
                        {settings.church_fee_status !== "Paid" && (
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="file" 
                              id="church-fee-upload" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleChurchFeeUpload}
                            />
                            <button
                              onClick={() => document.getElementById('church-fee-upload').click()}
                              className="p-1 text-[#C5C5C5]/40 hover:text-red-400 transition-colors"
                              title={settings.church_fee_payment_url ? "Re-upload Proof" : "Upload Proof"}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                              </svg>
                            </button>
                            {settings.church_fee_payment_url && (
                              <button
                                onClick={() => setViewerImage({ url: settings.church_fee_payment_url, title: "Church Fee Proof" })}
                                className="p-1 text-[#C5C5C5]/40 hover:text-blue-400 transition-colors"
                                title="View Current Proof"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                        {settings.church_fee_status === "Paid" && settings.church_fee_payment_url && (
                           <button
                             onClick={() => setViewerImage({ url: settings.church_fee_payment_url, title: "Church Fee Proof" })}
                             className="p-1 text-green-400/40 hover:text-green-400 transition-colors"
                             title="View Proof"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                           </button>
                        )}
                      </div>
                    </div>
                    <div className="bg-[#C5C5C5]/5 border border-[#C5C5C5]/10 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#C5C5C5]/40 mb-0.5">
                        Delegates Encoded
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-[#F1F1F1]">
                          {stats.total}
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
                        ₱{stats.collection.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Delegates", value: stats.total },
                {
                  label: "Est. Collection",
                  value: `₱${stats.collection.toLocaleString()}`,
                },
                { label: "Paid", value: stats.paid },
                { label: "Pending", value: stats.pending },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#0A1614] border border-[#C5C5C5]/10 p-4 rounded-xl"
                >
                  <p className="text-[#C5C5C5]/40 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    {stat.label}
                  </p>
                  <p className="text-xl font-black text-[#F1F1F1]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Role breakdown */}
            <div className="bg-[#0A1614] border border-[#C5C5C5]/10 rounded-xl p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/40 mb-3">
                Role Breakdown
              </h3>
              <div className="flex flex-wrap gap-2">
                {roleCards.map((r) => (
                  <div
                    key={r.label}
                    className="px-3 py-1.5 rounded-lg bg-[#C5C5C5]/5 border border-[#C5C5C5]/10 text-[#C5C5C5] font-bold text-xs"
                  >
                    {r.label}: <span className="text-[#F1F1F1]">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Consent Template Download */}
            {consentTemplateUrl && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-400 text-sm">Consent Form Template Available</h4>
                  <p className="text-[#C5C5C5]/70 text-xs mt-0.5 leading-relaxed">
                    Download the official consent form template. Print and have parents/guardians of delegates under 18 sign it, then upload the signed copy during registration.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const toastId = toast.loading("Downloading...");
                    try {
                      const response = await fetch(consentTemplateUrl);
                      if (!response.ok) throw new Error("Download failed");
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.style.display = "none";
                      a.href = url;
                      
                      let filename = "Consent_Form_Template.pdf";
                      const urlParts = consentTemplateUrl.split("/");
                      const lastPart = urlParts[urlParts.length - 1];
                      if (lastPart && lastPart.includes(".")) {
                        filename = lastPart.split("?")[0];
                      }
                      
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      toast.success("Downloaded successfully!", { id: toastId });
                    } catch (error) {
                      console.error("Download failed:", error);
                      window.open(consentTemplateUrl, "_blank");
                      toast.error("Opened in new tab due to an error.", { id: toastId });
                    }
                  }}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </button>
              </div>
            )}

            {/* Payment Details */}
            {(paymentInfo.qrUrl || paymentInfo.name || paymentInfo.number) && (
              <div className="bg-[#0A1614] border border-[#C5C5C5]/10 rounded-xl p-5 flex flex-col md:flex-row gap-6 items-center">
                {paymentInfo.qrUrl && (
                  <div className="flex-shrink-0 w-32 h-32 md:w-36 md:h-36 bg-white p-2 rounded-xl border border-[#C5C5C5]/10">
                    <img src={paymentInfo.qrUrl} alt="Payment QR" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-sm font-black text-[#F1F1F1] mb-1">Official Payment Details</h3>
                  <p className="text-xs text-[#C5C5C5]/50 mb-4 max-w-lg">
                    Please use the details below for your church's consolidated registration payment. Ensure to upload the proof of payment for your delegates.
                  </p>
                  <div className="space-y-2.5">
                    {paymentInfo.name && (
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/40 w-28 text-right md:text-left">Account Name</span>
                        <span className="text-sm font-bold text-[#F1F1F1]">{paymentInfo.name}</span>
                      </div>
                    )}
                    {paymentInfo.number && (
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5C5C5]/40 w-28 text-right md:text-left">Account No.</span>
                        <span className="text-sm font-bold text-[#F1F1F1]">{paymentInfo.number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Delegates table */}
            <div className="bg-[#0A1614] border border-[#C5C5C5]/10 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-[#C5C5C5]/10 flex items-center justify-between">
                <h3 className="font-bold text-[#F1F1F1]">Encoded Delegates</h3>
                <span className="text-[10px] font-bold text-[#C5C5C5]/40 uppercase tracking-widest">
                  {delegates.length} total
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-[#C5C5C5]/40 text-sm">
                  Loading...
                </div>
              ) : delegates.length === 0 ? (
                <div className="p-12 text-center">
                  <svg
                    className="w-10 h-10 text-[#C5C5C5]/10 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <p className="text-[#C5C5C5]/40 font-bold text-sm">
                    No delegates yet
                  </p>
                  <button
                    onClick={() => {
                      if (isRegistrationOpen) navigate("/register/form");
                    }}
                    disabled={!isRegistrationOpen}
                    className={`mt-4 px-5 py-2 rounded-lg font-bold text-sm transition-colors ${
                      isRegistrationOpen
                        ? "bg-[#F1F1F1] hover:bg-[#C5C5C5] text-[#010101] cursor-pointer"
                        : "bg-[#C5C5C5]/10 text-[#C5C5C5]/30 cursor-not-allowed"
                    }`}
                  >
                    Add First Delegate
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#C5C5C5]/10 text-[#C5C5C5]/40 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-5 py-3">Name</th>
                        <th className="px-5 py-3">Age</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Payment</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Merch</th>
                        <th className="px-5 py-3">Docs</th>
                        <th className="px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5C5C5]/5">
                      {delegates.map((d) => (
                        <tr
                          key={d.id}
                          className="hover:bg-[#C5C5C5]/5 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-sm text-[#F1F1F1]">
                              {d.full_name}
                            </p>
                            {d.contact_number && (
                              <p className="text-xs text-[#C5C5C5]/40">
                                {d.contact_number}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-[#C5C5C5]/60">
                            {d.age}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-1 rounded-full bg-[#C5C5C5]/10 text-[#C5C5C5] text-[10px] font-bold uppercase">
                              {d.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-[#C5C5C5]/60">
                            {d.payment_method}
                          </td>
                          <td className="px-5 py-3.5">
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
                              {d.payment_status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-[#C5C5C5]/60">
                            {d.include_merch
                              ? `${d.shirt_size || "N/A"} ${d.shirt_color || ""}`
                              : "None"}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {d.payment_proof_url && (
                                <button
                                  onClick={() =>
                                    setViewerImage({
                                      url: d.payment_proof_url,
                                      title: "Proof of Payment",
                                    })
                                  }
                                  className="text-[10px] text-[#C5C5C5] font-bold bg-[#C5C5C5]/10 border border-[#C5C5C5]/20 px-2 py-1 rounded hover:bg-[#C5C5C5]/20 transition-colors"
                                >
                                  Proof
                                </button>
                              )}
                              {d.consent_url && (
                                <button
                                  onClick={() =>
                                    setViewerImage({
                                      url: d.consent_url,
                                      title: "Consent Form",
                                    })
                                  }
                                  className="text-[10px] text-yellow-400 font-bold bg-yellow-500/10 px-2 py-1 rounded hover:bg-yellow-500/20 transition-colors"
                                >
                                  Consent
                                </button>
                              )}
                            </div>
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {d.payment_status === "Paid" ? (
                                <div
                                  title="Cannot edit a Paid delegate"
                                  className="p-1.5 rounded-lg text-[#C5C5C5]/20 cursor-not-allowed"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                  </svg>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditDelegate(d)}
                                  title="Edit delegate"
                                  className="p-1.5 rounded-lg text-[#C5C5C5]/50 hover:text-[#F1F1F1] hover:bg-[#C5C5C5]/10 transition-colors"
                                >
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
                                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                                    />
                                  </svg>
                                </button>
                              )}
                              {d.payment_status === "Paid" ? (
                                <div
                                  title="Cannot delete a Paid delegate"
                                  className="p-1.5 rounded-lg text-[#C5C5C5]/20 cursor-not-allowed"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                  </svg>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteDelegate(d)}
                                  title="Delete delegate"
                                  className="p-1.5 rounded-lg text-[#C5C5C5]/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
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
                                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <ImageViewerModal
        url={viewerImage?.url}
        title={viewerImage?.title}
        onClose={() => setViewerImage(null)}
      />

      <AnimatePresence>
        {editDelegate && (
          <EditDelegateModal
            delegate={editDelegate}
            onClose={() => setEditDelegate(null)}
            onSave={fetchDelegates}
            driveLink={settings.drive_link}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteDelegate && (
          <DeleteConfirmModal
            delegate={deleteDelegate}
            onClose={() => setDeleteDelegate(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ChurchAdminDashboard;
