import { bookmark } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/bookmark",
  name: "Bookmark",
  component: Layout,
  redirect: "/bookmark/index",
  meta: {
    icon: "ri:bookmark-3-line",
    title: "藏宝库管理",
    rank: bookmark
  },
  children: [
    {
      path: "/bookmark/index",
      name: "BookmarkIndex",
      component: () => import("@/views/bookmark/index.vue"),
      meta: { title: "藏宝库管理" }
    }
  ]
} satisfies RouteConfigsTable;
