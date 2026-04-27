import StatusBadge from "../admin/StatusBadge";
import { formatCurrency } from "../../utils/currency";

const DashboardOrdersTable = ({ rows }) => (
  <div className="dashboard-panel p-6">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">Recent transactions</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Latest orders</h2>
      </div>
      <p className="text-sm text-slate-500">{rows.length} visible rows</p>
    </div>

    {rows.length ? (
      <>
        <div className="mt-6 hidden overflow-x-auto lg:block">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-4 font-medium">Customer</th>
                <th className="pb-4 font-medium">Order</th>
                <th className="pb-4 font-medium">Items</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-4">
                    <p className="font-medium text-slate-900">{row.customer}</p>
                    <p className="mt-1 text-slate-500">{row.email}</p>
                  </td>
                  <td className="py-4 font-medium text-slate-700">{row.orderCode}</td>
                  <td className="py-4 text-slate-500">{row.items}</td>
                  <td className="py-4 text-slate-500">{row.date}</td>
                  <td className="py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-4 text-right font-semibold text-slate-900">{formatCurrency(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 lg:hidden">
          {rows.map((row) => (
            <div key={row.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{row.customer}</p>
                  <p className="mt-1 text-sm text-slate-500">{row.email}</p>
                </div>
                <StatusBadge status={row.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Order</p>
                  <p className="mt-1 font-medium text-slate-700">{row.orderCode}</p>
                </div>
                <div>
                  <p className="text-slate-400">Date</p>
                  <p className="mt-1 font-medium text-slate-700">{row.date}</p>
                </div>
                <div>
                  <p className="text-slate-400">Items</p>
                  <p className="mt-1 font-medium text-slate-700">{row.items}</p>
                </div>
                <div>
                  <p className="text-slate-400">Total</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatCurrency(row.total)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        No orders yet. New transactions will appear here automatically.
      </div>
    )}
  </div>
);

export default DashboardOrdersTable;
