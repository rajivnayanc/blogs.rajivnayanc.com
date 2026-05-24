import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Series } from "@/types/post";

export async function GET() {
  const file = path.join(process.cwd(), "content", "series.json");
  if (!fs.existsSync(file)) return NextResponse.json({ series: [] });
  const raw = fs.readFileSync(file, "utf-8");
  try {
    const series = JSON.parse(raw);
    return NextResponse.json({ series });
  } catch {
    return NextResponse.json({ series: [] });
  }
}

export async function POST(request: NextRequest) {
  const file = path.join(process.cwd(), "content", "series.json");
  const newSeries = (await request.json()) as Series;

  let allSeries: Series[] = [];
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, "utf-8");
    try {
      allSeries = JSON.parse(raw);
    } catch (e) {
      // Ignore
    }
  }

  // Prevent duplicate IDs
  if (!allSeries.some((s) => s.id === newSeries.id)) {
    allSeries.push(newSeries);
  } else {
    // Update existing
    allSeries = allSeries.map((s) =>
      s.id === newSeries.id ? newSeries : s
    );
  }

  fs.writeFileSync(file, JSON.stringify(allSeries, null, 2), "utf-8");
  return NextResponse.json({ success: true, series: allSeries });
}

export async function DELETE(request: NextRequest) {
  try {
    const { seriesId, action } = (await request.json()) as {
      seriesId: string;
      action: "unlink" | "delete_blogs";
    };

    if (!seriesId) {
      return NextResponse.json({ error: "Series ID is required" }, { status: 400 });
    }

    const file = path.join(process.cwd(), "content", "series.json");
    if (!fs.existsSync(file)) {
      return NextResponse.json({ error: "No series file found" }, { status: 404 });
    }

    let allSeries: Series[] = [];
    try {
      allSeries = JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch {
      // Ignore
    }

    // Check if series exists
    const seriesExists = allSeries.some((s) => s.id === seriesId);
    if (!seriesExists) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    // Remove from series list
    allSeries = allSeries.filter((s) => s.id !== seriesId);
    fs.writeFileSync(file, JSON.stringify(allSeries, null, 2), "utf-8");

    // Process drafts and published content directories
    const processDirectory = (dirPath: string, isDraft: boolean) => {
      if (!fs.existsSync(dirPath)) return;
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".mdx"));

      files.forEach((filename) => {
        const filePath = path.join(dirPath, filename);
        const slug = filename.replace(/\.mdx$/, "");
        const rawContent = fs.readFileSync(filePath, "utf-8");

        const { data, content } = matter(rawContent);

        const matchesSingle = data.seriesId === seriesId;
        const matchesMulti =
          Array.isArray(data.series) &&
          data.series.some((s: any) => s.id === seriesId);

        if (matchesSingle || matchesMulti) {
          if (action === "delete_blogs") {
            // Delete post file
            fs.unlinkSync(filePath);

            // Delete post images folder
            const imgSubDir = isDraft ? "drafts" : "posts";
            const imgDir = path.join(process.cwd(), "public", "images", imgSubDir, slug);
            if (fs.existsSync(imgDir)) {
              fs.rmSync(imgDir, { recursive: true, force: true });
            }
          } else {
            // Unlink series
            if (matchesSingle) {
              delete data.seriesId;
              delete data.seriesOrder;
            }
            if (matchesMulti) {
              data.series = data.series.filter((s: any) => s.id !== seriesId);
              if (data.series.length === 0) {
                delete data.series;
              }
            }
            // Save updated post content
            const updatedContent = matter.stringify(content, data);
            fs.writeFileSync(filePath, updatedContent, "utf-8");
          }
        }
      });
    };

    const draftsDir = path.join(process.cwd(), "drafts");
    const contentDir = path.join(process.cwd(), "content");

    processDirectory(draftsDir, true);
    processDirectory(contentDir, false);

    return NextResponse.json({ success: true, series: allSeries });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete series" },
      { status: 500 }
    );
  }
}
