import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Property } from "../lib/types";

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setProperties(await api.get<Property[]>("/properties"));
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
      await api.post("/properties", { name, address });
      setName("");
      setAddress("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Propriedades</h2>

      <form
        onSubmit={onSubmit}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-5 shadow-sm"
      >
        <div className="min-w-48 flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Nome
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="República USP 1"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="min-w-48 flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Endereço
          </label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Rua, número - Bairro"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <div key={p.id} className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{p.address}</p>
            <p className="mt-3 text-sm font-medium text-indigo-600">
              {p._count?.rooms ?? p.rooms?.length ?? 0} quarto(s)
            </p>
          </div>
        ))}
        {properties.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhuma propriedade cadastrada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
