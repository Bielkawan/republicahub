import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Payment, Tenant } from "../lib/types";
import { Badge } from "../components/Badge";
import { formatCurrency, formatDate } from "../lib/format";

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [status, setStatus] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  async function load(filter = status) {
    try {
      const [p, t] = await Promise.all([
        api.get<Payment[]>(`/payments${filter ? `?status=${filter}` : ""}`),
        api.get<Tenant[]>("/tenants"),
      ]);
      setPayments(p);
      setTenants(t.filter((x) => !x.moveOutDate));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/payments", {
        tenantId,
        amount: Number(amount),
        dueDate,
      });
      setTenantId("");
      setAmount("");
      setDueDate("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    }
  }

  async function markPaid(p: Payment) {
    try {
      await api.post(`/payments/${p.id}/pay`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  }

  function onFilter(value: string) {
    setStatus(value);
    load(value);
  }

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pagamentos</h2>
        <select
          value={status}
          onChange={(e) => onFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendentes</option>
          <option value="PAID">Pagos</option>
          <option value="OVERDUE">Atrasados</option>
        </select>
      </div>

      <form
        onSubmit={onSubmit}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-5 shadow-sm"
      >
        <div className="min-w-40 flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Morador
          </label>
          <select
            required
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className={input}
          >
            <option value="">Selecione...</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Valor (R$)
          </label>
          <input
            type="number"
            min={1}
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={input}
          />
        </div>
        <div className="w-44">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Vencimento
          </label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={input}
          />
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Cobrar
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="px-5 py-3 font-medium">Morador</th>
              <th className="px-5 py-3 font-medium">Vencimento</th>
              <th className="px-5 py-3 font-medium">Pago em</th>
              <th className="px-5 py-3 font-medium">Valor</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-medium">
                  {p.tenant?.user?.name ?? "—"}
                </td>
                <td className="px-5 py-3">{formatDate(p.dueDate)}</td>
                <td className="px-5 py-3">{formatDate(p.paidDate)}</td>
                <td className="px-5 py-3">{formatCurrency(p.amount)}</td>
                <td className="px-5 py-3">
                  <Badge value={p.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  {p.status !== "PAID" && (
                    <button
                      onClick={() => markPaid(p)}
                      className="text-sm font-medium text-emerald-600 hover:underline"
                    >
                      Marcar pago
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <p className="p-5 text-sm text-slate-500">
            Nenhum pagamento encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
