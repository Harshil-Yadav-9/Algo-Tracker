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

// Helper: Normalize concept / topic tag names across CP platforms
export function normalizeConcept(tag) {
  if (!tag) return '';
  const t = String(tag).trim();
  const lower = t.toLowerCase();

  if (lower.includes('dynamic programming') || lower === 'dp') return 'Dynamic Programming';
  if (lower.includes('tree') || lower.includes('graph') || lower.includes('dfs') || lower.includes('bfs') || lower.includes('shortest path') || lower.includes('dijkstra')) return 'Graphs & Trees';
  if (lower.includes('binary search')) return 'Binary Search';
  if (lower.includes('greedy')) return 'Greedy';
  if (lower.includes('math') || lower.includes('number theory') || lower.includes('combinatorics') || lower.includes('probabilities') || lower.includes('geometry') || lower.includes('matrix') || lower.includes('matrices')) return 'Math & Number Theory';
  if (lower.includes('data structures') || lower.includes('dsu') || lower.includes('segment tree') || lower.includes('fenwick') || lower.includes('heap') || lower.includes('priority queue') || lower.includes('stack') || lower.includes('queue')) return 'Data Structures';
  if (lower.includes('string') || lower.includes('hashing') || lower.includes('trie')) return 'Strings & Hashing';
  if (lower.includes('bit') || lower.includes('bit manipulation') || lower.includes('bitmasks')) return 'Bit Manipulation';
  if (lower.includes('two pointers') || lower.includes('sliding window')) return 'Two Pointers';
  if (lower.includes('sort') || lower.includes('sortings') || lower.includes('divide and conquer')) return 'Sorting & Searching';
  if (lower.includes('recursion') || lower.includes('backtracking')) return 'Recursion & Backtracking';
  if (lower.includes('implementation') || lower.includes('constructive')) return 'Implementation';
  if (lower.includes('game') || lower.includes('games')) return 'Game Theory';

  return t.charAt(0).toUpperCase() + t.slice(1);
}

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

  // Derive all topics/concepts combining concepts prop and problem list
  const allAvailableTopics = useMemo(() => {
    const map = {};

    // 1. Seed from concepts prop if available
    (concepts || []).forEach(c => {
      const name = typeof c === 'string' ? c : c.name;
      const count = typeof c === 'object' && c.count ? c.count : 0;
      if (name) {
        const norm = normalizeConcept(name) || name;
        map[norm] = Math.max(map[norm] || 0, count);
      }
    });

    // 2. Scan all problems so EVERY topic present in solved problems is included
    (problems || []).forEach(p => {
      (p.concepts || []).forEach(c => {
        const norm = normalizeConcept(c) || c;
        map[norm] = (map[norm] || 0) + 1;
      });
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [concepts, problems]);

  // Filtered and sorted problems
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const rawQ = searchQuery.toLowerCase().trim();

        const rawConcepts = Array.isArray(p.concepts) ? p.concepts : [];
        const normConcepts = rawConcepts.map(c => normalizeConcept(c).toLowerCase());
        const combinedConceptsStr = [...rawConcepts.map(c => c.toLowerCase()), ...normConcepts].join(' ');

        const searchableFullText = [
          (p.title || '').toLowerCase(),
          (p.problemId || '').toLowerCase(),
          (p.platform || '').toLowerCase(),
          (p.platformKey || '').toLowerCase(),
          (p.difficulty || '').toLowerCase(),
          (p.verdict || '').toLowerCase(),
          p.rating ? String(p.rating) : '',
          combinedConceptsStr
        ].join(' ');

        // A. Direct substring match
        let isMatch = searchableFullText.includes(rawQ);

        // B. Normalized query concept match (e.g. "math and number theory" normalizes to "math & number theory")
        if (!isMatch) {
          const qNorm = normalizeConcept(rawQ).toLowerCase();
          if (qNorm && (searchableFullText.includes(qNorm) || normConcepts.some(nc => nc === qNorm || nc.includes(qNorm) || qNorm.includes(nc)))) {
            isMatch = true;
          }
        }

        // C. Multi-token / keyword search
        if (!isMatch) {
          const stopWords = new Set(['and', 'or', 'with', 'in', 'of', 'for', 'the', 'a', 'an', 'like', 'q', 'question', 'questions', 'concept', 'concepts', 'problem', 'problems', 'topic', 'topics', '&']);
          const cleanTokens = rawQ
            .replace(/[,+/&:]/g, ' ')
            .split(/\s+/)
            .map(t => t.trim())
            .filter(t => t.length > 0);

          const filteredTokens = cleanTokens.filter(t => !stopWords.has(t));
          const tokensToMatch = filteredTokens.length > 0 ? filteredTokens : cleanTokens;

          if (tokensToMatch.length > 0) {
            const allTokensMatch = tokensToMatch.every(token => {
              if (searchableFullText.includes(token)) return true;
              if (rawConcepts.some(c => c.toLowerCase().includes(token))) return true;
              if (normConcepts.some(nc => nc.includes(token))) return true;
              return false;
            });
            if (allTokensMatch) isMatch = true;
          }
        }

        if (!isMatch) return false;
      }

      // 2. Platform Filter
      if (selectedPlatform !== 'all') {
        const platTarget = selectedPlatform.toLowerCase();
        const pKey = (p.platformKey || '').toLowerCase();
        const pName = (p.platform || '').toLowerCase();

        const matchPlat = pKey === platTarget || 
                          pName === platTarget ||
                          (platTarget === 'gfg' && (pKey.includes('gfg') || pName.includes('geeks'))) ||
                          (platTarget === 'codeforces' && (pKey.includes('codeforces') || pName.includes('codeforces'))) ||
                          (platTarget === 'leetcode' && (pKey.includes('leetcode') || pName.includes('leetcode')));

        if (!matchPlat) return false;
      }

      // 3. Verdict Filter
      if (selectedVerdict !== 'all') {
        const v = (p.verdict || '').toLowerCase();
        const isSolved = v === 'solved' || v === 'ok' || v === 'accepted' || v === 'ac';
        if (selectedVerdict === 'solved' && !isSolved) return false;
        if (selectedVerdict === 'attempted' && isSolved) return false;
      }

      // 4. Difficulty Filter
      if (selectedDifficulty !== 'all') {
        let diff = (p.difficulty || '').toLowerCase();
        if (!diff && p.rating) {
          if (p.rating < 1200) diff = 'easy';
          else if (p.rating <= 1800) diff = 'medium';
          else diff = 'hard';
        }
        if (!diff) diff = 'medium';

        if (diff !== selectedDifficulty.toLowerCase()) return false;
      }

      // 5. Concept Filter
      if (selectedConcept !== 'all') {
        const selNorm = normalizeConcept(selectedConcept).toLowerCase();
        const selRaw = selectedConcept.toLowerCase().trim();

        const rawConcepts = Array.isArray(p.concepts) ? p.concepts : [];
        const hasConcept = rawConcepts.some(c => {
          if (!c) return false;
          const cRaw = c.toLowerCase().trim();
          const cNorm = normalizeConcept(c).toLowerCase();

          return (
            cRaw === selRaw ||
            cRaw.includes(selRaw) ||
            selRaw.includes(cRaw) ||
            cNorm === selNorm ||
            cNorm.includes(selNorm) ||
            selNorm.includes(cNorm)
          );
        });

        if (!hasConcept) return false;
      }

      // 6. Only Bookmarked
      if (onlyBookmarked) {
        const isBookmarked = !!bookmarks[p.id] || (p._id && !!bookmarks[p._id]) || (p.problemId && !!bookmarks[`${p.platformKey}-${p.problemId}`]);
        if (!isBookmarked) return false;
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
              style={{ fontSize: '0.8rem', fontWeight: 600 }}
              title="Filter by Topic / Concept"
            >
              <option value="all">All Topics ({problems.length})</option>
              {allAvailableTopics.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
              ))}
              {selectedConcept !== 'all' && !allAvailableTopics.some(c => c.name.toLowerCase() === selectedConcept.toLowerCase()) && (
                <option value={selectedConcept}>{selectedConcept}</option>
              )}
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

        {/* Quick Topic Filter Pills Bar */}
        {allAvailableTopics.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            overflowX: 'auto',
            padding: '0.45rem 0',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
              Topics:
            </span>

            <button
              type="button"
              onClick={() => { setSelectedConcept('all'); setCurrentPage(1); }}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: selectedConcept === 'all' ? 'var(--accent-green)' : 'var(--bg-secondary)',
                color: selectedConcept === 'all' ? '#000000' : 'var(--text-muted)',
                border: selectedConcept === 'all' ? '1px solid var(--accent-green)' : '1px solid var(--border-subtle)'
              }}
            >
              All Topics ({problems.length})
            </button>

            {allAvailableTopics.slice(0, 10).map(t => {
              const isSel = selectedConcept.toLowerCase() === t.name.toLowerCase();
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => { 
                    setSelectedConcept(isSel ? 'all' : t.name); 
                    setCurrentPage(1); 
                  }}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: isSel ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: isSel ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-secondary)',
                    color: isSel ? 'var(--accent-green-bright)' : 'var(--text-muted)',
                    border: isSel ? '1px solid var(--accent-green)' : '1px solid var(--border-subtle)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span>{t.name}</span>
                  <span style={{
                    fontSize: '0.62rem',
                    opacity: 0.75,
                    background: 'rgba(0,0,0,0.25)',
                    padding: '0.05rem 0.3rem',
                    borderRadius: '8px'
                  }}>
                    {t.count}
                  </span>
                </button>
              );
            })}

            {selectedConcept !== 'all' && (
              <button
                type="button"
                onClick={() => { setSelectedConcept('all'); setCurrentPage(1); }}
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--accent-red)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.2rem 0.4rem',
                  textDecoration: 'underline',
                  whiteSpace: 'nowrap'
                }}
              >
                Clear Topic
              </button>
            )}
          </div>
        )}

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

            {/* Active Concept Filter indicator pill */}
            {selectedConcept !== 'all' && (
              <span 
                className="concept-pill" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.72rem',
                  borderColor: 'var(--accent-green)',
                  color: 'var(--accent-green-bright)',
                  background: 'rgba(16, 185, 129, 0.1)'
                }}
              >
                <span>Topic: {selectedConcept}</span>
                <button
                  onClick={() => { setSelectedConcept('all'); if (onClearConceptFilter) onClearConceptFilter(); setCurrentPage(1); }}
                  title="Clear topic filter"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '0 0.15rem',
                    fontSize: '0.85rem',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            )}
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
                            style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedConcept(normalizeConcept(c) || c);
                              setCurrentPage(1);
                            }}
                            title={`Filter by ${normalizeConcept(c) || c}`}
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
                      <span 
                        key={i} 
                        className="concept-pill" 
                        style={{ fontSize: '0.68rem', cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedConcept(normalizeConcept(c) || c);
                          setCurrentPage(1);
                        }}
                        title={`Filter by ${normalizeConcept(c) || c}`}
                      >
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
