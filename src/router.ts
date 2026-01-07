import { createRouter, createWebHistory } from "vue-router";
import PublicHome from "./views/PublicHome.vue";
import AdminDashboard from "./views/AdminDashboard.vue";
import AdminProjects from "./views/AdminProjects.vue";
import AdminComments from "./views/AdminComments.vue";
import AdminLogin from "./views/AdminLogin.vue";
import AdminContent from "./views/AdminContent.vue";

const routes = [
  { path: "/", component: PublicHome },
  { path: "/admin/login", component: AdminLogin },
  { path: "/admin", component: AdminDashboard },
  { path: "/admin/projects", component: AdminProjects },
  { path: "/admin/comments", component: AdminComments },
  { path: "/admin/content", component: AdminContent },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (to.path.startsWith("/admin") && to.path !== "/admin/login") {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      return "/admin/login";
    }
  }
  return true;
});
