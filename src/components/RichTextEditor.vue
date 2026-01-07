<template>
  <div class="rich-editor">
    <div v-if="editor" class="toolbar">
      <button
        type="button"
        :class="{ active: editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
        title="Gras"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
        title="Italique"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        title="Titre"
      >
        H2
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        title="Sous-titre"
      >
        H3
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
        title="Liste"
      >
        &bull;
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('link') }"
        @click="setLink"
        title="Lien"
      >
        🔗
      </button>
      <button
        v-if="editor.isActive('link')"
        type="button"
        @click="editor.chain().focus().unsetLink().run()"
        title="Supprimer le lien"
      >
        ✕
      </button>
    </div>
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { watch, onBeforeUnmount } from "vue";

interface Props {
  modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
  ],
  onUpdate: () => {
    emit("update:modelValue", editor.value?.getHTML() ?? "");
  },
});

const setLink = (): void => {
  if (!editor.value) return;

  const previousUrl = editor.value.getAttributes("link").href ?? "";
  const url = window.prompt("URL du lien:", previousUrl);

  if (url === null) return;

  if (url === "") {
    editor.value.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.value.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
};

watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value?.getHTML() === value;
    if (!isSame && editor.value) {
      editor.value.commands.setContent(value, false);
    }
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.rich-editor {
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg);
}

.toolbar {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  flex-wrap: wrap;
}

.toolbar button {
  padding: 6px 10px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 4px;
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  min-width: 32px;
}

.toolbar button:hover {
  background: var(--line);
}

.toolbar button.active {
  background: var(--yellow);
  color: var(--bg-alt);
  border-color: var(--yellow);
}

.editor-content {
  padding: 12px;
  min-height: 120px;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 100px;
  color: var(--text);
}

.editor-content :deep(.ProseMirror p) {
  margin: 0 0 8px 0;
}

.editor-content :deep(.ProseMirror h2) {
  font-size: 1.25rem;
  margin: 0 0 12px 0;
}

.editor-content :deep(.ProseMirror h3) {
  font-size: 1.1rem;
  margin: 0 0 10px 0;
}

.editor-content :deep(.ProseMirror ul) {
  padding-left: 20px;
  margin: 0 0 8px 0;
}

.editor-content :deep(.ProseMirror a) {
  color: var(--yellow);
  text-decoration: underline;
  cursor: pointer;
}
</style>
