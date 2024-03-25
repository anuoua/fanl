import { serve as BunServe, type Serve, type ServeOptions } from "bun";
import { createFetch } from "./fetch";

export const createServe = async (app: string, options: Exclude<Serve, ServeOptions> | Omit<ServeOptions, 'fetch'>) => {
  return BunServe({
    fetch: await createFetch(app),
    ...options
  });
}