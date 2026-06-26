'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit2, FileText, Sparkles, Upload, 
  X, ChevronDown, CheckSquare, Eye, ArrowLeft, BookOpen, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
import { Note } from '@/lib/db';
import { showToast, showConfirm } from '@/utils/toast';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Cloud Computing');

  // File Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch all notes
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Save new note or edit existing
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload = {
      title,
      content,
      category,
      ai_summary: editingNote?.ai_summary || 'Note created manually.',
      action_items: editingNote?.action_items || []
    };

    try {
      if (editingNote) {
        // Edit Note
        const res = await fetch(`/api/notes?id=${editingNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setEditingNote(null);
          setIsAddOpen(false);
          fetchNotes();
        }
      } else {
        // Create Note
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsAddOpen(false);
          fetchNotes();
        }
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete note
  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening card
    showConfirm(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      async () => {
        try {
          const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            if (selectedNote?.id === id) setSelectedNote(null);
            showToast('Note Deleted', 'The note was successfully removed.', 'success');
            fetchNotes();
          }
        } catch (err) {
          console.error(err);
          showToast('Error', 'Failed to delete note.', 'error');
        }
      }
    );
  };

  // Trigger file-based extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('Analysis Complete', `Successfully analyzed "${file.name}"! Note saved with AI Summary.`, 'success');
        fetchNotes();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Extraction Failed', err.message || 'Error processing file upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setIsAddOpen(true);
  };

  const resetForm = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('Cloud Computing');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Notes & Knowledge</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Store documents, notes, and ideas. Gemini automatically summarizes and extracts follow-up tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload Hidden */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.pdf,.docx" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="py-2.5 px-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            {uploading ? 'Analyzing...' : 'Upload Doc'}
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity font-semibold text-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Note
          </button>
        </div>
      </div>

      {/* NOTES GRID VIEW */}
      {isLoading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading notes library...</div>
      ) : notes.length === 0 ? (
        <div className="py-20 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-center text-xs text-slate-400">
          No notes stored. Click "Create Note" or drop a PDF/TXT file above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <motion.div
              layoutId={`note-card-${note.id}`}
              onClick={() => setSelectedNote(note)}
              key={note.id}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col justify-between cursor-pointer glow-hover relative overflow-hidden h-56"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#6D5DFC]/10 text-[#6D5DFC] dark:text-[#A78BFA] text-[10px] font-semibold border border-[#6D5DFC]/10 truncate max-w-[70%]">
                    {note.category}
                  </span>
                  
                  {note.file_name && (
                    <span className="text-[9px] text-emerald-500 font-semibold uppercase tracking-wider flex items-center gap-0.5 shrink-0">
                      <Sparkles className="w-3 h-3" />
                      Document Analyzed
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{note.title}</h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {note.ai_summary || note.content}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={(e) => openEdit(note, e)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#6D5DFC]"
                    title="Edit Note"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => deleteNote(note.id, e)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ADD/EDIT NOTE SLIDE IN DRAWER */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full max-w-md h-full bg-white dark:bg-[#131B2E] border-l border-slate-200 dark:border-slate-800/80 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                  <h3 className="font-extrabold text-base">
                    {editingNote ? 'Modify Note Details' : 'Create New Note'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsAddOpen(false);
                      resetForm();
                    }} 
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Note Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. AWS Deployment Strategy" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Cloud Computing, DSA, Personal" 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Note Content</label>
                    <textarea 
                      rows={10}
                      required
                      placeholder="Type details or dump code checkpoints here..." 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-95 font-semibold transition-all shadow-md"
                  >
                    {editingNote ? 'Save Changes' : 'Create Note'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL NOTE DETAILS DIALOG */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              layoutId={`note-card-${selectedNote.id}`}
              className="w-full max-w-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#6D5DFC]/10 text-[#6D5DFC] dark:text-[#A78BFA] text-[10px] font-semibold border border-[#6D5DFC]/10">
                    {selectedNote.category}
                  </span>
                  
                  {selectedNote.file_name && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      {selectedNote.file_name}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedNote(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white leading-tight">{selectedNote.title}</h2>
                <p className="text-[10px] text-slate-400 mt-1">
                  Saved on {new Date(selectedNote.created_at).toLocaleString()}
                </p>
              </div>

              {/* AI Insight Card (Gemini Summary & Action Items) */}
              {(selectedNote.ai_summary || (selectedNote.action_items && selectedNote.action_items.length > 0)) && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6D5DFC]/10 to-[#8B5CF6]/5 border border-[#6D5DFC]/20 shadow-inner space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                    AI Intelligence report
                  </div>

                  {selectedNote.ai_summary && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gemini Executive Summary</h4>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {selectedNote.ai_summary}
                      </p>
                    </div>
                  )}

                  {selectedNote.action_items && selectedNote.action_items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Extracted Action Items</h4>
                      <div className="space-y-1.5">
                        {selectedNote.action_items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            <CheckSquare className="w-4 h-4 text-[#6D5DFC] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Original Content */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Content</h4>
                <div className="max-h-60 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedNote.content}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <button 
                  onClick={() => setSelectedNote(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
                >
                  Close Reader
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
