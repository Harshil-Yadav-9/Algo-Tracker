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
  Terminal,
  RotateCcw
} from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      
      {/* Header with Title & Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} color="#22c55e" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' }}>
            PROBLEM_EXPLORER
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#4ade80aa' }}>
            [{filteredProblems.length} records]
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button 
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <LayoutList size={13} />
            <span>table</span>
          </button>
          <button 
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('grid')}
            title="Card Grid View"
          >
            <LayoutGrid size={13} />
            <span>grid</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-card" style={{ padding: '0.75rem 1rem', background: '#090e09' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.5rem',
          marginBottom: '0.6rem'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={14} color="#3b5a3b" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="grep query (title, ID, concept)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ paddingLeft: '2rem', fontSize: '0.78rem' }}
            />
          </div>

          {/* Platform Filter */}
          <div>
            <select 
              value={selectedPlatform} 
              onChange={(e) => { setSelectedPlatform(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ fontSize: '0.78rem' }}
            >
              <option value="all">platform: all</option>
              <option value="codeforces">platform: codeforces</option>
              <option value="leetcode">platform: leetcode</option>
              <option value="atcoder">platform: atcoder</option>
              <option value="codechef">platform: codechef</option>
              <option value="gfg">platform: gfg</option>
              <option value="hackerrank">platform: hackerrank</option>
            </select>
          </div>

          {/* Verdict Filter */}
          <div>
            <select 
              value={selectedVerdict} 
              onChange={(e) => { setSelectedVerdict(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ fontSize: '0.78rem' }}
            >
              <option value="all">verdict: all</option>
              <option value="solved">verdict: solved</option>
              <option value="attempted">verdict: attempted</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ fontSize: '0.78rem' }}
            >
              <option value="all">difficulty: all</option>
              <option value="easy">diff: easy</option>
              <option value="medium">diff: medium</option>
              <option value="hard">diff: hard</option>
            </select>
          </div>

          {/* Concept Filter */}
          <div>
            <select 
              value={selectedConcept} 
              onChange={(e) => { setSelectedConcept(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ fontSize: '0.78rem' }}
            >
              <option value="all">concept: all</option>
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
              style={{ fontSize: '0.78rem' }}
            >
              <option value="newest">sort: newest</option>
              <option value="oldest">sort: oldest</option>
              <option value="rating-desc">sort: rating_desc</option>
              <option value="rating-asc">sort: rating_asc</option>
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
          paddingTop: '0.5rem',
          borderTop: '1px solid #142214'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Bookmarked Filter Pill */}
            <button
              onClick={() => { setOnlyBookmarked(!onlyBookmarked); setCurrentPage(1); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: onlyBookmarked ? '#14532d' : '#0a100a',
                color: onlyBookmarked ? '#4ade80' : '#86efac99',
                border: onlyBookmarked ? '1px solid #22c55e' : '1px solid #192a19',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {onlyBookmarked ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
              <span>bookmarks ({Object.values(bookmarks).filter(Boolean).length})</span>
            </button>

            <span style={{ fontSize: '0.72rem', color: '#4ade80aa' }}>
              page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Reset Filters button */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
            style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
          >
            <RotateCcw size={11} />
            <span>reset_filters</span>
          </button>
        </div>
      </div>

      {/* Table View (Dense Terminal Table) */}
      {viewMode === 'table' && (
        <div className="glass-card" style={{ overflowX: 'auto', padding: '0.25rem', background: '#090e09' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #192a19', color: '#86efac', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>Platform</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Problem Title</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Diff / Rating</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Concepts</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Verdict</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Date</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Actions</th>
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
                      borderBottom: '1px solid #101910',
                      transition: 'background 0.1s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#0d160d'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Platform */}
                    <td style={{ padding: '0.45rem 0.75rem' }}>
                      <span className={`badge tag-${p.platformKey}`} style={{ fontSize: '0.65rem' }}>
                        {p.platformKey?.toUpperCase()}
                      </span>
                    </td>

                    {/* Title & Link */}
                    <td style={{ padding: '0.45rem 0.75rem', maxWidth: '320px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <a 
                          href={p.url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{
                            color: '#f0fdf4',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={p.title}
                        >
                          <span>{p.title}</span>
                          <ExternalLink size={11} color="#22c55e" />
                        </a>
                      </div>
                      {p.problemId && (
                        <span style={{ fontSize: '0.65rem', color: '#4ade80aa' }}>
                          #{p.problemId}
                        </span>
                      )}
                    </td>

                    {/* Difficulty / Rating */}
                    <td style={{ padding: '0.45rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span className={`badge badge-${p.difficulty.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                          {p.difficulty}
                        </span>
                        {p.rating && (
                          <span className="badge badge-rating" style={{ fontSize: '0.65rem' }}>
                            {p.rating}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Concepts */}
                    <td style={{ padding: '0.45rem 0.75rem', maxWidth: '240px' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {p.concepts?.slice(0, 3).map((c, i) => (
                          <span key={i} className="concept-pill" style={{ fontSize: '0.65rem' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Verdict */}
                    <td style={{ padding: '0.45rem 0.75rem' }}>
                      <span 
                        className={`badge badge-${p.verdict.toLowerCase()}`} 
                        style={{ fontSize: '0.65rem' }}
                      >
                        {p.verdict === 'Solved' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        <span>{p.verdict}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '0.45rem 0.75rem', color: '#4ade80aa', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                      {p.date ? new Date(p.date).toLocaleDateString() : 'recent'}
                    </td>

                    {/* Actions: Bookmark & Notes */}
                    <td style={{ padding: '0.45rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        <button
                          onClick={() => onToggleBookmark(p.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: isBookmarked ? '#fde047' : '#274227',
                            padding: '0.2rem'
                          }}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                        >
                          {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                        </button>
                        <button
                          onClick={() => onOpenNotesModal(p)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: hasNotes ? '#4ade80' : '#274227',
                            padding: '0.2rem'
                          }}
                          title={hasNotes ? 'View/Edit Note' : 'Add Note'}
                        >
                          <FileEdit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedProblems.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#4ade80aa' }}>
                    No problems match your query filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Card Grid View */}
      {viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.65rem'
        }}>
          {paginatedProblems.map(p => {
            const isBookmarked = !!bookmarks[p.id];
            const hasNotes = !!notes[p.id];

            return (
              <div 
                key={p.id}
                className="glass-card"
                style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#090e09' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span className={`badge tag-${p.platformKey}`} style={{ fontSize: '0.65rem' }}>
                      {p.platformKey?.toUpperCase()}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span className={`badge badge-${p.difficulty.toLowerCase()}`} style={{ fontSize: '0.62rem' }}>
                        {p.difficulty}
                      </span>
                      {p.rating && (
                        <span className="badge badge-rating" style={{ fontSize: '0.62rem' }}>
                          {p.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: 1.3 }}>
                    <a 
                      href={p.url} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#f0fdf4', textDecoration: 'none' }}
                    >
                      {p.title}
                    </a>
                  </h3>

                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                    {p.concepts?.slice(0, 3).map((c, i) => (
                      <span key={i} className="concept-pill" style={{ fontSize: '0.65rem' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.4rem',
                  borderTop: '1px solid #142214'
                }}>
                  <span className={`badge badge-${p.verdict.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                    {p.verdict}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      onClick={() => onToggleBookmark(p.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isBookmarked ? '#fde047' : '#274227' }}
                    >
                      {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                    </button>
                    <button
                      onClick={() => onOpenNotesModal(p)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: hasNotes ? '#4ade80' : '#274227' }}
                    >
                      <FileEdit size={14} />
                    </button>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }}
                    >
                      <ExternalLink size={10} />
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
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: '#090e09',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #142214'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#4ade80aa' }}>page_size:</span>
            <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setCurrentPage(1); }}
              className="input-field"
              style={{ width: '70px', padding: '0.15rem 0.35rem', fontSize: '0.72rem' }}
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={13} />
              <span>prev</span>
            </button>

            <span style={{ fontSize: '0.75rem', color: '#f0fdf4', padding: '0 0.35rem' }}>
              {currentPage} / {totalPages}
            </span>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span>next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

