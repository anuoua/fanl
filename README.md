# Fanl

An app route powered the easiest server framework for js runtime just like `Bun`.

## Install

```shell
bun add fanl
```

## Usage

create app folder

```
app
└── hello
    └── GET.ts
```

GET.ts

```typescript
export default (request: Request) => {
  return new Response("hello");
};
```

create `./main.ts`

```typescript
import { serve } from "bun";
import { createFanlFetch } from "fanl";

const fanlFetch = await createFanlFetch("./app");

serve({
  fetch: fanlFetch,
});
```

run

```shell
bun run main.ts
```

## App route

App route is inspired by Next.js app route design. You can organize app like below.

```
app # root folder
├── GET.ts # get /
├── handler.ts # all method or all in one /
├── middleware.ts # middleware
└── users
    ├── [...ids]
    │   └── GET.ts # get /users/a/b/c
    ├── [[...oh]]
    │   └── GET.ts # get /users/a/b/c... or /users
    ├── [id]
    │   └── GET.ts # get /users/a
    └── middleware.ts # middleware
```
