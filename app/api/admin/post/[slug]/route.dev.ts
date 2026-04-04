import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * Fetch a single post or draft (dev-only).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  const contentPath = path.join(process.cwd(), "content", `${slug}.mdx`);
  const draftPath = path.join(process.cwd(), "drafts", `${slug}.mdx`);

  let filePath = fs.existsSync(draftPath) ? draftPath : contentPath;

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return NextResponse.json({ 
    frontmatter: data, 
    content,
    isDraft: filePath === draftPath
  });
}
