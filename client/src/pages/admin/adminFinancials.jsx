import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/adminLayout";
import { supabase } from "../../lib/supabase";

const AdminFinancials = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalOnline: 0,
    totalPaid: 0,
    totalPending: 0,
    totalCollection: 0,
  });

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    const { data: delegates } = await supabase
      .from("delegates")
      .select("id, church_id, role, payment_method, payment_status, include_merch");

    const { data: churches } = await supabase
      .from("churches")
      .select("id, name, circuit, registration_fee, merch_fee, staff_discount_fee, church_fee, church_fee_status");

    if (!churches) return;

    // Group by church
    const churchMap = {};
    churches.forEach((c) => {
      const isPaid = c.church_fee_status === "Paid";
      const fee = c.church_fee || 0;
      churchMap[c.id] = {
        church_id: c.id,
        name: c.name,
        circuit: c.circuit,
        church_fee: fee,
        church_fee_status: c.church_fee_status,
        total: 0,
        paid: 0,
        pending: 0,
        onlineAmount: isPaid ? fee : 0, // Church fee is usually online
        totalAmount: fee,
        paidAmount: isPaid ? fee : 0,
        // For individual calculations
        registration_fee: c.registration_fee || 160,
        merch_fee: c.merch_fee || 200,
        staff_discount_fee: c.staff_discount_fee
      };
    });

    (delegates || []).forEach((d) => {
      const cm = churchMap[d.church_id];
      if (!cm) return;

      let regFee = cm.registration_fee;
      if (d.role === "Pastor" || d.role === "Guardian") {
        regFee = 0;
      } else if ((d.role === "Camp Staff" || d.role === "Facilitator") && cm.staff_discount_fee != null) {
        regFee = cm.staff_discount_fee;
      }

      const amount = regFee + (d.include_merch ? cm.merch_fee : 0);
      cm.total++;

      if (d.payment_status === "Paid") {
        cm.paid++;
        cm.paidAmount += amount;
        cm.onlineAmount += amount;
      } else {
        cm.pending++;
      }

      cm.totalAmount += amount;
    });

    const rows = Object.values(churchMap).sort(
      (a, b) => b.paidAmount - a.paidAmount,
    );
    setData(rows);

    const totals = rows.reduce(
      (acc, r) => ({
        totalOnline: acc.totalOnline + r.onlineAmount,
        totalPaid: acc.totalPaid + r.paidAmount,
        totalPending: acc.totalPending + (r.totalAmount - r.paidAmount),
        totalCollection: acc.totalCollection + r.paidAmount,
      }),
      { totalOnline: 0, totalPaid: 0, totalPending: 0, totalCollection: 0 },
    );

    setSummary(totals);
    setLoading(false);
  };

  return (
    <AdminLayout title="Financial Reports">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Collected",
            value: `₱${summary.totalCollection.toLocaleString()}`,
            color: "text-green-400",
          },
          {
            label: "Pending Amount",
            value: `₱${summary.totalPending.toLocaleString()}`,
            color: "text-yellow-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-xl p-5"
          >
            <p className="text-[#C5C5C5]/60 text-xs font-bold uppercase tracking-wider mb-2">
              {s.label}
            </p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Per church breakdown */}
      <div className="bg-[#0A1614] border border-[#C5C5C5]/15 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#C5C5C5]/15">
          <h3 className="font-bold text-[#F1F1F1] text-lg">
            Per Church Financial Breakdown
          </h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-[#C5C5C5]/60">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#C5C5C5]/5 text-[#C5C5C5]/60 text-[10px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3">Church</th>
                  <th className="px-6 py-3">Circuit</th>
                  <th className="px-6 py-3">Church Fee (₱)</th>
                  <th className="px-6 py-3">Total Delegates</th>
                  <th className="px-6 py-3">Paid</th>
                  <th className="px-6 py-3">Pending</th>
                  <th className="px-6 py-3">Total Collected (₱)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5C5C5]/10">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-[#C5C5C5]/60"
                    >
                      No financial data yet
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr
                      key={row.church_id}
                      className="hover:bg-[#C5C5C5]/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-[#F1F1F1]">
                          {row.name}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#C5C5C5]/70 font-bold">
                        {row.circuit}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold">
                        {row.church_fee > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-[#F1F1F1]">₱{row.church_fee.toLocaleString()}</span>
                            <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded w-fit ${
                              row.church_fee_status === "Paid" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                            }`}>
                              {row.church_fee_status}
                            </span>
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#F1F1F1] font-bold">
                        {row.total}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-400 font-bold text-sm">
                          {row.paid}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-yellow-400 font-bold text-sm">
                          {row.pending}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#F1F1F1] font-black text-sm">
                          ₱{row.paidAmount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-[#C5C5C5]/10 border-t border-[#C5C5C5]/20">
                <tr>
                  <td
                    className="px-6 py-4 font-black text-[#F1F1F1]"
                    colSpan={2}
                  >
                    TOTAL
                  </td>
                  <td className="px-6 py-4 text-[#C5C5C5]/40 font-bold">
                    {/* Church Fee Col */}
                  </td>
                  <td className="px-6 py-4 text-[#F1F1F1] font-black">
                    {data.reduce((s, r) => s + r.total, 0)}
                  </td>
                  <td className="px-6 py-4 text-green-400 font-black">
                    {data.reduce((s, r) => s + r.paid, 0)}
                  </td>
                  <td className="px-6 py-4 text-yellow-400 font-black">
                    {data.reduce((s, r) => s + r.pending, 0)}
                  </td>
                  <td className="px-6 py-4 text-[#F1F1F1] font-black text-lg">
                    ₱{summary.totalCollection.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFinancials;
