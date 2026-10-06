"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProperty, getPlots, createPlot, type Property, type Plot } from "../../../lib/api";
import { useRequireAuth } from "../../../lib/useRequireAuth";

export default function PropertyDetailPage() {
  useRequireAuth();
  const { id } = useParams<{ id: string }>();

  const [property, setProperty] = useState<Property | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [areaHa, setAreaHa] = useState("");
  const [soilType, setSoilType] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const [propertyData, plotsData] = await Promise.all([getProperty(id), getPlots(id)]);
      setProperty(propertyData);
      setPlots(plotsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar propriedade");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createPlot(id, { name, areaHa: Number(areaHa), soilType });
      setName("");
      setAreaHa("");
      setSoilType("");
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar talhão");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-gray-600">Carregando...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
        ← Voltar
      </Link>

      {property && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-green-700">{property.name}</h1>
          <p className="text-sm text-gray-600">
            {property.city}/{property.state} — {property.areaHa} ha
          </p>
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <h2 className="mb-3 text-lg font-semibold">Talhões</h2>

      {plots.length === 0 ? (
        <p className="mb-6 text-gray-600">Nenhum talhão cadastrado ainda.</p>
      ) : (
        <ul className="mb-6 space-y-3">
          {plots.map((plot) => (
            <li key={plot.id}>
              <Link href={`/plots/${plot.id}`} className="block rounded-lg bg-white p-4 shadow hover:bg-gray-50">
                <p className="font-medium">{plot.name}</p>
                <p className="text-sm text-gray-600">
                  {plot.areaHa} ha — solo {plot.soilType}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleCreate} className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Novo talhão</h3>

          <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Área (hectares)</label>
          <input
            required
            type="number"
            step="0.01"
            value={areaHa}
            onChange={(e) => setAreaHa(e.target.value)}
            className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de solo</label>
          <input
            required
            placeholder="ex: argiloso, arenoso"
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
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
          + Novo talhão
        </button>
      )}
    </main>
  );
}
