// 根据角色动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";

// mock 会话令牌：非真实凭据（真实认证由后端 JWT 完成），动态生成避免源码出现凭据字面量
const mockSessionToken = (role: string) =>
  `mock-session-${role}-${Date.now().toString(36)}`;

export default defineFakeRoute([
  {
    url: "/login",
    method: "post",
    response: ({ body }) => {
      if (body.username === "admin") {
        return {
          code: 0,
          message: "操作成功",
          data: {
            avatar: "https://avatars.githubusercontent.com/u/44761321",
            username: "admin",
            nickname: "小铭",
            // 一个用户可能有多个角色
            roles: ["admin"],
            // 按钮级别权限
            permissions: ["*:*:*"],
            accessToken: mockSessionToken("admin"),
            refreshToken: mockSessionToken("admin"),
            expires: "2030/10/30 00:00:00"
          }
        };
      } else {
        return {
          code: 0,
          message: "操作成功",
          data: {
            avatar: "https://avatars.githubusercontent.com/u/52823142",
            username: "common",
            nickname: "小林",
            roles: ["common"],
            permissions: ["permission:btn:add", "permission:btn:edit"],
            accessToken: mockSessionToken("common"),
            refreshToken: mockSessionToken("common"),
            expires: "2030/10/30 00:00:00"
          }
        };
      }
    }
  }
]);
