import { defineFakeRoute } from "vite-plugin-fake-server/client";

// mock 会话令牌：非真实凭据（真实认证由后端 JWT 完成），动态生成避免源码出现凭据字面量
const mockSessionToken = (role: string) =>
  `mock-session-${role}-${Date.now().toString(36)}`;

// 模拟刷新token接口
export default defineFakeRoute([
  {
    url: "/refresh-token",
    method: "post",
    response: ({ body }) => {
      if (body.refreshToken) {
        return {
          code: 0,
          message: "操作成功",
          data: {
            accessToken: mockSessionToken("new"),
            refreshToken: mockSessionToken("new"),
            // `expires`选择这种日期格式是为了方便调试，后端直接设置时间戳或许更方便（每次都应该递增）。如果后端返回的是时间戳格式，前端开发请来到这个目录`src/utils/auth.ts`，把第`38`行的代码换成expires = data.expires即可。
            expires: "2030/10/30 23:59:59"
          }
        };
      } else {
        return {
          code: 10001,
          message: "请求参数缺失或格式不正确",
          data: {}
        };
      }
    }
  }
]);
