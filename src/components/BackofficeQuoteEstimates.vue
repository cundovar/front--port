<template>
  <section class="section">
    <h1>Estimations</h1>

    <div class="filters">
      <label>
        Statut
        <select v-model="statusFilter" @change="load">
          <option value="">Tous</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <button class="btn btn-secondary" type="button" @click="load">Rafraîchir</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Chargement…</p>

    <div class="layout">
      <ul class="list">
        <li v-if="!loading && items.length === 0" class="muted">Aucune estimation.</li>
        <li v-for="item in items" :key="item.id">
          <button
            type="button"
            class="list-row"
            :class="{ active: selected?.id === item.id }"
            @click="select(item.id)"
          >
            <span class="list-status">{{ statusLabel(item.status) }}</span>
            <span class="list-name">{{ item.fullName }}</span>
            <span class="list-service">{{ serviceLabel(item.serviceKey) }}</span>
            <span class="list-amount">{{ item.minimumAmount }} – {{ item.maximumAmount }} €</span>
            <span class="list-date">{{ formatDate(item.createdAt) }}</span>
          </button>
        </li>
      </ul>

      <article v-if="selected" class="detail card">
        <h2>{{ selected.fullName }}</h2>
        <p class="muted">{{ selected.email }}<template v-if="selected.company"> · {{ selected.company }}</template><template v-if="selected.phone"> · {{ selected.phone }}</template></p>

        <h3>Fourchette</h3>
        <p class="amount">{{ selected.minimumAmount }} € – {{ selected.maximumAmount }} €</p>

        <h3>Réponses</h3>
        <dl class="answers">
          <div v-for="(value, key) in selected.answers" :key="key">
            <dt>{{ key }}</dt>
            <dd>{{ formatAnswer(value) }}</dd>
          </div>
        </dl>

        <h3>Détail du calcul</h3>
        <ul class="factors">
          <li v-for="factor in selected.calculationDetail" :key="factor.label">
            {{ factor.label }} : {{ factor.impactMin }} – {{ factor.impactMax }} €
          </li>
        </ul>

        <h3>Synthèse ({{ selected.aiSource }})</h3>
        <p>{{ selected.summary || "—" }}</p>

        <template v-if="selected.missingQuestions.length">
          <h3>Questions manquantes</h3>
          <ul><li v-for="q in selected.missingQuestions" :key="q">{{ q }}</li></ul>
        </template>

        <template v-if="selected.riskFlags.length">
          <h3>Points de vigilance</h3>
          <ul><li v-for="r in selected.riskFlags" :key="r">{{ r }}</li></ul>
        </template>

        <h3>Suivi</h3>
        <label>
          Statut
          <select v-model="editStatus">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <label>
          Notes
          <textarea v-model="editNotes" rows="4" />
        </label>
        <p class="muted">Reçue le {{ formatDate(selected.createdAt) }}<template v-if="selected.qualifiedAt"> · qualifiée le {{ formatDate(selected.qualifiedAt) }}</template></p>

        <button class="btn btn-primary" type="button" :disabled="saving" @click="save">
          {{ saving ? "Enregistrement…" : "Enregistrer" }}
        </button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { QuoteEstimateAdminRecord } from "../types";
import { quoteServiceLabel, quoteStatusLabel } from "../composables/useQuoteSimulator";
import { api } from "../utils/api";

type ListItem = Pick<
  QuoteEstimateAdminRecord,
  "id" | "serviceKey" | "fullName" | "email" | "minimumAmount" | "maximumAmount" | "status" | "createdAt" | "qualifiedAt"
>;

const statusOptions = [
  { value: "new", label: "Nouvelle" },
  { value: "reviewed", label: "Vue" },
  { value: "qualified", label: "Qualifiée" },
  { value: "archived", label: "Archivée" },
];

const items = ref<ListItem[]>([]);
const selected = ref<QuoteEstimateAdminRecord | null>(null);
const statusFilter = ref("");
const editStatus = ref("new");
const editNotes = ref("");
const loading = ref(false);
const saving = ref(false);
const error = ref("");

const adminHeaders = () => ({ "Content-Type": "application/json" });

const statusLabel = quoteStatusLabel;
const serviceLabel = quoteServiceLabel;

const formatDate = (value: string): string =>
  value ? new Date(value).toLocaleDateString("fr-FR", { dateStyle: "medium" }) : "—";

const formatAnswer = (value: unknown): string => {
  if (typeof value === "boolean") return value ? "oui" : "non";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const load = async (): Promise<void> => {
  loading.value = true;
  error.value = "";
  try {
    const query = statusFilter.value ? `?status=${statusFilter.value}` : "";
    const response = await api.fetch(`/api/admin/quote-estimates${query}`, { credentials: "include" });
    if (!response.ok) throw new Error();
    const data = await response.json();
    items.value = data.items ?? [];
  } catch {
    error.value = "Impossible de charger les estimations.";
  } finally {
    loading.value = false;
  }
};

const select = async (id: number): Promise<void> => {
  error.value = "";
  try {
    const response = await api.fetch(`/api/admin/quote-estimates/${id}`, { credentials: "include" });
    if (!response.ok) throw new Error();
    selected.value = await response.json();
    editStatus.value = selected.value?.status ?? "new";
    editNotes.value = selected.value?.notes ?? "";
  } catch {
    error.value = "Impossible de charger cette estimation.";
  }
};

const save = async (): Promise<void> => {
  if (!selected.value) return;
  saving.value = true;
  error.value = "";
  try {
    const response = await api.fetch(`/api/admin/quote-estimates/${selected.value.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: adminHeaders(),
      body: JSON.stringify({ status: editStatus.value, notes: editNotes.value }),
    });
    if (!response.ok) throw new Error();
    await load();
    await select(selected.value.id);
  } catch {
    error.value = "L’enregistrement a échoué.";
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  void load();
});
</script>

<style scoped>
.filters { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 20px; }
.filters label { display: grid; gap: 6px; font-size: 13px; }
.layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 24px; align-items: start; }
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.list-row { width: 100%; display: grid; gap: 4px; text-align: left; border: 2px solid var(--line); background: var(--bg); padding: 12px; cursor: pointer; color: var(--text); }
.list-row.active { border-color: var(--text); background: var(--bg-elev); }
.list-status { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; opacity: 0.7; }
.list-name { font-weight: 700; }
.list-service, .list-amount, .list-date { font-size: 13px; opacity: 0.85; }
.detail { display: grid; gap: 10px; }
.detail h3 { margin: 12px 0 0; font-size: 13px; text-transform: uppercase; font-family: var(--font-mono); }
.detail label { display: grid; gap: 6px; font-size: 13px; }
.detail textarea, .detail select { border: 2px solid var(--line); padding: 10px; background: var(--bg); color: var(--text); font: inherit; }
.amount { font-size: 22px; font-weight: 800; margin: 0; }
.answers { display: grid; gap: 6px; margin: 0; }
.answers div { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; }
.answers dt { font-weight: 700; }
.answers dd { margin: 0; text-align: right; }
.factors { margin: 0; padding-left: 20px; font-size: 14px; }
.error { color: var(--accent); }
.muted { color: var(--muted); }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
</style>
