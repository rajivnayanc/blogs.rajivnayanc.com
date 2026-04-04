import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Save blog posts to disk (dev-only).
 * This route will not exist in production static builds.
 */
export async function POST(request: NextRequest) {
  let { slug, content, isDraft, originalSlug } = await request.json();
  if (!slug || !content) {
    return NextResponse.json({ error: "Missing slug or content" }, { status: 400 });
  }

  // Handle renaming (moving files/folders if slug changed)
  if (originalSlug && originalSlug !== slug) {
    const oldDraftMdx = path.join(process.cwd(), "drafts", `${originalSlug}.mdx`);
    const oldContentMdx = path.join(process.cwd(), "content", `${originalSlug}.mdx`);
    
    if (fs.existsSync(oldDraftMdx)) fs.unlinkSync(oldDraftMdx);
    if (fs.existsSync(oldContentMdx)) fs.unlinkSync(oldContentMdx);

    // Relocate images if they exist
    const oldDraftImgDir = path.join(process.cwd(), "public", "images", "drafts", originalSlug);
    const newDraftImgDir = path.join(process.cwd(), "public", "images", "drafts", slug);
    if (fs.existsSync(oldDraftImgDir)) {
      if (fs.existsSync(newDraftImgDir)) fs.rmSync(newDraftImgDir, { recursive: true, force: true });
      fs.renameSync(oldDraftImgDir, newDraftImgDir);
    }
  }

  // Handle image relocation when publishing
  if (!isDraft) {
    const draftImgDir = path.join(process.cwd(), "public", "images", "drafts", slug);
    const postImgDir = path.join(process.cwd(), "public", "images", "posts", slug);

    if (fs.existsSync(draftImgDir)) {
      if (!fs.existsSync(path.join(process.cwd(), "public", "images", "posts"))) {
        fs.mkdirSync(path.join(process.cwd(), "public", "images", "posts"), { recursive: true });
      }
      
      // Move folder
      if (fs.existsSync(postImgDir)) {
        // Clear existing post image dir if it exists (overwrite)
        fs.rmSync(postImgDir, { recursive: true, force: true });
      }
      fs.renameSync(draftImgDir, postImgDir);

      // Update paths in content
      const draftPath = `/images/drafts/${slug}`;
      const postPath = `/images/posts/${slug}`;
      content = content.split(draftPath).join(postPath);
    }

    // Also remove the draft MDX file if it exists
    const draftMdxPath = path.join(process.cwd(), "drafts", `${slug}.mdx`);
    if (fs.existsSync(draftMdxPath)) {
      fs.unlinkSync(draftMdxPath);
    }
  }

  const dir = isDraft
    ? path.join(process.cwd(), "drafts")
    : path.join(process.cwd(), "content");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path.join(dir, `${slug}.mdx`), content, "utf-8");
  return NextResponse.json({ 
    success: true, 
    updatedContent: content,
    finalSlug: slug 
  });
}
