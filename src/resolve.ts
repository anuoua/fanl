import path from "path";
import { existsSync } from "fs";
import type { BasicTreeNode } from "@app-route/core";

const extensions = ["js", "jsx", "mjs", "ts", "tsx"] as const;
const targets = [
  "middleware",
  "handle",
  "miss",
  "GET",
  "POST",
  "DELETE",
  "PUT",
  "OPTIONS",
  "HEAD",
  "PATCH",
  "CONNECT",
  "TRACE",
] as const;

export const resolve = async (node: BasicTreeNode) => {
  const existsSyncArray = (file: string, fold: string) => {
    const files = extensions.map((i) => `${file}.${i}`);
    const result = files.find((filePath) =>
      existsSync(path.resolve(fold, filePath))
    );
    return result ? path.resolve(fold, result) : undefined;
  };

  const record: {
    [K in (typeof targets)[number]]?: string;
  } = {};

  targets.forEach((file) => {
    record[file] = existsSyncArray(file, node.path) ?? undefined;
  });

  return record;
};
