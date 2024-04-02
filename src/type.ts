export type Middleware = (
  req: Request,
  next: (req: Request) => Promise<Response>
) => Promise<Response>;

export type METHODS =
  | "GET"
  | "POST"
  | "DELETE"
  | "PUT"
  | "OPTIONS"
  | "HEAD"
  | "PATCH"
  | "CONNECT"
  | "TRACE";

export interface Context {
  params: Record<string, any>;
  [index: string]: any;
}
