import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createRoutesFromElements, matchRoutes, Navigate } from "react-router-dom";

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
try {
  const { default: App } = await server.ssrLoadModule("/src/App.jsx");
  const { default: Login } = await server.ssrLoadModule("/src/pages/admin/Login.jsx");
  const { default: ProtectedRoute } = await server.ssrLoadModule("/src/components/common/ProtectedRoute.jsx");
  const routes = createRoutesFromElements(App().props.children);

  test("admin login resolves to the public login form, outside the auth guard", () => {
    const matches = matchRoutes(routes, "/admin/login");
    assert.equal(matches.at(-1).route.element.type, Login);
    assert.ok(matches.every(({ route }) => route.element?.type !== ProtectedRoute));
  });
  test("admin root has a dashboard redirect while retaining the auth guard", () => {
    const matches = matchRoutes(routes, "/admin");
    assert.ok(matches.some(({ route }) => route.element?.type === ProtectedRoute));
    const index = matches.at(-1).route;
    assert.equal(index.index, true);
    assert.equal(index.element.type, Navigate);
    assert.equal(index.element.props.to, "/admin/dashboard");
    assert.equal(index.element.props.replace, true);
  });
} finally {
  await server.close();
}
