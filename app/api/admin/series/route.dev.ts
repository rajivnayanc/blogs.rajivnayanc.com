import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
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
