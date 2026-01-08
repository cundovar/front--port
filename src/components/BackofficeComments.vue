<template>
  <section class="section">
    <h2 class="section-title">Backoffice Commentaires</h2>
    <p class="section-subtitle">Moderation des retours apprenants.</p>

    <div class="card">
      <p v-if="error" class="error">{{ error }}</p>
      <div class="comment-list">
        <article v-for="comment in comments" :key="comment.id" class="comment-item">
          <div>
            <strong>{{ comment.authorName }}</strong>
            <span class="muted">{{ comment.authorRole }} · {{ comment.createdAt }}</span>
            <p>{{ comment.content }}</p>
          </div>
          <div class="actions">
            <button class="btn btn-secondary" type="button" @click="setStatus(comment.id, 'approved')">
              Approuver
            </button>
            <button class="btn btn-secondary" type="button" @click="setStatus(comment.id, 'rejected')">
              Rejeter
            </button>
            <span class="status">{{ statusLabel(comment.status) }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { CommentStatus, StudentComment } from "../types";
import { api } from "../utils/api";

interface Props {
  initialComments: StudentComment[];
}

const props = defineProps<Props>();
const comments = ref<StudentComment[]>(props.initialComments.map((item) => ({ ...item })));
const error = ref("");

const adminHeaders = (): HeadersInit => {
  const token = localStorage.getItem("admin_token") ?? "";
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const load = async (): Promise<void> => {
  try {
    const response = await api.fetch("/api/admin/comments", { headers: adminHeaders() });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as StudentComment[];
    if (Array.isArray(data) && data.length > 0) {
      comments.value = data;
    }
  } catch {
    // Keep local fallback.
  }
};

const setStatus = async (id: string, status: CommentStatus): Promise<void> => {
  const target = comments.value.find((item) => item.id === id);
  if (target) {
    target.status = status;
  }

  const response = await fetch(`/api/admin/comments/${id}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    error.value = "Echec de mise a jour (API).";
  }
};

const statusLabel = (status: CommentStatus): string => {
  if (status === "approved") {
    return "Approuve";
  }
  if (status === "rejected") {
    return "Rejete";
  }
  return "En attente";
};

onMounted(() => {
  void load();
});
</script>

<style scoped>
.comment-list {
  display: grid;
  gap: 16px;
}

.comment-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 12px;
}

.comment-item p {
  margin: 8px 0 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.status {
  font-size: 12px;
  color: var(--muted);
}

.error {
  color: #f87171;
  margin-bottom: 12px;
}

.muted {
  margin-left: 8px;
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 720px) {
  .comment-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
}
</style>
