import { createRouter, createWebHistory } from "vue-router";
import PublicHome from "./views/PublicHome.vue";
import ProjectDetail from "./views/ProjectDetail.vue";
import RealisationsPage from "./views/RealisationsPage.vue";
import HowItWorksPage from "./views/HowItWorksPage.vue";
import AdminDashboard from "./views/AdminDashboard.vue";
import AdminProjects from "./views/AdminProjects.vue";
import AdminComments from "./views/AdminComments.vue";
import AdminLogin from "./views/AdminLogin.vue";
import AdminContent from "./views/AdminContent.vue";
import QuoteSimulator from "./views/QuoteSimulator.vue";
import NotFound from "./views/NotFound.vue";
import AdminQuoteEstimates from "./views/AdminQuoteEstimates.vue";
import AdminQuotePricing from "./views/AdminQuotePricing.vue";
import { api } from "./utils/api";
import { pageTitle, setRobotsNoindex } from "./utils/pageTitle";
import pageSeo from "./data/pageSeo.json";

// Titles for the prerendered routes come from pageSeo.json, the same file the
// build reads to write the <title> a crawler sees. Throwing here surfaces a
// missing entry at startup rather than serving two different titles.
const seoTitle = (path: string): string => {
  const page = pageSeo.pages.find((candidate) => candidate.path === path);
  if (!page) throw new Error(`pageSeo.json has no entry for ${path}`);
  return page.title;
};

// `title` is undefined on "/" so the home page keeps the full wording written
// in index.html. ProjectDetail sets its own once the project is loaded.
const routes = [
  { path: "/", component: PublicHome },
  { path: "/comment-ca-marche", component: HowItWorksPage, meta: { title: seoTitle("/comment-ca-marche") } },
  { path: "/realisations", component: RealisationsPage, meta: { title: seoTitle("/realisations") } },
  { path: "/devis", component: QuoteSimulator, meta: { title: seoTitle("/devis") } },
  { path: "/realisations/:slug", component: ProjectDetail, meta: { title: "Réalisation" } },
  { path: "/admin/login", component: AdminLogin, meta: { title: "Connexion" } },
  { path: "/admin", component: AdminDashboard, meta: { title: "Administration" } },
  { path: "/admin/projects", component: AdminProjects, meta: { title: "Projets" } },
  { path: "/admin/comments", component: AdminComments, meta: { title: "Commentaires" } },
  { path: "/admin/content", component: AdminContent, meta: { title: "Contenu" } },
  { path: "/admin/quote-estimates", component: AdminQuoteEstimates, meta: { title: "Demandes de devis" } },
  { path: "/admin/quote-pricing", component: AdminQuotePricing, meta: { title: "Tarifs" } },
  // Catch-all: the server answers 200 for any extension-less path, so without
  // this the home page was served under every mistyped URL — duplicate content
  // Google reports as a soft 404. `noindex` keeps those out of the index.
  { path: "/:pathMatch(.*)*", component: NotFound, meta: { title: "Page introuvable", noindex: true } },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (to.path.startsWith("/admin") && to.path !== "/admin/login") {
    try {
      const response = await api.fetch("/api/admin/me", {
        credentials: "include",
      });
      if (!response.ok) {
        return "/admin/login";
      }
    } catch {
      return "/admin/login";
    }
  }
  return true;
});

router.afterEach((to) => {
  document.title = pageTitle(to.meta.title as string | undefined);
  setRobotsNoindex(to.meta.noindex === true || to.path.startsWith("/admin"));
});
