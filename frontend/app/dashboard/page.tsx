"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAccessToken,
  getProperties,
  createProperty,
  clearSession,
  type Property,
} from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [areaHa, setAreaHa] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);
      const data = await getProperties();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar propriedades");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createProperty({ name, city, state, areaHa: Number(areaHa) });
      setName("");
      setCity("");
      setState("");
      setAreaHa("");
      setShowForm(false);
      await loadProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar propriedade");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-green-700">Minhas propriedades</h1>
        <button onClick={handleLogout} className="text-sm text-gray-600 hover:underline">
          Sair
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-gray-600">Carregando...</p>
      ) : properties.length === 0 ? (
        <p className="mb-6 text-gray-600">Você ainda não cadastrou nenhuma propriedade.</p>
      ) : (
        <ul className="mb-6 space-y-3">
          {properties.map((property) => (
            <li key={property.id} className="rounded-lg bg-white p-4 shadow">
              <p className="font-medium">{property.name}</p>
              <p className="text-sm text-gray-600">
                {property.city}/{property.state} — {property.areaHa} ha
              </p>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleCreate} className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Nova propriedade</h2>

          <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Cidade</label>
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Estado (UF)</label>
          <input
            required
            maxLength={2}
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Área (hectares)</label>
          <input
            required
            type="number"
            step="0.01"
            value={areaHa}
            onChange={(e) => setAreaHa(e.target.value)}
            className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded px-4 py-2 font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
        >
          + Nova propriedade
        </button>
      )}
    </main>
  );
}
