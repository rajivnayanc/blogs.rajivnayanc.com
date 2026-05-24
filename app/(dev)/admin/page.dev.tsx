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
  const [selectedSeriesList, setSelectedSeriesList] = useState<{ id: string; order?: number }[]>([]);
  
  // New series creation states
  const [isCreatingSeries, setIsCreatingSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [newSeriesDesc, setNewSeriesDesc] = useState("");

  const [drafts, setDrafts] = useState<DraftFile[]>([]);
  const [activeTab, setActiveTab] = useState<"write" | "drafts" | "series">("write");
  const [originalSlug, setOriginalSlug] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Series management states
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [seriesFormName, setSeriesFormName] = useState("");
  const [seriesFormDesc, setSeriesFormDesc] = useState("");
  const [deletingSeriesId, setDeletingSeriesId] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<"unlink" | "delete_blogs">("unlink");

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
        setSelectedSeriesList(prev => {
          if (!prev.some(s => s.id === newId)) {
            return [...prev, { id: newId, order: 1 }];
          }
          return prev;
        });
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
    if (selectedSeriesList.length > 0) {
      const primary = selectedSeriesList[0];
      fm += `seriesId: "${primary.id}"\n`;
      if (primary.order !== undefined && !isNaN(primary.order)) {
        fm += `seriesOrder: ${primary.order}\n`;
      }
      
      fm += `series:\n`;
      selectedSeriesList.forEach((s) => {
        fm += `  - id: "${s.id}"\n`;
        if (s.order !== undefined && !isNaN(s.order)) {
          fm += `    order: ${s.order}\n`;
        }
      });
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
  }, [content, title, description, tags, selectedSeriesList]);

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
        
        if (Array.isArray(fm.series)) {
          setSelectedSeriesList(fm.series);
        } else if (fm.seriesId && fm.seriesId !== "none") {
          setSelectedSeriesList([{ id: fm.seriesId, order: fm.seriesOrder ? parseInt(fm.seriesOrder, 10) : 1 }]);
        } else {
          setSelectedSeriesList([]);
        }

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

  const handleDelete = async (deleteSlug: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete draft "${deleteSlug}"?`);
    if (!confirmDelete) return;

    try {
      setStatus("Deleting draft...");
      const res = await fetch("/api/admin/drafts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: deleteSlug }),
      });

      if (res.ok) {
        setStatus(`Deleted draft: ${deleteSlug}`);
        loadDrafts();
      } else {
        const data = await res.json();
        setStatus(`Failed to delete draft: ${data.error || "Unknown error"}`);
      }
    } catch {
      setStatus("Error deleting draft.");
    }
  };

  const startEditSeries = (series: Series) => {
    setEditingSeries(series);
    setSeriesFormName(series.name);
    setSeriesFormDesc(series.description);
    setActiveTab("series");
  };

  const cancelEditingSeries = () => {
    setEditingSeries(null);
    setSeriesFormName("");
    setSeriesFormDesc("");
  };

  const handleSaveSeries = async () => {
    if (!seriesFormName) return;
    
    const seriesId = editingSeries 
      ? editingSeries.id 
      : seriesFormName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

    try {
      setStatus(editingSeries ? "Updating series..." : "Creating series...");
      const res = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: seriesId,
          name: seriesFormName,
          description: seriesFormDesc,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAllSeries(data.series);
        setStatus(editingSeries ? `Updated series: ${seriesFormName}` : `Created series: ${seriesFormName}`);
        cancelEditingSeries();
        loadSeries();
      } else {
        setStatus("Failed to save series.");
      }
    } catch {
      setStatus("Error saving series.");
    }
  };

  const confirmDeleteSeries = async (id: string) => {
    try {
      setStatus("Deleting series...");
      const res = await fetch("/api/admin/series", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId: id,
          action: deleteAction,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAllSeries(data.series);
        setStatus("Deleted series and updated related posts.");
        setDeletingSeriesId(null);
        loadSeries();
        loadDrafts();
      } else {
        const data = await res.json();
        setStatus(`Failed to delete series: ${data.error || "Unknown error"}`);
      }
    } catch {
      setStatus("Error deleting series.");
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
          onClick={() => {
            cancelEditingSeries();
            setActiveTab("write");
          }}
        >
          Write
        </button>
        <button
          className={`${styles.tab} ${activeTab === "drafts" ? styles.activeTab : ""}`}
          onClick={() => {
            cancelEditingSeries();
            setActiveTab("drafts");
          }}
        >
          Drafts ({drafts.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "series" ? styles.activeTab : ""}`}
          onClick={() => {
            cancelEditingSeries();
            setActiveTab("series");
          }}
        >
          Series ({allSeries.length})
        </button>
      </div>

      {activeTab === "write" && (
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
            
            {/* Series Management for Drafting */}
            <div className={styles.playlistSection} style={{ border: "1px solid hsl(var(--border))", padding: "1rem", borderRadius: "var(--radius-lg)", marginTop: "10px" }}>
              <span className={styles.paneTitle} style={{ display: "block", marginBottom: "8px" }}>Post Series</span>
              
              {selectedSeriesList.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1rem" }}>
                  {selectedSeriesList.map((item, idx) => {
                    const seriesInfo = allSeries.find(s => s.id === item.id);
                    return (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "hsl(var(--muted))", borderRadius: "var(--radius-md)" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>{seriesInfo?.name || item.id}</span>
                          <span style={{ fontSize: "10px", opacity: 0.6 }}>ID: {item.id}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <label style={{ fontSize: "var(--font-size-xs)", opacity: 0.8 }}>Order:</label>
                          <input
                            type="number"
                            placeholder="Order"
                            value={item.order !== undefined ? item.order : ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                              setSelectedSeriesList(prev => prev.map((s, i) => i === idx ? { ...s, order: val } : s));
                            }}
                            className={styles.input}
                            style={{ width: "80px", padding: "4px 8px", fontSize: "var(--font-size-xs)" }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSeriesList(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className={styles.draftDeleteLink}
                            style={{ marginLeft: "8px" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "new") {
                      setIsCreatingSeries(true);
                    } else if (val && val !== "") {
                      if (!selectedSeriesList.some(s => s.id === val)) {
                        setSelectedSeriesList(prev => [...prev, { id: val, order: 1 }]);
                      }
                      setIsCreatingSeries(false);
                    }
                  }}
                  className={styles.input}
                >
                  <option value="">-- Add to a Series --</option>
                  {allSeries
                    .filter(s => !selectedSeriesList.some(item => item.id === s.id))
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  <option value="new">+ Create New Series</option>
                </select>
              </div>
              
              {isCreatingSeries && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="New Series Name"
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
                  <button 
                    type="button" 
                    onClick={async () => {
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
                          setSelectedSeriesList(prev => [...prev, { id: newId, order: 1 }]);
                          setIsCreatingSeries(false);
                          setNewSeriesName("");
                          setNewSeriesDesc("");
                        }
                      } catch (err) {
                        setStatus("Error creating series.");
                      }
                    }} 
                    className={styles.btnPrimary}
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setIsCreatingSeries(false)} className={styles.btnSecondary}>Cancel</button>
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
      )}

      {activeTab === "drafts" && (
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
                  <button 
                    onClick={() => handleDelete(draft.slug)}
                    className={styles.draftDeleteLink}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "series" && (
        <div className={styles.seriesSection}>
          <div style={{ marginBottom: "2rem", padding: "1.5rem", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-lg)", backgroundColor: "hsl(var(--muted) / 0.2)" }}>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "1rem" }}>
              {editingSeries ? `Edit Series: ${editingSeries.name}` : "Create New Series"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Series Name (e.g. System Design)"
                value={seriesFormName}
                onChange={(e) => setSeriesFormName(e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Series Description"
                value={seriesFormDesc}
                onChange={(e) => setSeriesFormDesc(e.target.value)}
                className={styles.input}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleSaveSeries} className={styles.btnPrimary}>
                  {editingSeries ? "Update Series" : "Create Series"}
                </button>
                {editingSeries && (
                  <button onClick={cancelEditingSeries} className={styles.btnSecondary}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "0.5rem" }}>Existing Series ({allSeries.length})</h3>
            {allSeries.length === 0 ? (
              <p className={styles.emptyDrafts}>No series available yet.</p>
            ) : (
              allSeries.map((s) => (
                <div 
                  key={s.id} 
                  className={styles.draftItem} 
                  style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "12px" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className={styles.draftName} style={{ fontSize: "var(--font-size-base)", fontWeight: 600 }}>{s.name}</span>
                      <p style={{ fontSize: "var(--font-size-xs)", color: "hsl(var(--muted-foreground))", marginTop: "4px" }}>
                        {s.description || "No description provided."}
                      </p>
                      <code style={{ fontSize: "10px", background: "hsl(var(--muted))", padding: "2px 6px", borderRadius: "var(--radius-sm)", display: "inline-block", marginTop: "6px" }}>
                        ID: {s.id}
                      </code>
                    </div>
                    <div className={styles.draftActions}>
                      <button 
                        onClick={() => startEditSeries(s)}
                        className={styles.draftLink}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setDeletingSeriesId(s.id);
                          setDeleteAction("unlink");
                        }}
                        className={styles.draftDeleteLink}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {deletingSeriesId === s.id && (
                    <div 
                      style={{ 
                        marginTop: "8px", 
                        padding: "1rem", 
                        background: "hsl(var(--destructive) / 0.05)", 
                        border: "1px solid hsl(var(--destructive) / 0.2)", 
                        borderRadius: "var(--radius-md)" 
                      }}
                    >
                      <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "hsl(var(--destructive))", marginBottom: "8px" }}>
                        Delete Series Option:
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1rem" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--font-size-xs)", cursor: "pointer", color: "hsl(var(--foreground))" }}>
                          <input 
                            type="radio" 
                            name={`delete-action-${s.id}`} 
                            value="unlink" 
                            checked={deleteAction === "unlink"}
                            onChange={() => setDeleteAction("unlink")}
                          />
                          Unlink posts (keeps all post files, just removes them from this series)
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--font-size-xs)", cursor: "pointer", color: "hsl(var(--destructive))" }}>
                          <input 
                            type="radio" 
                            name={`delete-action-${s.id}`} 
                            value="delete_blogs" 
                            checked={deleteAction === "delete_blogs"}
                            onChange={() => setDeleteAction("delete_blogs")}
                          />
                          Delete all posts in this series permanently
                        </label>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                          onClick={() => confirmDeleteSeries(s.id)} 
                          className={styles.btnPrimary}
                          style={{ backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" }}
                        >
                          Confirm Delete
                        </button>
                        <button 
                          onClick={() => setDeletingSeriesId(null)} 
                          className={styles.btnSecondary}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
