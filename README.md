# Fanl [中文](README-zh_CN.md)

Fanl is an extremely simple and easy-to-use js server framework driven by the `App Router` file system routing.

Compatible with various js runtimes, such as `Bun` and `Node`.

## Installation

```shell
bun add fanl
# or
npm i fanl
# or
pnpm add fanl

```

## Usage

**Use in Bun**

Create the app directory

```
app
└── hello
    └── GET.ts

```

Edit `GET.ts`

```typescript
export default (request: Request) => {
  return new Response("hello");
};
```

Create `main.ts` in the root directory

```typescript
import { serve } from "bun";
import { createFanlFetch } from "fanl";

const fanlFetch = await createFanlFetch("./app");

serve({
  fetch: fanlFetch,
  port: 8080,
});
```

**Use in Node**

Step 1: Change `*.ts` to `*.mjs` in the above Bun code

Step 2: Import the Node compatibility layer.

> Since Node's own HTTP Server API is not compatible with the Web standard Fetch API, a compatibility layer is needed. Fortunately, the [Hono](https://github.com/honojs/hono) framework provides a Node compatibility layer [hono/node-server](https://github.com/honojs/node-server), which is great.

Install `@hono/node-server` and modify `main.mjs`

```typescript
import { serve } from "@hono/node-server";
import { createFanlFetch } from "fanl";

const fanlFetch = await createFanlFetch("./app");

serve({
  fetch: fanlFetch,
  port: 8080,
});
```

Run

```shell
bun run main.ts
# or
node main.mjs

```

Visit http://localhost:8080/hello

## App Router File System Routing

The App Router file system routing specification was first designed and popularized by NextJS, and its simple usage and excellent design provided the most direct inspiration for Fanl. Fanl chose to implement it as a route controller for pure server-side frameworks.

**Define Routes**

Each folder represents a route segment mapped to a URL segment. To create nested routes, you can nest folders within each other.

```
app
└── dashboard
    └── settings

```

Corresponding URLs

- `/dashboard`
- `/dashboard/settings`

**Create Endpoints**

Create a GET.ts interface file in the corresponding route directory.

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

**Request**

Use fetch to request the interface in the browser.

```typescript
const res = await fetch("/dashboard");
await res.text(); // hello
```

### Dynamic Routes

The App Router file system routing has three types of dynamic route segments

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

Corresponding URLs, routes, and parameter matching table

| URL          | Route               | Params                       |
| ------------ | ------------------- | ---------------------------- |
| `/roles/a/b` | `roles/[id]/[name]` | `{ "id": "a", "name": "b" }` |
| `/roles/a`   | `roles/[id]`        | `{ "id": "a" }`              |
| `/users/a/b` | `users/[...ids]`    | `{ "ids": ["a", "b"] }`      |
| `/users/a`   | `users/[...ids]`    | `{ "ids": ["a"] }`           |
| `/users`     | `users`             | `{}`                         |
| `/posts/a/b` | `posts/[[...ids]]`  | `{ "ids": ["a", "b"] }`      |
| `/posts/a`   | `posts/[[...ids]]`  | `{ "ids": ["a"] }`           |
| `/posts`     | `posts/[[...ids]]`  | `{"ids": []}`                |

Get Params in the interface

```typescript
import { useContext, useParams } from "fanl";

export default (request: Request) => {
  const ctx = useContext(); // ctx.params;
  const params = useParams<T>(); // equivalent to useContext().params
  return new Response("hello");
};
```

Wildcard Routes

`[[...ids]]` and `[...ids]` can capture the remaining route segments and can only be placed at the deepest level of the directory.

The difference between the two is that the former is optional, and the latter is required. An optional segment can match exhausted URL segments, as seen in the matching routes for the URLs `/user` and `/posts` in the table above.

## Directory Structure

### Interfaces

File name: `%METHOD%.ts`

The implementation file for the interface, which needs to export a default processing function, where %METHOD% is all http protocol methods.

```typescript
export default (request: Request) => {
  // request.method -> "get" "post" ...
  return new Response("hello");
};
```

### Composite Interfaces

File name: `handler.ts`

When a route has multiple interface implementations, all methods can be placed in the handler, and the handler supports fallback processing.

```typescript
export const GET = () => {
  return new Response("GET");
};

export const POST = () => {
  return new Response("POST");
};

// Fallback
export default () => {
  return new Response("ALL");
};
```

**Priority**

When the interface file and the composite interface define the same interface method, the interface file takes precedence. If neither is defined, the fallback file in the composite interface is used.

| Object | Priority | | ----------------------- | ------ | | Interface file | High | | Interface exported by composite interface file | Medium | | Default export of composite interface file | Low |

### Middleware

The implementation of middleware is similar to koa, using the onion ring model.

```
app
├── middleware.ts #1
└── roles
    ├── middleware.ts #2
    └── [id]
        ├── GET.ts
        └── middleware.ts #3

```

Assuming the above middleware is a simple log middleware, as follows:

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

Execution order of middleware for the request `/roles/a`

```
request #1
  request #2
    request #3
      get
    response #3
  response #2
response #1

```

When a route has multiple middleware, you can use the `compose` method to combine them.

```typescript
import { compose } from "fanl";

export default compose(middleware1, middleware2, middleware3);
```
