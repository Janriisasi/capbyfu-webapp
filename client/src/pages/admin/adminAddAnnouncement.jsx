import React, { useState, useEffect, useRef, useCallback } from "react";
import DOMPurify from "dompurify";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  RemoveFormatting,
} from "lucide-react";
import AdminLayout from "../../components/adminLayout";
import { supabase, uploadFile } from "../../lib/supabase";
import { ANNOUNCEMENT_CATEGORIES } from "../../lib/constants";

// ─── Send push notification to all subscribers via Supabase Edge Function ────
const sendPushNotification = async ({ title, body, url, image_url }) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-push-notification", {
      body: { title, body, url, image_url },
    });
    if (error) throw error;
    console.log("Push notification sent:", data);
    return true;
  } catch (err) {
    console.warn("Push notification failed (non-critical):", err.message);
    return false;
  }
};
// ─────────────────────────────────────────────────────────────────────────────

const AdminAddAnnouncement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    category: "Event",
    excerpt: "",
    content: "",
    event_date: "",
    event_location: "",
    author: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  useEffect(() => {
    if (isEdit) {
      supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              title: data.title || "",
              category: data.category || "Event",
              excerpt: data.excerpt || "",
              content: data.content || "",
              event_date: data.event_date ? data.event_date.split("T")[0] : "",
              event_location: data.event_location || "",
              author: data.author || "",
            });
            setExistingImageUrl(data.image_url || "");
            setImagePreview(data.image_url || "");
            setTimeout(() => {
              if (editorRef.current) {
                document.execCommand("defaultParagraphSeparator", false, "p");
                editorRef.current.innerHTML = DOMPurify.sanitize(data.content || "");
              }
            }, 0);
          }
        });
    } else {
      setTimeout(() => {
        if (editorRef.current) {
          document.execCommand("defaultParagraphSeparator", false, "p");
        }
      }, 0);
    }
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEditorInput = () => {
    const html = editorRef.current?.innerHTML || "";
    setForm((f) => ({ ...f, content: html }));
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  };

  const execCmd = useCallback((cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    handleEditorInput();
    updateActiveFormats();
  }, []);

  const insertBulletList = () => {
    editorRef.current?.focus();
    document.execCommand("insertUnorderedList", false, null);
    handleEditorInput();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      let image_url = existingImageUrl;

      if (imageFile) {
        const path = `announcements/${Date.now()}.webp`;
        image_url = await uploadFile(
          "announcement-images",
          path,
          imageFile,
          true,
        );
      }

      const payload = {
        title: form.title.trim(),
        category: form.category,
        excerpt: form.excerpt.trim(),
        content: form.content,
        event_date: form.event_date || null,
        event_location: form.event_location.trim() || null,
        author: form.author.trim() || "Admin",
        image_url,
      };

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
        toast.success("Announcement published!");

        // ── Send push notification to all subscribers ──────────────────────
        const announcementId = data.id;
        const notifUrl = `${window.location.origin}/announcements?id=${announcementId}`;
        const categoryEmoji = { Event: "📅", Blog: "✍️", News: "📣" }[form.category] || "📢";

        const sent = await sendPushNotification({
          title: `${categoryEmoji} ${form.title.trim()}`,
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
      toast.error("Failed to save: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? "Edit Announcement" : "Create Announcement"}>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="w-full lg:w-3/5 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-[#F1F1F1]">
              {isEdit ? "Edit Announcement" : "Create Announcement"}
            </h2>
            <p className="text-[#C5C5C5]/70 text-sm mt-1">
              Broadcast updates to the youth union.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#0A1614]/50 border border-[#C5C5C5]/15 rounded-2xl p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-[#C5C5C5]">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Annual Youth Camp 2026 Registration Now Open"
                  className="w-full bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl p-3 text-[#F1F1F1] focus:ring-2 focus:ring-[#C5C5C5]/40 focus:border-[#C5C5C5]/40 outline-none"
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-[#C5C5C5]">
                  Author / Writer
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author: e.target.value }))
                  }
                  placeholder="e.g. Juan Dela Cruz (Defaults to 'Admin')"
                  className="w-full bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl p-3 text-[#F1F1F1] focus:ring-2 focus:ring-[#C5C5C5]/40 focus:border-[#C5C5C5]/40 outline-none"
                />
              </div>

              {/* Category + Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-[#C5C5C5]">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl p-3 text-[#F1F1F1] focus:ring-2 focus:ring-[#C5C5C5]/40 outline-none"
                  >
                    {ANNOUNCEMENT_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-[#C5C5C5]">
                    Featured Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-[#0A1614] border border-dashed border-[#C5C5C5]/20 rounded-xl p-2 text-sm text-[#C5C5C5]/70 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C5C5C5] file:text-[#0A1614] hover:file:bg-[#F1F1F1]"
                  />
                </div>
              </div>

              {/* Event fields */}
              {form.category === "Event" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-[#C5C5C5]">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={form.event_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, event_date: e.target.value }))
                      }
                      className="w-full bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl p-3 text-[#F1F1F1] focus:ring-2 focus:ring-[#C5C5C5]/40 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-[#C5C5C5]">
                      Event Location
                    </label>
                    <input
                      type="text"
                      value={form.event_location}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          event_location: e.target.value,
                        }))
                      }
                      placeholder="e.g. Main Hall, Roxas City"
                      className="w-full bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl p-3 text-[#F1F1F1] focus:ring-2 focus:ring-[#C5C5C5]/40 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-[#C5C5C5]">
                  Excerpt (short summary)
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, excerpt: e.target.value }))
                  }
                  rows={2}
                  placeholder="Brief description shown on announcement cards..."
                  className="w-full bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl p-3 text-[#F1F1F1] focus:ring-2 focus:ring-[#C5C5C5]/40 outline-none resize-none"
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-[#C5C5C5]">
                  Content / Description
                </label>
                <div className="bg-[#0A1614] border border-[#C5C5C5]/20 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#C5C5C5]/40 focus-within:border-[#C5C5C5]/40 transition-all">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#C5C5C5]/20 bg-[#C5C5C5]/5">
                    <button type="button" onClick={() => execCmd("bold")} className={`p-1.5 rounded hover:bg-[#C5C5C5]/20 ${activeFormats.bold ? "bg-[#C5C5C5]/20 text-[#F1F1F1]" : "text-[#C5C5C5]"}`}>
                      <Bold size={16} />
                    </button>
                    <button type="button" onClick={() => execCmd("italic")} className={`p-1.5 rounded hover:bg-[#C5C5C5]/20 ${activeFormats.italic ? "bg-[#C5C5C5]/20 text-[#F1F1F1]" : "text-[#C5C5C5]"}`}>
                      <Italic size={16} />
                    </button>
                    <button type="button" onClick={() => execCmd("underline")} className={`p-1.5 rounded hover:bg-[#C5C5C5]/20 ${activeFormats.underline ? "bg-[#C5C5C5]/20 text-[#F1F1F1]" : "text-[#C5C5C5]"}`}>
                      <Underline size={16} />
                    </button>
                    <div className="w-px h-4 bg-[#C5C5C5]/20 mx-1" />
                    <button type="button" onClick={insertBulletList} className="p-1.5 rounded hover:bg-[#C5C5C5]/20 text-[#C5C5C5]">
                      <List size={16} />
                    </button>
                    <button type="button" onClick={() => execCmd("insertOrderedList")} className="p-1.5 rounded hover:bg-[#C5C5C5]/20 text-[#C5C5C5]">
                      <ListOrdered size={16} />
                    </button>
                    <div className="w-px h-4 bg-[#C5C5C5]/20 mx-1" />
                    <button type="button" onClick={() => execCmd("removeFormat")} className="p-1.5 rounded hover:bg-[#C5C5C5]/20 text-[#C5C5C5]">
                      <RemoveFormatting size={16} />
                    </button>
                  </div>
                  {/* Editor Area */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    onKeyUp={updateActiveFormats}
                    onMouseUp={updateActiveFormats}
                    className="p-4 min-h-[200px] text-[#F1F1F1] outline-none whitespace-pre-wrap
                      [&_b]:font-bold [&_strong]:font-bold
                      [&_i]:italic [&_em]:italic
                      [&_u]:underline
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                      [&_p]:mb-4 [&_div]:mb-4"
                  />
                </div>
              </div>

              {/* Push notification info banner — only shown when creating, not editing */}
              {!isEdit && (
                <div className="flex items-start gap-3 px-4 py-3 bg-[#326f61]/10 border border-[#326f61]/20 rounded-xl">
                  <svg className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  <p className="text-[#10b981]/80 text-xs font-bold leading-relaxed">
                    A push notification will automatically be sent to all subscribers when you publish this announcement.
                  </p>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#C5C5C5] hover:bg-[#F1F1F1] text-[#0A1614] py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                >
                  {submitting ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">
                        {isEdit ? "Update Announcement" : "Publish Announcement"}
                      </span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/announcements")}
                  className="px-4 bg-white/10 hover:bg-white/20 text-[#F1F1F1] py-2.5 rounded-xl font-bold transition-all text-sm whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="w-full lg:w-2/5">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-[#C5C5C5]/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-xs font-black uppercase tracking-widest">
                Live Preview
              </h3>
            </div>
            <div className="bg-[#F1F1F1] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/5 min-h-[500px] flex flex-col">
              <div className="bg-white border-b border-slate-100 p-4 flex justify-between items-center">
                <div className="w-20 h-4 bg-slate-200 rounded" />
                <div className="flex gap-2">
                  <div className="w-8 h-2 bg-slate-100 rounded" />
                  <div className="w-8 h-2 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="flex-grow p-6 bg-white overflow-y-auto">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="rounded-xl aspect-video w-full object-cover mb-6"
                  />
                ) : (
                  <div className="rounded-xl bg-slate-100 aspect-video mb-6 flex items-center justify-center text-[#C5C5C5]">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                    </svg>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1 bg-[#C5C5C5]/10 text-[#C5C5C5] text-[10px] font-black rounded-full uppercase">
                    {form.category || "Category"}
                  </div>
                  <h4 className="text-xl font-black text-[#0A1614] leading-tight">
                    {form.title || "Your Title Will Appear Here"}
                  </h4>
                  <div className="flex items-center gap-2 text-[#C5C5C5]/70 text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                    </svg>
                    <span>
                      {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>By {form.author || "Admin"}</span>
                  </div>
                  {form.excerpt && (
                    <p className="text-[#0A1614]/60 text-sm leading-relaxed italic border-l-2 border-slate-200 pl-3 whitespace-pre-wrap">
                      {form.excerpt}
                    </p>
                  )}
                  {form.content && (
                    <div
                      className="text-[#0A1614]/70 text-sm leading-relaxed mt-2 border-t border-slate-100 pt-3 whitespace-pre-wrap
                        [&_b]:font-bold [&_strong]:font-bold
                        [&_i]:italic [&_em]:italic
                        [&_u]:underline
                        [&_h3]:text-base [&_h3]:font-black [&_h3]:text-[#0A1614] [&_h3]:mb-1 [&_h3]:mt-2
                        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                        [&_li]:text-[#0A1614]/70
                        [&_p]:mb-4 [&_div]:mb-4"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.content) }}
                    />
                  )}
                  <div className="pt-4">
                    <div className="h-10 w-32 bg-[#C5C5C5] rounded-lg flex items-center justify-center text-[#0A1614] text-xs font-bold">
                      Read More
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#0A1614] p-4 mt-auto">
                <div className="w-24 h-2 bg-white/10 rounded mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAddAnnouncement;