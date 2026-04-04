import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * List all draft posts (dev-only).
 */
export async function GET() {
  const draftsDir = path.join(process.cwd(), "drafts");
  if (!fs.existsSync(draftsDir)) return NextResponse.json({ drafts: [] });

  const files = fs.readdirSync(draftsDir).filter((f) => f.endsWith(".mdx"));
  const drafts = files.map((name) => ({
    name,
    slug: name.replace(/\.mdx$/, ""),
  }));

  return NextResponse.json({ drafts });
}
