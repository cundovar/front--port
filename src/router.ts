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
import { api } from "./utils/api";

const routes = [
  { path: "/", component: PublicHome },
  { path: "/realisations", component: RealisationsPage },
  { path: "/devis", component: QuoteSimulator },
  { path: "/realisations/:slug", component: ProjectDetail },
  { path: "/admin/login", component: AdminLogin },
  { path: "/admin", component: AdminDashboard },
  { path: "/admin/projects", component: AdminProjects },
  { path: "/admin/comments", component: AdminComments },
  { path: "/admin/content", component: AdminContent },
  { path: "/admin/quote-estimates", component: AdminQuoteEstimates },
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
