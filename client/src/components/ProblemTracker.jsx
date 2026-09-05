import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  BookmarkCheck, 
  FileEdit, 
  LayoutList, 
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Code2
} from 'lucide-react';
import PlatformIcon from './PlatformIcons';

export default function ProblemTracker({ 
  problems = [], 
  concepts = [], 
  bookmarks = {}, 
  notes = {}, 
  onToggleBookmark, 
  onOpenNotesModal,
  selectedConceptFilter,
  onClearConceptFilter
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedVerdict, setSelectedVerdict] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedConcept, setSelectedConcept] = useState(selectedConceptFilter || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // Sync external concept filter if changed from dashboard
  React.useEffect(() => {
    if (selectedConceptFilter) {
      setSelectedConcept(selectedConceptFilter);
    }
  }, [selectedConceptFilter]);

  // Filtered and sorted problems
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title?.toLowerCase().includes(q);
        const matchId = p.problemId?.toLowerCase().includes(q);
        const matchConcepts = p.concepts?.some(c => c.toLowerCase().includes(q));
        if (!matchTitle && !matchId && !matchConcepts) return false;
      }

      // 2. Platform
      if (selectedPlatform !== 'all' && p.platformKey !== selectedPlatform) {
        return false;
      }

      // 3. Verdict
      if (selectedVerdict !== 'all' && p.verdict.toLowerCase() !== selectedVerdict.toLowerCase()) {
        return false;
      }

      // 4. Difficulty
      if (selectedDifficulty !== 'all' && p.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }

      // 5. Concept
      if (selectedConcept !== 'all') {
        const hasTag = p.concepts?.some(c => c.toLowerCase().includes(selectedConcept.toLowerCase()));
        if (!hasTag) return false;
      }

      // 6. Only Bookmarked
      if (onlyBookmarked && !bookmarks[p.id]) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.timeSeconds || 0) - (a.timeSeconds || 0);
      if (sortBy === 'oldest') return (a.timeSeconds || 0) - (b.timeSeconds || 0);
      if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'rating-asc') return (a.rating || 0) - (b.rating || 0);
      return 0;
    });
  }, [problems, searchQuery, selectedPlatform, selectedVerdict, selectedDifficulty, selectedConcept, sortBy, onlyBookmarked, bookmarks]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProblems.slice(start, start + pageSize);
  }, [filteredProblems, currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
    setSelectedVerdict('all');
    setSelectedDifficulty('all');
    setSelectedConcept('all');
    setSortBy('newest');
    setOnlyBookmarked(false);
    setCurrentPage(1);
    if (onClearConceptFilter) onClearConceptFilter();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Filter & Search Panel */}
      <div className="glass-card" style={{ padding: '1.1rem 1.25rem' }}>
        
        {/* Top Filter Row: Search & View Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '0.85rem'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '260px' }}>
            <Search 
              size={16} 
              color="var(--text-dim)" 
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input 
              type="text"
              placeholder="Search problems by name, tag, or ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <LayoutList size={14} />
              <span>Table</span>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
            >
              <LayoutGrid size={14} />
              <span>Grid</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.5rem',
          marginBottom: '0.85rem'
        }}>
          {/* Platform Filter */}
          <div>
            <select 
              value={selectedPlatform} 
              onChange={(e) => { setSelectedPlatform(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ fontSize: '0.8rem' }}
            >
              <option value="all">All Platforms</option>
              <option value="codeforces">Codeforces</option>
              <option value="leetcode">LeetCode</option>
              <option value="atcoder">AtCoder</option>
              <option value="codechef">CodeChef</option>
              <option value="gfg">GeeksforGeeks</option>
              <option value="hackerrank">HackerRank</option>
            </select>
          </div>

          {/* Verdict Filter */}
          <div>
            <select 
              value={selectedVerdict} 
              onChange={(e) => { setSelectedVerdict(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ fontSize: '0.8rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="solved">Solved Only</option>
              <option value="attempted">Attempted Only</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ fontSize: '0.8rem' }}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Concept Filter */}
          <div>
            <select 
              value={selectedConcept} 
              onChange={(e) => { setSelectedConcept(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ fontSize: '0.8rem' }}
            >
              <option value="all">All Topics</option>
              {concepts.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select 
              value={sortBy} 
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ fontSize: '0.8rem' }}
            >
              <option value="newest">Newest Solved</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Bookmarks & Active filters */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Bookmarked Filter Pill */}
            <button
              onClick={() => { setOnlyBookmarked(!onlyBookmarked); setCurrentPage(1); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: onlyBookmarked ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-main)',
                color: onlyBookmarked ? 'var(--accent-green-bright)' : 'var(--text-muted)',
                border: onlyBookmarked ? '1px solid var(--accent-green)' : '1px solid var(--border-subtle)'
              }}
            >
              {onlyBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              <span>Bookmarks ({Object.values(bookmarks).filter(Boolean).length})</span>
            </button>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Showing {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''} (Page {currentPage} of {totalPages})
            </span>
          </div>

          {/* Reset Filters button */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
            style={{ fontSize: '0.72rem' }}
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="glass-card" style={{ overflowX: 'auto', padding: '0.5rem', background: 'var(--bg-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                <th style={{ padding: '0.65rem 0.85rem' }}>Platform</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Problem Title</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Difficulty / Rating</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Topics</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Status</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Date</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProblems.map(p => {
                const isBookmarked = !!bookmarks[p.id];
                const hasNotes = !!notes[p.id];

                return (
                  <tr 
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Platform */}
                    <td style={{ padding: '0.55rem 0.85rem' }}>
                      <span className={`badge tag-${p.platformKey}`} style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <PlatformIcon platformKey={p.platformKey} size={14} />
                        <span>{p.platformKey?.toUpperCase()}</span>
                      </span>
                    </td>

                    {/* Title & Link */}
                    <td style={{ padding: '0.55rem 0.85rem', maxWidth: '340px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <a 
                          href={p.url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{
                            color: 'var(--text-main)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={p.title}
                        >
                          {p.title}
                        </a>
                        <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', flexShrink: 0 }}>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>

                    {/* Difficulty / Rating */}
                    <td style={{ padding: '0.55rem 0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className={`badge badge-${p.difficulty.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>
                          {p.difficulty}
                        </span>
                        {p.rating && (
                          <span className="badge badge-rating" style={{ fontSize: '0.68rem' }}>
                            {p.rating}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Concepts */}
                    <td style={{ padding: '0.55rem 0.85rem', maxWidth: '240px' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {(p.concepts || []).slice(0, 3).map((c, i) => (
                          <span 
                            key={i} 
                            className="concept-pill" 
                            style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}
                            onClick={() => setSelectedConcept(c)}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Verdict */}
                    <td style={{ padding: '0.55rem 0.85rem' }}>
                      <span className={`badge ${p.verdict === 'Solved' ? 'badge-solved' : 'badge-attempted'}`} style={{ fontSize: '0.68rem' }}>
                        {p.verdict === 'Solved' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        <span>{p.verdict}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '0.55rem 0.85rem', color: 'var(--text-dim)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {p.timeFormatted || (p.timeSeconds ? new Date(p.timeSeconds * 1000).toLocaleDateString() : '---')}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.55rem 0.85rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={() => onToggleBookmark(p.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: isBookmarked ? '#fbbf24' : 'var(--text-dim)',
                            padding: '0.2rem'
                          }}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                        >
                          {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>

                        <button
                          onClick={() => onOpenNotesModal(p)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: hasNotes ? 'var(--accent-green-bright)' : 'var(--text-dim)',
                            padding: '0.2rem'
                          }}
                          title={hasNotes ? 'View/Edit Note' : 'Add Note'}
                        >
                          <FileEdit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedProblems.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No problems found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid Cards View */}
      {viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.85rem'
        }}>
          {paginatedProblems.map(p => {
            const isBookmarked = !!bookmarks[p.id];
            const hasNotes = !!notes[p.id];

            return (
              <div 
                key={p.id}
                className="glass-card"
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  background: 'var(--bg-secondary)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className={`badge tag-${p.platformKey}`} style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <PlatformIcon platformKey={p.platformKey} size={14} />
                      <span>{p.platformKey?.toUpperCase()}</span>
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className={`badge badge-${p.difficulty.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>
                        {p.difficulty}
                      </span>
                      {p.rating && (
                        <span className="badge badge-rating" style={{ fontSize: '0.68rem' }}>
                          {p.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35 }}>
                    <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                      {p.title}
                    </a>
                  </h3>

                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {(p.concepts || []).slice(0, 4).map((c, i) => (
                      <span key={i} className="concept-pill" style={{ fontSize: '0.68rem' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.6rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <span className={`badge ${p.verdict === 'Solved' ? 'badge-solved' : 'badge-attempted'}`} style={{ fontSize: '0.68rem' }}>
                    {p.verdict}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => onToggleBookmark(p.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: isBookmarked ? '#fbbf24' : 'var(--text-dim)'
                      }}
                    >
                      {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>

                    <button
                      onClick={() => onOpenNotesModal(p)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: hasNotes ? 'var(--accent-green-bright)' : 'var(--text-dim)'
                      }}
                    >
                      <FileEdit size={16} />
                    </button>

                    <a 
                      href={p.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '1rem 0'
        }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0 0.5rem' }}>
            Page <strong style={{ color: 'var(--text-main)' }}>{currentPage}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong>
          </span>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

    </div>
  );
}
