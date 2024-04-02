# Fanl

Fanl 是一款由 `App Router` 文件系统路由驱动的，极致简单易用的 js 服务端框架。

适配各类 js 运行时，`Bun` `Node` 等。

## 安装

```shell
bun add fanl
# or
npm i fanl
# or
pnpm add fanl
```

## 使用

**在 Bun 中使用**

创建 app 目录

```
app
└── hello
    └── GET.ts
```

编辑 `GET.ts`

```typescript
export default (request: Request) => {
  return new Response("hello");
};
```

在根目录创建 `main.ts`

```typescript
import { serve } from "bun";
import { createFanlFetch } from "fanl";

const fanlFetch = await createFanlFetch("./app");

serve({
  fetch: fanlFetch,
  port: 8080,
});
```

**在 Node 中使用**

第一步：将上述 Bun 代码中 `*.ts` 改成 `*.mjs`

第二步：引入 Node 兼容层。

> 由于 Node 本身的 HTTP Server API 并不兼容 Web 规范 Fetch API，故需要引入兼容层，幸运的是 [Hono](https://github.com/honojs/hono) 框架提供了 Node 兼容层 [hono/node-server](https://github.com/honojs/node-server)，很棒。

安装 `@hono/node-server`，并修改 `main.mjs`

```typescript
import { serve } from "@hono/node-server";
import { createFanlFetch } from "fanl";

const fanlFetch = await createFanlFetch("./app");

serve({
  fetch: fanlFetch,
  port: 8080,
});
```

运行

```shell
bun run main.ts
# or
node main.mjs
```

访问 http://localhost:8080/hello

## App Router 文件系统路由

App Router 文件系统路由规范首先由 NextJS 设计并推广，其简单的使用方式和优秀的设计为 Fanl 提供了最直接的灵感，Fanl 选择将它实现为纯服务端框架的路由控制器。

**定义路由**

每个文件夹代表一个映射到 URL 段的路由段。要创建嵌套路由，您可以将文件夹相互嵌套。

```
app
└── dashboard
    └── settings
```

对应 URL

- `/dashboard`
- `/dashboard/settings`

**创建接口**

在相应的路由目录下创建 GET.ts 接口文件。

```
app
└── dashboard
    ├── GET.ts
    └── settings
        └── GET.ts
```

GET.ts

```typescript
export default (request: Request) => {
  return new Response("hello");
};
```

**请求**

在浏览器内使用 fetch 请求接口。

```typescript
const res = await fetch("/dashboard");
await res.text(); // hello
```

### 动态路由

App Router 文件系统路由有三种类型的动态路由段

- `[slug]`
- `[...slug]`
- `[[...slug]]`

```
app
├── roles
│   └── [id]
│       └── [name]
├── posts
│   └── [[...ids]]
└── users
    └── [...ids]
```

对应 URL、路由、参数匹配表

| URL          | 路由                | Params                       |
| ------------ | ------------------- | ---------------------------- |
| `/roles/a/b` | `roles/[id]/[name]` | `{ "id": "a", "name": "b" }` |
| `/roles/a`   | `roles/[id]`        | `{ "id": "a" }`              |
| `/users/a/b` | `users/[...ids]`    | `{ "ids": ["a", "b"] }`      |
| `/users/a`   | `users/[...ids]`    | `{ "ids": ["a"] }`           |
| `/users`     | `users`             | `{}`                         |
| `/posts/a/b` | `posts/[[...ids]]`  | `{ "ids": ["a", "b"] }`      |
| `/posts/a`   | `posts/[[...ids]]`  | `{ "ids": ["a"] }`           |
| `/posts`     | `posts/[[...ids]]`  | `{"ids": []}`                |

在接口中获取 Params

```typescript
import { useContext, useParams } from "fanl";

export default (request: Request) => {
  const ctx = useContext(); // ctx.params;
  const params = useParams<T>(); // 等于 useContext().params
  return new Response("hello");
};
```

泛路由

`[[...ids]]` 和 `[...ids]` 可以捕获剩余的路由段，两者都只能放在最深的目录下。

两者的区别，前者是可选的，后者是必选的，可选段可以匹配已耗尽的 URL 段，对比上述匹配表中 URL `/user` 和 `/posts` 的匹配路由，你就能理解了。

## 目录组成

### 接口

文件名：`%METHOD%.ts`

接口的实现文件，需要导出默认处理函数，%METHOD% 为所有 http 协议方法。

```typescript
export default (request: Request) => {
  // request.method -> "get" "post" ...
  return new Response("hello");
};
```

### 综合接口

文件名：`handler.ts`

当一个路由有多个接口实现，可以把所有方法都放入 handler，同时 handler 支持兜底处理。

```typescript
export const GET = () => {
  return new Response("GET");
};

export const POST = () => {
  return new Response("POST");
};

// 兜底
export default () => {
  return new Response("ALL");
};
```

**优先级**

当接口文件和综合接口定义了一样的接口方法，那么以接口文件为准，如果都没有定义，则走综合接口的兜底文件。

| 对象                    | 优先级 |
| ----------------------- | ------ |
| 接口文件                | 高     |
| 综合接口文件 导出的接口 | 中     |
| 综合接口文件 默认导出   | 低     |

### 中间件

中间件的实现和 koa 类似，洋葱圈模式。

```
app
├── middleware.ts #1
└── roles
    ├── middleware.ts #2
    └── [id]
        ├── GET.ts
        └── middleware.ts #3
```

假设上述中间件为简单的 log 中间件，如下：

```typescript
export default (
  request: Request,
  next: (req: Request) => Promise<Response>
) => {
  console.log("request #x");
  const res = await next(request);
  console.log("response  #x");
  return res;
};
```

请求 `/roles/a` 中间件执行顺序

```
request #1
  request #2
    request #3
      get
    response #3
  response #2
response #1
```

当一个路由有多个中间件，可以使用 compose 方法进行组合。

```typescript
import { compose } from "fanl";

export default compose(middleware1, middleware2, middleware3);
```
