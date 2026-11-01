import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Dashboard } from "../lib/types";
import { Badge } from "../components/Badge";
import { formatCurrency, formatDate } from "../lib/format";

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Dashboard>("/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error)
    return <p className="rounded-lg bg-red-50 p-4 text-red-600">{error}</p>;
  if (!data) return <p className="text-slate-500">Carregando...</p>;

  const cards = [
    { label: "Propriedades", value: data.properties },
    { label: "Quartos ocupados", value: data.rooms.OCCUPIED },
    { label: "Quartos disponíveis", value: data.rooms.AVAILABLE },
    { label: "Moradores ativos", value: data.activeTenants },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-l-4 border-emerald-500 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Recebido</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatCurrency(data.payments.paid)}
          </p>
        </div>
        <div className="rounded-xl border-l-4 border-amber-500 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">A receber</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {formatCurrency(data.payments.pending)}
          </p>
        </div>
        <div className="rounded-xl border-l-4 border-red-500 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Em atraso</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {formatCurrency(data.payments.overdue)}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Pagamentos recentes</h3>
          <Link
            to="/pagamentos"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="pb-2 font-medium">Morador</th>
              <th className="pb-2 font-medium">Vencimento</th>
              <th className="pb-2 font-medium">Valor</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.recentPayments.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2.5">{p.tenant?.user?.name ?? "—"}</td>
                <td className="py-2.5">{formatDate(p.dueDate)}</td>
                <td className="py-2.5">{formatCurrency(p.amount)}</td>
                <td className="py-2.5">
                  <Badge value={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
