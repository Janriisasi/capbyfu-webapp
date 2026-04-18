// src/pages/admin/adminAddAnnouncement.jsx
// Updated version — sends push notification after posting/editing an announcement

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../components/adminLayout";
import { supabase } from "../../lib/supabase";

// ─── Send push notification to all subscribers ───────────────────────────────
// This calls a Supabase Edge Function that uses Firebase Admin SDK server-side
const sendPushNotification = async ({ title, body, url, image_url }) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: { title, body, url, image_url },
    });

    if (error) throw error;
    console.log('Push notification sent:', data);
    return true;
  } catch (err) {
    console.warn('Push notification failed (non-critical):', err.message);
    return false;
  }
};
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = ["Event", "Blog", "News"];

const AdminAddAnnouncement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    category: "Event",
    content: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) fetchExisting();
  }, [id]);

  const fetchExisting = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setForm({
        title: data.title || "",
        category: data.category || "Event",
        content: data.content || "",
        image_url: data.image_url || "",
      });
      if (data.image_url) setImagePreview(data.image_url);
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image_url;
    const ext = imageFile.name.split(".").pop();
    const path = `announcements/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("media")
      .upload(path, imageFile, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      const image_url = await uploadImage();
      const payload = { ...form, image_url };

      let announcementId = id;

      if (isEdit) {
        const { error } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        toast.success("Announcement updated!");
      } else {
        const { data, error } = await supabase
          .from("announcements")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        announcementId = data.id;
        toast.success("Announcement posted!");

        // ── Send push notification to all subscribers ──────────────────────
        const notifUrl = `${window.location.origin}/announcements?id=${announcementId}`;
        const categoryEmoji = {
          Event: "📅",
          Blog: "✍️",
          News: "📣",
        }[form.category] || "📢";

        const sent = await sendPushNotification({
          title: `${categoryEmoji} ${form.title}`,
          body: `New ${form.category} from CapBYFU — tap to read more.`,
          url: notifUrl,
          image_url: image_url || undefined,
        });

        if (sent) {
          toast.success("Push notification sent to subscribers!", { icon: "🔔" });
        }
        // ──────────────────────────────────────────────────────────────────
      }

      navigate("/admin/announcements");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? "Edit Announcement" : "Add Announcement"}>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Title */}
        <div className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-[#F1F1F1] text-sm uppercase tracking-wider">
            Details
          </h3>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#C5C5C5]/60 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title..."
              className="w-full px-4 py-2.5 bg-[#C5C5C5]/5 border border-[#C5C5C5]/15 rounded-lg text-[#F1F1F1] text-sm placeholder-[#C5C5C5]/30 focus:outline-none focus:border-[#C5C5C5]/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#C5C5C5]/60 mb-1.5">
              Category
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-colors ${
                    form.category === cat
                      ? "bg-[#C5C5C5] text-[#0A1614]"
                      : "bg-[#C5C5C5]/10 text-[#C5C5C5]/60 hover:bg-[#C5C5C5]/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-xl p-6">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#C5C5C5]/60 mb-1.5">
            Content *
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your announcement content here..."
            rows={10}
            className="w-full px-4 py-3 bg-[#C5C5C5]/5 border border-[#C5C5C5]/15 rounded-lg text-[#F1F1F1] text-sm placeholder-[#C5C5C5]/30 focus:outline-none focus:border-[#C5C5C5]/40 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Image */}
        <div className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-[#F1F1F1] text-sm uppercase tracking-wider">
            Cover Image (optional)
          </h3>
          <div className="flex flex-col gap-3">
            {imagePreview && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setForm({ ...form, image_url: "" });
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-[#C5C5C5]/20 rounded-lg cursor-pointer hover:border-[#C5C5C5]/40 hover:bg-[#C5C5C5]/5 transition-colors">
              <svg className="w-5 h-5 text-[#C5C5C5]/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-[#C5C5C5]/50 text-sm font-bold">
                {imageFile ? imageFile.name : "Click to upload image"}
              </span>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>
        </div>

        {/* Push notification info banner */}
        {!isEdit && (
          <div className="flex items-start gap-3 px-4 py-3 bg-[#326f61]/10 border border-[#326f61]/20 rounded-xl">
            <svg className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-[#10b981]/80 text-xs font-bold leading-relaxed">
              A push notification will automatically be sent to all subscribers when you post this announcement.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/announcements")}
            className="px-6 py-2.5 border border-[#C5C5C5]/15 rounded-xl text-[#C5C5C5] font-bold text-sm hover:bg-[#C5C5C5]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#C5C5C5] hover:bg-[#F1F1F1] text-[#0A1614] rounded-xl font-black text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {isEdit ? "Saving..." : "Posting..."}
              </>
            ) : isEdit ? "Save Changes" : "Post Announcement"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminAddAnnouncement;