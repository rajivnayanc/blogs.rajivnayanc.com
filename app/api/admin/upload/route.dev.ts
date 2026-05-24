import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Upload images for blog posts (dev-only).
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const slug = formData.get("slug") as string;
  const isSeries = formData.get("isSeries") === "true";
  const seriesId = formData.get("seriesId") as string;
  const isCover = formData.get("isCover") === "true";
  const images = formData.getAll("images") as File[];

  if ((!slug && !isSeries) || images.length === 0) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const imageSubDir = isSeries ? ["series"] : ["drafts", slug];
  const imageDir = path.join(process.cwd(), "public", "images", ...imageSubDir);
  if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

  const paths: string[] = [];
  for (const image of images) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const ext = path.extname(image.name).toLowerCase();
    
    let filename = "";
    if (isSeries) {
      filename = `${seriesId || "new-series"}-banner${ext}`;
    } else if (isCover) {
      filename = `cover${ext}`;
    } else {
      const baseName = path.basename(image.name, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      filename = `${baseName || "image"}${ext}`;
    }

    fs.writeFileSync(path.join(imageDir, filename), buffer);
    const pathPrefix = isSeries ? `/images/series/${filename}` : `/images/drafts/${slug}/${filename}`;
    paths.push(pathPrefix);
  }

  return NextResponse.json({ success: true, paths });
}
