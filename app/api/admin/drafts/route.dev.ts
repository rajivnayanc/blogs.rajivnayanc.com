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

/**
 * Delete a draft post and its associated assets (dev-only).
 */
export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const draftsDir = path.join(process.cwd(), "drafts");
    const filePath = path.join(draftsDir, `${slug}.mdx`);
    const draftImgDir = path.join(process.cwd(), "public", "images", "drafts", slug);

    let deleted = false;

    // Delete MDX file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deleted = true;
    }

    // Delete draft images folder if it exists
    if (fs.existsSync(draftImgDir)) {
      fs.rmSync(draftImgDir, { recursive: true, force: true });
    }

    if (deleted) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete draft" },
      { status: 500 }
    );
  }
}
