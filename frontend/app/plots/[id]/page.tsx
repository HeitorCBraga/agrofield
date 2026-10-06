"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPlot, getCrops, createCrop, type Plot, type Crop } from "../../../lib/api";
import { useRequireAuth } from "../../../lib/useRequireAuth";
import { InfoTooltip } from "../../../components/InfoTooltip";

export default function PlotDetailPage() {
  useRequireAuth();
  const { id } = useParams<{ id: string }>();

  const [plot, setPlot] = useState<Plot | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [variety, setVariety] = useState("");
  const [plantedAt, setPlantedAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const [plotData, cropsData] = await Promise.all([getPlot(id), getCrops(id)]);
      setPlot(plotData);
      setCrops(cropsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar área");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createCrop(id, { name, variety: variety || undefined, plantedAt });
      setName("");
      setVariety("");
      setPlantedAt("");
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar plantio");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-gray-600">Carregando...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/properties/${plot?.propertyId}`} className="mb-4 inline-block text-sm text-gray-600 hover:underline">
        ← Voltar
      </Link>

      {plot && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-green-700">{plot.name}</h1>
          <p className="text-sm text-gray-600">
            {plot.areaHa} ha — solo {plot.soilType}
          </p>
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <h2 className="mb-3 flex items-center text-lg font-semibold">
        Plantios
        <InfoTooltip text="Um plantio representa um período em que você cultivou algo nessa área — desde quando plantou até a colheita." />
      </h2>

      {crops.length === 0 ? (
        <p className="mb-6 text-gray-600">Nenhum plantio cadastrado ainda.</p>
      ) : (
        <ul className="mb-6 space-y-3">
          {crops.map((crop) => (
            <li key={crop.id}>
              <Link href={`/crops/${crop.id}`} className="block rounded-lg bg-white p-4 shadow hover:bg-gray-50">
                <p className="font-medium">
                  {crop.name}
                  {crop.variety ? ` (${crop.variety})` : ""}
                </p>
                <p className="text-sm text-gray-600">
                  plantado em {new Date(crop.plantedAt).toLocaleDateString("pt-BR")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleCreate} className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Novo plantio</h3>

          <label className="mb-1 block text-sm font-medium text-gray-700">Cultura</label>
          <input
            required
            placeholder="ex: Soja"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Variedade (opcional)</label>
          <input
            placeholder="ex: RR"
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
            className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Data de plantio</label>
          <input
            required
            type="date"
            value={plantedAt}
            onChange={(e) => setPlantedAt(e.target.value)}
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
          + Novo plantio
        </button>
      )}
    </main>
  );
}
