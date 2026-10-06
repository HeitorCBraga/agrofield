"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getCrop,
  getInputApplications,
  createInputApplication,
  getHarvests,
  createHarvest,
  type Crop,
  type InputApplication,
  type Harvest,
} from "../../../lib/api";
import { useRequireAuth } from "../../../lib/useRequireAuth";

export default function CropDetailPage() {
  useRequireAuth();
  const { id } = useParams<{ id: string }>();

  const [crop, setCrop] = useState<Crop | null>(null);
  const [inputApplications, setInputApplications] = useState<InputApplication[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInputForm, setShowInputForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [appliedAt, setAppliedAt] = useState("");
  const [savingInput, setSavingInput] = useState(false);

  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [quantityKg, setQuantityKg] = useState("");
  const [harvestedAt, setHarvestedAt] = useState("");
  const [savingHarvest, setSavingHarvest] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const [cropData, inputsData, harvestsData] = await Promise.all([
        getCrop(id),
        getInputApplications(id),
        getHarvests(id),
      ]);
      setCrop(cropData);
      setInputApplications(inputsData);
      setHarvests(harvestsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cultura");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateInput(event: React.FormEvent) {
    event.preventDefault();
    setSavingInput(true);
    setError(null);

    try {
      await createInputApplication(id, { productName, quantity: Number(quantity), unit, appliedAt });
      setProductName("");
      setQuantity("");
      setUnit("");
      setAppliedAt("");
      setShowInputForm(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar aplicação de insumo");
    } finally {
      setSavingInput(false);
    }
  }

  async function handleCreateHarvest(event: React.FormEvent) {
    event.preventDefault();
    setSavingHarvest(true);
    setError(null);

    try {
      await createHarvest(id, { quantityKg: Number(quantityKg), harvestedAt });
      setQuantityKg("");
      setHarvestedAt("");
      setShowHarvestForm(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar colheita");
    } finally {
      setSavingHarvest(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-gray-600">Carregando...</main>;
  }

  const totalHarvested = harvests.reduce((sum, h) => sum + h.quantityKg, 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/plots/${crop?.plotId}`} className="mb-4 inline-block text-sm text-gray-600 hover:underline">
        ← Voltar
      </Link>

      {crop && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-green-700">
            {crop.name}
            {crop.variety ? ` (${crop.variety})` : ""}
          </h1>
          <p className="text-sm text-gray-600">
            plantado em {new Date(crop.plantedAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Insumos aplicados</h2>

        {inputApplications.length === 0 ? (
          <p className="mb-4 text-gray-600">Nenhuma aplicação registrada ainda.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {inputApplications.map((input) => (
              <li key={input.id} className="rounded-lg bg-white p-4 shadow">
                <p className="font-medium">
                  {input.productName} — {input.quantity}
                  {input.unit}
                </p>
                <p className="text-sm text-gray-600">
                  aplicado em {new Date(input.appliedAt).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}

        {showInputForm ? (
          <form onSubmit={handleCreateInput} className="rounded-lg bg-white p-6 shadow">
            <label className="mb-1 block text-sm font-medium text-gray-700">Produto</label>
            <input
              required
              placeholder="ex: NPK 10-10-10"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
            />

            <div className="mb-3 flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Quantidade</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-sm font-medium text-gray-700">Unidade</label>
                <input
                  required
                  placeholder="kg"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
                />
              </div>
            </div>

            <label className="mb-1 block text-sm font-medium text-gray-700">Data da aplicação</label>
            <input
              required
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingInput}
                className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-50"
              >
                {savingInput ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setShowInputForm(false)}
                className="rounded px-4 py-2 font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowInputForm(true)}
            className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
          >
            + Registrar aplicação de insumo
          </button>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Colheitas {harvests.length > 0 && <span className="text-sm font-normal text-gray-600">(total: {totalHarvested}kg)</span>}
        </h2>

        {harvests.length === 0 ? (
          <p className="mb-4 text-gray-600">Nenhuma colheita registrada ainda.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {harvests.map((harvest) => (
              <li key={harvest.id} className="rounded-lg bg-white p-4 shadow">
                <p className="font-medium">{harvest.quantityKg}kg</p>
                <p className="text-sm text-gray-600">
                  colhido em {new Date(harvest.harvestedAt).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}

        {showHarvestForm ? (
          <form onSubmit={handleCreateHarvest} className="rounded-lg bg-white p-6 shadow">
            <label className="mb-1 block text-sm font-medium text-gray-700">Quantidade (kg)</label>
            <input
              required
              type="number"
              step="0.01"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="mb-3 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
            />

            <label className="mb-1 block text-sm font-medium text-gray-700">Data da colheita</label>
            <input
              required
              type="date"
              value={harvestedAt}
              onChange={(e) => setHarvestedAt(e.target.value)}
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingHarvest}
                className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-50"
              >
                {savingHarvest ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setShowHarvestForm(false)}
                className="rounded px-4 py-2 font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowHarvestForm(true)}
            className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
          >
            + Registrar colheita
          </button>
        )}
      </section>
    </main>
  );
}
