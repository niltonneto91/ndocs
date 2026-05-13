import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { resolveUploadPath } from "@/lib/storage/local-storage";

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const relativePath = path.join("/");
  const file = await readFile(resolveUploadPath(relativePath));
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${path.at(-1) ?? "arquivo"}"`
    }
  });
}
