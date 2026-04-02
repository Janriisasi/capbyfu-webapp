import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AdminLayout from "../../components/adminLayout";
import { supabase } from "../../lib/supabase";

const DeleteConfirmModal = ({ announcement, onClose, onConfirm }) => (
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
            Delete Announcement?
          </h3>
          <p className="text-[#C5C5C5]/60 text-sm mt-1 leading-relaxed">
            You're about to delete{" "}
            <span className="text-[#F1F1F1] font-bold">
              "{announcement?.title}"
            </span>
            . This cannot be undone.
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

const AdminAnnouncements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", deleteTarget.id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Announcement deleted");
    setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const categoryColor = (cat) => {
    switch (cat) {
      case "Event":
        return "bg-blue-500/10 text-blue-400";
      case "Blog":
        return "bg-purple-500/10 text-purple-400";
      case "News":
        return "bg-green-500/10 text-green-400";
      default:
        return "bg-slate-500/10 text-[#C5C5C5]/70";
    }
  };

  return (
    <AdminLayout
      title="Announcements Management"
      headerRight={
        <button
          onClick={() => navigate("/admin/announcements/add")}
          className="bg-[#C5C5C5] text-[#0A1614] px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#F1F1F1] transition-colors"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
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
          <span className="hidden sm:inline">Add Announcement</span>
        </button>
      }
    >
      <div className="bg-[#0A1614] rounded-xl border border-[#C5C5C5]/15 overflow-hidden">
        <div className="p-6 border-b border-[#C5C5C5]/15">
          <h3 className="font-bold text-[#F1F1F1] text-lg">
            All Announcements
          </h3>
          <p className="text-[#C5C5C5]/60 text-sm mt-1">
            {announcements.length} total posts
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#C5C5C5]/60">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="w-12 h-12 text-[#C5C5C5]/80 mx-auto mb-4"
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
            <p className="text-[#C5C5C5]/60 font-bold">No announcements yet</p>
            <button
              onClick={() => navigate("/admin/announcements/add")}
              className="mt-4 bg-[#C5C5C5] text-[#0A1614] px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#F1F1F1] transition-colors"
            >
              Create First Announcement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#C5C5C5]/5 text-[#C5C5C5]/60 text-[10px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Title & Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5C5C5]/10">
                {announcements.map((ann) => (
                  <tr
                    key={ann.id}
                    className="hover:bg-[#C5C5C5]/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-[#F1F1F1] line-clamp-1">
                        {ann.title}
                      </p>
                      <p className="text-[10px] text-[#C5C5C5]/60 mt-0.5">
                        {new Date(ann.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${categoryColor(ann.category)}`}
                      >
                        {ann.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ann.image_url ? (
                        <div className="w-12 h-8 rounded overflow-hidden bg-[#C5C5C5]/10">
                          <img
                            src={ann.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-[#C5C5C5]/60">
                          No image
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/announcements/edit/${ann.id}`)
                          }
                          className="p-2 hover:bg-[#C5C5C5]/15 rounded-lg text-[#C5C5C5]/70 hover:text-[#F1F1F1] transition-colors"
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
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(ann)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-[#C5C5C5]/70 hover:text-red-400 transition-colors"
                          title="Delete"
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
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            announcement={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
