import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileEdit, 
  ExternalLink, 
  Bookmark, 
  Check, 
  Clock, 
  Cpu,
  Terminal
} from 'lucide-react';

export default function ProblemNotesModal({ 
  problem, 
  isOpen, 
  onClose, 
  initialNote = {}, 
  isBookmarked = false,
  onSaveNote, 
  onToggleBookmark 
}) {
  if (!isOpen || !problem) return null;

  const [approach, setApproach] = useState(initialNote.approach || '');
  const [timeComplexity, setTimeComplexity] = useState(initialNote.timeComplexity || '');
  const [spaceComplexity, setSpaceComplexity] = useState(initialNote.spaceComplexity || '');
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  useEffect(() => {
    setApproach(initialNote.approach || '');
    setTimeComplexity(initialNote.timeComplexity || '');
    setSpaceComplexity(initialNote.spaceComplexity || '');
    setBookmarked(isBookmarked);
  }, [initialNote, isBookmarked, problem]);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveNote(problem.id, {
      approach,
      timeComplexity,
      spaceComplexity,
      updatedAt: new Date().toISOString()
    });
    if (bookmarked !== isBookmarked) {
      onToggleBookmark(problem.id);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div 
        className="glass-card modal-content" 
        style={{ padding: '1.25rem 1.5rem', maxWidth: '480px', width: '95%' }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              background: 'var(--accent-green-dark)',
              border: '1px solid var(--accent-green)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-green)'
            }}>
              <Terminal size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="badge tag-terminal" style={{ fontSize: '0.65rem' }}>
                  {problem.platform}
                </span>
                <span className={`badge badge-${problem.difficulty?.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                  {problem.difficulty}
                </span>
                {problem.rating && (
                  <span className="badge badge-rating" style={{ fontSize: '0.65rem' }}>
                    R:{problem.rating}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                {problem.title}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Links & Concepts */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.45rem 0.65rem',
          background: 'var(--bg-dark)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '0.75rem',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {problem.concepts?.map((c, i) => (
              <span key={i} className="concept-pill" style={{ fontSize: '0.65rem' }}>
                #{c}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <a 
              href={problem.url} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
            >
              <span>PROBLEM</span>
              <ExternalLink size={10} />
            </a>
            {problem.submissionUrl && (
              <a 
                href={problem.submissionUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
              >
                <span>SUBMISSION</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          
          {/* Approach & Logic Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-muted)' }}>
              APPROACH_&_COMPLEXITY_LOG
            </label>
            <textarea
              rows={4}
              placeholder="// Write state transition equations, invariant properties, or edge-case handling..."
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical', lineHeight: 1.4, fontSize: '0.75rem' }}
            />
          </div>

          {/* Time & Space Complexity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-dim)' }}>
                <Clock size={12} color="var(--accent-green)" />
                <span>TIME_COMPLEXITY</span>
              </label>
              <input 
                type="text"
                placeholder="O(N log N)"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                className="input-field"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.55rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-dim)' }}>
                <Cpu size={12} color="var(--accent-green)" />
                <span>SPACE_COMPLEXITY</span>
              </label>
              <input 
                type="text"
                placeholder="O(N)"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                className="input-field"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.55rem' }}
              />
            </div>
          </div>

          {/* Revision Bookmark Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.45rem 0.65rem',
            background: 'var(--bg-dark)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bookmark size={14} color="var(--accent-green)" />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  FLAG_FOR_REVISION
                </span>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  Mark problem in spaced repetition queue
                </p>
              </div>
            </div>

            <input 
              type="checkbox"
              checked={bookmarked}
              onChange={(e) => setBookmarked(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-green)' }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.35rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} style={{ fontSize: '0.72rem' }}>
              CANCEL
            </button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
              <Check size={13} />
              <span>SAVE_NOTES</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
