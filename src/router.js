import Vue from "vue";
import Router from "vue-router";
import Dashboard from "@/views/Dashboard";
import Courses from "@/views/Courses";
import Login from "@/views/Login";
import Settings from "@/views/Settings";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Dashboard",
      component: Dashboard,
      children: [
        {
          path: "courses",
          component: Courses
        },
        {
          path: "settings",
          component: Settings
        }
      ]
    },
    {
      path: "/login",
      name: "Login",
      component: Login
    },
    {
      path: "/settings",
      name: "Settings",
      component: Settings
    }
  ]
});
