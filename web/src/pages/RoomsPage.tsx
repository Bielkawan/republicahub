import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Property, Room } from "../lib/types";
import { Badge } from "../components/Badge";
import { formatCurrency } from "../lib/format";

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [price, setPrice] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [r, p] = await Promise.all([
        api.get<Room[]>("/rooms"),
        api.get<Property[]>("/properties"),
      ]);
      setRooms(r);
      setProperties(p);
      setPropertyId((cur) => cur || p[0]?.id || "");
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
      await api.post("/rooms", {
        number,
        capacity,
        price: Number(price),
        propertyId,
      });
      setNumber("");
      setPrice("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    }
  }

  async function remove(id: string) {
    try {
      await api.delete(`/rooms/${id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover");
    }
  }

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Quartos</h2>

      <form
        onSubmit={onSubmit}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-5 shadow-sm"
      >
        <div className="min-w-36 flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Quarto
          </label>
          <input
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Quarto 5"
            className={input}
          />
        </div>
        <div className="w-28">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Vagas
          </label>
          <input
            type="number"
            min={1}
            required
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className={input}
          />
        </div>
        <div className="w-32">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Mensalidade
          </label>
          <input
            type="number"
            min={1}
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="700"
            className={input}
          />
        </div>
        <div className="min-w-40 flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Propriedade
          </label>
          <select
            required
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className={input}
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
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
              <th className="px-5 py-3 font-medium">Quarto</th>
              <th className="px-5 py-3 font-medium">Propriedade</th>
              <th className="px-5 py-3 font-medium">Vagas</th>
              <th className="px-5 py-3 font-medium">Mensalidade</th>
              <th className="px-5 py-3 font-medium">Moradores</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-medium">{r.number}</td>
                <td className="px-5 py-3">{r.property?.name ?? "—"}</td>
                <td className="px-5 py-3">{r.capacity}</td>
                <td className="px-5 py-3">{formatCurrency(r.price)}</td>
                <td className="px-5 py-3">
                  {r.tenants?.map((t) => t.user.name).join(", ") || "—"}
                </td>
                <td className="px-5 py-3">
                  <Badge value={r.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => remove(r.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length === 0 && (
          <p className="p-5 text-sm text-slate-500">
            Nenhum quarto cadastrado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
