import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Upload images for blog posts (dev-only).
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const slug = formData.get("slug") as string;
  const images = formData.getAll("images") as File[];

  if (!slug || images.length === 0) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const imageDir = path.join(process.cwd(), "public", "images", "drafts", slug);
  if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

  const paths: string[] = [];
  for (const image of images) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const filename = image.name.replace(/\s+/g, "-");
    fs.writeFileSync(path.join(imageDir, filename), buffer);
    paths.push(`/images/drafts/${slug}/${filename}`);
  }

  return NextResponse.json({ success: true, paths });
}
