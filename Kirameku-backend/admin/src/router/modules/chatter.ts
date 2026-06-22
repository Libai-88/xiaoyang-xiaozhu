import { chatter } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/chatter",
  name: "Chatter",
  component: Layout,
  redirect: "/chatter/index",
  meta: {
    icon: "ri:chat-smile-2-line",
    title: "碎碎念管理",
    rank: chatter
  },
  children: [
    {
      path: "/chatter/index",
      name: "ChatterIndex",
      component: () => import("@/views/chatter/index.vue"),
      meta: {
        title: "碎碎念管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
