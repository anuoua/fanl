import { it, expect } from "bun:test";
import { createFanlFetch } from "../src";
import { serve } from "bun";

const fanlFetch = await createFanlFetch("test/app");

serve({
  fetch: fanlFetch,
  port: 8080,
  hostname: "0.0.0.0",
});

it("serve", async () => {
  const res = await (await fetch("http://0.0.0.0:8080")).text();
  expect(res).toBe("hello");
});

it("serve default", async () => {
  const res = await (
    await fetch("http://0.0.0.0:8080", { method: "PUT" })
  ).text();
  expect(res).toBe("default");
});

it("context", async () => {
  const res = await (
    await fetch("http://0.0.0.0:8080", {
      method: "post",
    })
  ).text();
  expect(res).toBe("root");
});

it("params", async () => {
  const res = await (
    await fetch("http://0.0.0.0:8080/users/hey", {
      method: "get",
    })
  ).text();
  expect(res).toBe("hey");
});

it("params rest", async () => {
  const res = await (
    await fetch("http://0.0.0.0:8080/users/hey/yo", {
      method: "get",
    })
  ).text();
  expect(res).toBe("hey,yo");
});

it("params optional rest", async () => {
  const res = await (
    await fetch("http://0.0.0.0:8080/users", {
      method: "get",
    })
  ).text();
  expect(res).toBe("optional");
});
