import { createRouter, createWebHistory } from "vue-router";
import PublicHome from "./views/PublicHome.vue";
import ProjectDetail from "./views/ProjectDetail.vue";
import RealisationsPage from "./views/RealisationsPage.vue";
import AdminDashboard from "./views/AdminDashboard.vue";
import AdminProjects from "./views/AdminProjects.vue";
import AdminComments from "./views/AdminComments.vue";
import AdminLogin from "./views/AdminLogin.vue";
import AdminContent from "./views/AdminContent.vue";
import QuoteSimulator from "./views/QuoteSimulator.vue";
import AdminQuoteEstimates from "./views/AdminQuoteEstimates.vue";
import AdminQuotePricing from "./views/AdminQuotePricing.vue";
import { api } from "./utils/api";
import { pageTitle } from "./utils/pageTitle";

// `title` is undefined on "/" so the home page keeps the full wording written
// in index.html. ProjectDetail sets its own once the project is loaded.
const routes = [
  { path: "/", component: PublicHome },
  { path: "/realisations", component: RealisationsPage, meta: { title: "Réalisations" } },
  { path: "/devis", component: QuoteSimulator, meta: { title: "Estimer votre projet web" } },
  { path: "/realisations/:slug", component: ProjectDetail, meta: { title: "Réalisation" } },
  { path: "/admin/login", component: AdminLogin, meta: { title: "Connexion" } },
  { path: "/admin", component: AdminDashboard, meta: { title: "Administration" } },
  { path: "/admin/projects", component: AdminProjects, meta: { title: "Projets" } },
  { path: "/admin/comments", component: AdminComments, meta: { title: "Commentaires" } },
  { path: "/admin/content", component: AdminContent, meta: { title: "Contenu" } },
  { path: "/admin/quote-estimates", component: AdminQuoteEstimates, meta: { title: "Demandes de devis" } },
  { path: "/admin/quote-pricing", component: AdminQuotePricing, meta: { title: "Tarifs" } },
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
});
