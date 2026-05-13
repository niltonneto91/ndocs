import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const uploadRoot = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

export async function saveLocalFile(file: File, folder = "documents") {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeOriginal}`;
  const dir = path.join(uploadRoot, folder);
  await mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, fileName);
  await writeFile(fullPath, bytes);
  return {
    fileName,
    originalFileName: file.name,
    filePath: path.relative(uploadRoot, fullPath),
    fileSize: bytes.byteLength,
    mimeType: file.type || "application/octet-stream"
  };
}

export function resolveUploadPath(relativePath: string) {
  return path.join(uploadRoot, relativePath);
}
