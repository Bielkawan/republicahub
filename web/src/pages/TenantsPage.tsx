import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Room, Tenant } from "../lib/types";
import { formatDate } from "../lib/format";

export function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [t, r] = await Promise.all([
        api.get<Tenant[]>("/tenants"),
        api.get<Room[]>("/rooms"),
      ]);
      setTenants(t);
      setRooms(r);
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
      await api.post("/tenants", {
        name,
        email,
        ...(roomId ? { roomId } : {}),
      });
      setName("");
      setEmail("");
      setRoomId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    }
  }

  async function checkout(t: Tenant) {
    try {
      await api.patch(`/tenants/${t.id}`, {
        moveOutDate: new Date().toISOString(),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao dar saída");
    }
  }

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Moradores</h2>

      <form
        onSubmit={onSubmit}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-5 shadow-sm"
      >
        <div className="min-w-40 flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Nome
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
          />
        </div>
        <div className="min-w-40 flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
        </div>
        <div className="min-w-40 flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Quarto (opcional)
          </label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className={input}
          >
            <option value="">Sem quarto</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.number} — {r.property?.name}
              </option>
            ))}
          </select>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Adicionar
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
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">E-mail</th>
              <th className="px-5 py-3 font-medium">Quarto</th>
              <th className="px-5 py-3 font-medium">Entrada</th>
              <th className="px-5 py-3 font-medium">Saída</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-medium">{t.user.name}</td>
                <td className="px-5 py-3">{t.user.email}</td>
                <td className="px-5 py-3">
                  {t.room
                    ? `${t.room.number} — ${t.room.property?.name ?? ""}`
                    : "—"}
                </td>
                <td className="px-5 py-3">{formatDate(t.moveInDate)}</td>
                <td className="px-5 py-3">{formatDate(t.moveOutDate)}</td>
                <td className="px-5 py-3 text-right">
                  {!t.moveOutDate && (
                    <button
                      onClick={() => checkout(t)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Dar saída
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tenants.length === 0 && (
          <p className="p-5 text-sm text-slate-500">
            Nenhum morador cadastrado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
