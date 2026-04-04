"use client";

import { useState, useCallback, useEffect } from "react";
import styles from "./page.dev.module.css";
import type { Series } from "@/types/post";

interface DraftFile {
  name: string;
  slug: string;
}

export default function AdminPage() {
  if (process.env.NODE_ENV === "production") {
    return <p>This page is only available in development mode.</p>;
  }
  return <AdminDashboard />;
}

function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("Software Engineering");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  
  // Series states
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [seriesOrder, setSeriesOrder] = useState("");
  
  // New series creation states
  const [isCreatingSeries, setIsCreatingSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [newSeriesDesc, setNewSeriesDesc] = useState("");

  const [drafts, setDrafts] = useState<DraftFile[]>([]);
  const [activeTab, setActiveTab] = useState<"write" | "drafts">("write");
  const [originalSlug, setOriginalSlug] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const loadDrafts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/drafts");
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.drafts || []);
      }
    } catch {
      // API might not exist yet
    }
  }, []);

  const loadSeries = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/series");
      if (res.ok) {
        const data = await res.json();
        setAllSeries(data.series || []);
      }
    } catch {
      // API might not exist yet
    }
  }, []);

  useEffect(() => {
    loadDrafts();
    loadSeries();
  }, [loadDrafts, loadSeries]);

  const handleCreateSeries = async () => {
    if (!newSeriesName) return;
    const newId = newSeriesName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      const res = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId,
          name: newSeriesName,
          description: newSeriesDesc,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAllSeries(data.series);
        setSelectedSeriesId(newId);
        setIsCreatingSeries(false);
        setNewSeriesName("");
        setNewSeriesDesc("");
      }
    } catch {
      setStatus("Error creating series.");
    }
  };

  const generateFrontmatter = () => {
    let fm = `---
title: "${title}"
description: "${description}"
date: "${new Date().toISOString().split("T")[0]}"
tags: [${tags
      .split(",")
      .filter(t => t.trim() !== "")
      .map((t) => `"${t.trim()}"`)
      .join(", ")}]
image: ""
published: false
author: "Rajiv Nayan Choubey"
`;
    if (selectedSeriesId && selectedSeriesId !== "none") {
      fm += `seriesId: "${selectedSeriesId}"\n`;
      if (seriesOrder) {
        fm += `seriesOrder: ${parseInt(seriesOrder, 10)}\n`;
      }
    }
    fm += `---\n\n`;
    return fm;
  };

  const handleSaveDraft = async () => {
    if (!title) {
      setStatus("Please enter a title.");
      return;
    }

    const fullContent = generateFrontmatter() + content;
    try {
      setIsAutoSaving(true);
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          slug, 
          content: fullContent, 
          isDraft: true,
          originalSlug 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastSaved(new Date());
        setOriginalSlug(data.finalSlug || slug); 
        loadDrafts();
      } else {
        setStatus("Failed to save draft.");
      }
    } catch {
      setStatus("Error saving draft.");
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!title || !content || activeTab !== "write") return;
    
    const timer = setTimeout(() => {
      handleSaveDraft();
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(timer);
  }, [content, title, description, tags, selectedSeriesId, seriesOrder]);

  const handleEdit = async (editSlug: string) => {
    try {
      setStatus("Loading post...");
      const res = await fetch(`/api/admin/post/${editSlug}`);
      if (res.ok) {
        const data = await res.json();
        const fm = data.frontmatter;
        
        setTitle(fm.title || "");
        setDescription(fm.description || "");
        setTags(Array.isArray(fm.tags) ? fm.tags.join(", ") : "");
        setContent(data.content || "");
        setSelectedSeriesId(fm.seriesId || "none");
        setSeriesOrder(fm.seriesOrder ? fm.seriesOrder.toString() : "");
        setOriginalSlug(editSlug);
        setActiveTab("write");
        setStatus(`Editing: ${editSlug}`);
      } else {
        setStatus("Failed to load post.");
      }
    } catch {
      setStatus("Error fetching post data.");
    }
  };

  const handlePublish = async () => {
    if (!title) {
      setStatus("Please enter a title.");
      return;
    }

    const frontmatter = generateFrontmatter().replace(
      "published: false",
      "published: true"
    );
    const fullContent = frontmatter + content;

    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          slug, 
          content: fullContent, 
          isDraft: false,
          originalSlug 
        }),
      });

      if (res.ok) {
        setStatus(`Published: content/${slug}.mdx`);
        setOriginalSlug(slug);
        loadDrafts();
      } else {
        setStatus("Failed to publish.");
      }
    } catch {
      setStatus("Error publishing.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !slug) return;

    const formData = new FormData();
    formData.append("slug", slug);
    for (const file of Array.from(files)) {
      formData.append("images", file);
    }

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const paths = data.paths as string[];
        const markdown = paths.map((p: string) => `![alt text](${p})`).join("\n");
        setContent((prev) => prev + "\n" + markdown + "\n");
        setStatus(`Uploaded ${paths.length} image(s)`);
      }
    } catch {
      setStatus("Error uploading images.");
    }
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blog Admin</h1>
        <span className={styles.badge}>Dev Only</span>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "write" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("write")}
        >
          Write
        </button>
        <button
          className={`${styles.tab} ${activeTab === "drafts" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("drafts")}
        >
          Drafts ({drafts.length})
        </button>
      </div>

      {activeTab === "write" ? (
        <div className={styles.editor}>
          {/* Metadata */}
          <div className={styles.fields}>
            <input
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={styles.input}
            />
            
            {/* Series Selection */}
            <div className={styles.playlistSection}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={selectedSeriesId}
                  onChange={(e) => {
                    if (e.target.value === "new") {
                      setSelectedSeriesId("none");
                      setIsCreatingSeries(true);
                    } else {
                      setSelectedSeriesId(e.target.value);
                      setIsCreatingSeries(false);
                    }
                  }}
                  className={styles.input}
                >
                  <option value="none">-- No Series --</option>
                  {allSeries.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  <option value="new">+ Create New Series</option>
                </select>
                
                {selectedSeriesId !== "none" && selectedSeriesId !== "" && !isCreatingSeries && (
                  <input
                    type="number"
                    placeholder="Series Order (e.g. 1)"
                    value={seriesOrder}
                    onChange={(e) => setSeriesOrder(e.target.value)}
                    className={styles.input}
                    style={{ width: '150px' }}
                  />
                )}
              </div>
              
              {isCreatingSeries && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="Series Name"
                    value={newSeriesName}
                    onChange={(e) => setNewSeriesName(e.target.value)}
                    className={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newSeriesDesc}
                    onChange={(e) => setNewSeriesDesc(e.target.value)}
                    className={styles.input}
                  />
                  <button onClick={handleCreateSeries} className={styles.btnPrimary}>Save</button>
                  <button onClick={() => setIsCreatingSeries(false)} className={styles.btnSecondary}>Cancel</button>
                </div>
              )}
            </div>

            {slug && (
              <p className={styles.slugPreview}>
                Slug: <code>{slug}</code>
              </p>
            )}
          </div>

          {/* Split Editor + Preview */}
          <div className={styles.splitPane}>
            <div className={styles.pane}>
              <h3 className={styles.paneTitle}>Editor</h3>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your MDX content here..."
              />
            </div>
            <div className={styles.pane}>
              <h3 className={styles.paneTitle}>Preview (Raw)</h3>
              <div className={styles.preview}>
                <pre>{generateFrontmatter() + content}</pre>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <label className={styles.uploadLabel}>
              📎 Upload Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
            </label>
            <button onClick={handleSaveDraft} className={styles.btnSecondary}>
              Save as Draft
            </button>
            {title && (
              <a 
                href={`/admin/preview/${slug}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.btnSecondary}
              >
                Full Preview ↗
              </a>
            )}
            <button onClick={handlePublish} className={styles.btnPrimary}>
              Publish
            </button>
          </div>

          {status && <p className={styles.status}>{status}</p>}
          {lastSaved && (
            <p className={styles.saveStatus}>
              {isAutoSaving ? "Saving..." : `Last saved at ${lastSaved.toLocaleTimeString()}`}
            </p>
          )}
        </div>
      ) : (
        <div className={styles.draftsList}>
          {drafts.length === 0 ? (
            <p className={styles.emptyDrafts}>No drafts yet.</p>
          ) : (
            drafts.map((draft) => (
              <div key={draft.slug} className={styles.draftItem}>
                <span className={styles.draftName}>{draft.name}</span>
                <div className={styles.draftActions}>
                  <a 
                    href={`/admin/preview/${draft.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.draftLink}
                  >
                    View Preview ↗
                  </a>
                  <button 
                    onClick={() => handleEdit(draft.slug)}
                    className={styles.draftLink}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
