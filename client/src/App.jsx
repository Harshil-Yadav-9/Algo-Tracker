import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiUrl } from './services/api';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProblemTracker from './components/ProblemTracker';
import ContestsHub from './components/ContestsHub';
import POTDHub from './components/POTDHub';
import AnalyticsView from './components/AnalyticsView';
import AdminPanel from './components/AdminPanel';
import HandleModal from './components/HandleModal';
import AuthModal from './components/AuthModal';
import ProblemNotesModal from './components/ProblemNotesModal';
import LiveNotificationToast from './components/LiveNotificationToast';
import WelcomeLanding from './components/WelcomeLanding';
import HandleVerificationPage from './components/HandleVerificationPage';
import AccountPage from './components/AccountPage';
import { Shield, RotateCcw, AlertTriangle, Code2 } from 'lucide-react';

export default function App() {
  // Navigation state (supports hash routing)
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validTabs = ['dashboard', 'problems', 'contests', 'potd', 'analytics', 'verify', 'account', 'signin', 'admin'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [activeNotesProblem, setActiveNotesProblem] = useState(null);
  const [selectedConceptFilter, setSelectedConceptFilter] = useState('all');

  // Real-time newly solved questions notification state
  const [newlySolvedList, setNewlySolvedList] = useState([]);

  // Auth token stored for session recovery
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('algopulse_token') || sessionStorage.getItem('algopulse_token') || '';
    } catch {
      return '';
    }
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(Boolean(token));
  const isAdmin = currentUser?.role === 'admin';

  // Handles
  const [handles, setHandles] = useState({
    codeforces: '',
    leetcode: '',
    atcoder: '',
    codechef: '',
    gfg: '',
    hackerrank: ''
  });

  // User notes & bookmarks
  const [notes, setNotes] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [potdCompletions, setPotdCompletions] = useState({});

  // Synced backend data
  const [syncData, setSyncData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSyncedTime, setLastSyncedTime] = useState(null);

  // Contests & POTD live lists
  const [contests, setContests] = useState([]);
  const [potdList, setPotdList] = useState([]);

  // Admin Explorer Target State
  const [explorerTarget, setExplorerTarget] = useState(null);

  // Set active tab & sync URL hash
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    window.location.hash = tab;
  };

  // Listen to hash changes (browser back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validTabs = ['dashboard', 'problems', 'contests', 'potd', 'analytics', 'verify', 'account', 'signin', 'admin'];
      if (validTabs.includes(hash)) {
        setActiveTabState(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isSyncingRef = useRef(false);
  isSyncingRef.current = isSyncing;

  // 1. Authenticate user on mount via stored JWT session token
  useEffect(() => {
    if (token) {
      fetchCurrentProfile(token);
    } else {
      setIsAuthChecking(false);
    }
  }, [token]);

  const fetchCurrentProfile = async (authToken) => {
    setIsAuthChecking(true);
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }).then(r => r.json());

      if (res.success && res.user) {
        setCurrentUser(res.user);
        
        if (res.user.handles) {
          setHandles(res.user.handles);
        }
        if (res.user.bookmarks) setBookmarks(res.user.bookmarks);
        if (res.user.notes) setNotes(res.user.notes);
        if (res.user.potdCompletions) setPotdCompletions(res.user.potdCompletions);

        // Pre-hydrate problem list
        if (res.savedProblems && Array.isArray(res.savedProblems) && res.savedProblems.length > 0) {
          setSyncData(prev => ({
            ...(prev || {}),
            success: true,
            problems: res.savedProblems,
            summary: res.user.lastSyncStats || {
              totalSolved: res.savedProblems.filter(p => p.verdict === 'Solved').length,
              totalAttempted: res.savedProblems.filter(p => p.verdict !== 'Solved').length,
              totalSubmissions: res.savedProblems.length,
              easy: res.savedProblems.filter(p => p.difficulty === 'Easy').length,
              medium: res.savedProblems.filter(p => p.difficulty === 'Medium').length,
              hard: res.savedProblems.filter(p => p.difficulty === 'Hard').length,
              connectedPlatformsCount: Object.values(res.user.handles || {}).filter(Boolean).length
            }
          }));
        }

        // Auto-sync for authenticated user on entry
        handleSync(res.user.handles || handles, authToken);
      } else {
        try {
          localStorage.removeItem('algopulse_token');
          sessionStorage.removeItem('algopulse_token');
        } catch {}
        setToken('');
        setCurrentUser(null);
      }
    } catch (err) {
      console.warn('Session verification failed:', err);
    } finally {
      setIsAuthChecking(false);
    }
  };

  // 2. Fetch Contests & POTD on mount
  useEffect(() => {
    fetchContests();
    fetchPOTD();
  }, []);

  // Sync user state (notes/bookmarks/potd) to DB
  const syncUserStateToDB = async (updates) => {
    if (!token) return;
    try {
      await fetch(apiUrl('/api/auth/sync-user-state'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to sync state:', err);
    }
  };

  const fetchContests = async () => {
    try {
      const res = await fetch(apiUrl('/api/contests')).then(r => r.json());
      if (res.success && Array.isArray(res.contests)) {
        setContests(res.contests);
      }
    } catch (err) {
      console.warn('Failed to fetch contests:', err);
    }
  };

  const fetchPOTD = async () => {
    try {
      const res = await fetch(apiUrl('/api/potd')).then(r => r.json());
      const list = res.potdList || res.potd || [];
      if (res.success && Array.isArray(list)) {
        setPotdList(list);
      }
    } catch (err) {
      console.warn('Failed to fetch POTD:', err);
    }
  };

  // 3. Multi-Platform Sync Handler
  const handleSync = useCallback(async (handlesToSync = handles, authToken = token) => {
    const activeHandles = Object.fromEntries(
      Object.entries(handlesToSync).filter(([_, h]) => Boolean(h && h.trim()))
    );

    if (Object.keys(activeHandles).length === 0) {
      setIsSyncing(false);
      return;
    }

    if (isSyncingRef.current) return;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const response = await fetch(apiUrl('/api/sync'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ handles: activeHandles })
      }).then(r => r.json());

      if (response.success) {
        // Detect newly solved problems
        if (syncData?.problems && response.problems) {
          const oldSolvedIds = new Set(
            syncData.problems.filter(p => p.verdict === 'Solved').map(p => p.id)
          );
          const newSolves = response.problems.filter(
            p => p.verdict === 'Solved' && !oldSolvedIds.has(p.id)
          );
          if (newSolves.length > 0) {
            setNewlySolvedList(newSolves);
          }
        }

        setSyncData(response);
        setLastSyncedTime(new Date());
      } else {
        setSyncError(response.error || 'Failed to synchronize solves.');
      }
    } catch (err) {
      setSyncError('Network error connecting to backend sync service.');
    } finally {
      setIsSyncing(false);
    }
  }, [handles, token, syncData]);

  // Window Focus / Visibility change auto-sync daemon
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentUser && !isSyncingRef.current) {
        const lastSyncAgeMs = lastSyncedTime ? Date.now() - lastSyncedTime.getTime() : Infinity;
        if (lastSyncAgeMs > 45000) {
          handleSync(handles, token);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, handles, token, lastSyncedTime, handleSync]);

  // Handle Save (Updating bound handles)
  const handleSaveHandles = async (newHandles) => {
    setHandles(newHandles);

    if (currentUser && token) {
      try {
        const res = await fetch(apiUrl('/api/auth/update-handles'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ handles: newHandles })
        }).then(r => r.json());

        if (res.success) {
          setCurrentUser(res.user);
        } else {
          alert(res.error || 'Could not update handles.');
        }
      } catch (err) {
        console.error('Failed to update handles:', err);
      }
    }

    handleSync(newHandles, token);
  };

  // Bookmarking problem
  const handleToggleBookmark = (problemId) => {
    const updated = { ...bookmarks, [problemId]: !bookmarks[problemId] };
    if (!updated[problemId]) delete updated[problemId];
    setBookmarks(updated);
    syncUserStateToDB({ bookmarks: updated });
  };

  // Notes & Revision state
  const handleSaveNote = (problemId, noteData) => {
    const updated = { ...notes, [problemId]: noteData };
    setNotes(updated);
    syncUserStateToDB({ notes: updated });
  };

  // POTD completion toggle
  const handleTogglePOTD = (potdKey) => {
    const updated = { ...potdCompletions, [potdKey]: !potdCompletions[potdKey] };
    if (!updated[potdKey]) delete updated[potdKey];
    setPotdCompletions(updated);
    syncUserStateToDB({ potdCompletions: updated });
  };

  // Auth handlers
  const handleOpenAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user, authToken, savedProblems) => {
    setCurrentUser(user);
    setToken(authToken);
    if (user.handles) setHandles(user.handles);
    if (user.bookmarks) setBookmarks(user.bookmarks);
    if (user.notes) setNotes(user.notes);
    if (user.potdCompletions) setPotdCompletions(user.potdCompletions);

    if (savedProblems && savedProblems.length > 0) {
      setSyncData(prev => ({
        ...(prev || {}),
        success: true,
        problems: savedProblems,
        summary: user.lastSyncStats || prev?.summary
      }));
    }

    setActiveTab('dashboard');
    handleSync(user.handles || handles, authToken);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('algopulse_token');
      sessionStorage.removeItem('algopulse_token');
    } catch {}
    setToken('');
    setCurrentUser(null);
    setSyncData(null);
    setExplorerTarget(null);
    setActiveTab('dashboard');
  };

  // Concept navigation shortcut
  const handleNavigateConcept = (conceptName) => {
    setSelectedConceptFilter(conceptName);
    setActiveTab('problems');
  };

  // Admin inspect user
  const handleInspectUser = (user) => {
    setExplorerTarget({
      name: user.username || user.name || user.email,
      handles: user.handles || {},
      description: `Inspecting @${user.username || user.email}`
    });
    handleSync(user.handles || {}, token);
    setActiveTab('dashboard');
  };

  const handleSyncCustomHandles = (customHandles, targetInfo) => {
    setExplorerTarget(targetInfo);
    handleSync(customHandles, token);
    setActiveTab('dashboard');
  };

  const handleReturnToMyAccount = () => {
    setExplorerTarget(null);
    if (currentUser?.handles) {
      handleSync(currentUser.handles, token);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Real-time celebration toast for newly solved questions */}
      <LiveNotificationToast 
        newlySolvedList={newlySolvedList}
        onDismiss={() => setNewlySolvedList([])}
      />

      {/* Global Navigation Header */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handles={handles}
        onOpenHandleModal={() => setIsHandleModalOpen(true)}
        onSync={() => handleSync(handles)}
        isSyncing={isSyncing}
        summary={syncData?.summary}
        contestsCount={contests.length}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal('login')}
        onLogout={handleLogout}
        lastSyncedTime={lastSyncedTime}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flexGrow: 1, paddingBottom: '2rem' }}>
        
        {/* Unauthenticated Home / Barrier if on dashboard with no user */}
        {!currentUser && !isAuthChecking && activeTab === 'dashboard' && (
          <WelcomeLanding 
            onOpenAuthModal={() => handleOpenAuthModal('login')} 
            onNavigateToTab={setActiveTab}
          />
        )}

        {/* Tab 1: Dashboard (When Authenticated) */}
        {currentUser && activeTab === 'dashboard' && (
          <>
            {/* Admin Explorer Banner */}
            {explorerTarget && (
              <div className="glass-card" style={{
                padding: '0.75rem 1rem',
                borderLeft: '4px solid var(--accent-green-bright)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={16} color="var(--accent-green-bright)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Inspecting: {explorerTarget.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {explorerTarget.description}
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleReturnToMyAccount}
                >
                  <RotateCcw size={12} />
                  <span>Return to My Account</span>
                </button>
              </div>
            )}

            {/* Sync error banner */}
            {syncError && (
              <div className="glass-card" style={{
                padding: '0.75rem 1rem',
                border: '1px solid #ef4444',
                background: 'rgba(239, 68, 68, 0.08)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#f87171',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={15} />
                  <span>{syncError}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => handleSync(handles)} style={{ fontSize: '0.72rem' }}>
                  Retry Sync
                </button>
              </div>
            )}

            <Dashboard 
              syncData={syncData}
              potdList={potdList}
              contests={contests}
              onNavigateToTab={setActiveTab}
              onSelectConcept={handleNavigateConcept}
              onOpenHandleModal={() => setIsHandleModalOpen(true)}
            />
          </>
        )}

        {/* Tab 2: Problem Tracker */}
        {activeTab === 'problems' && (
          <ProblemTracker 
            problems={syncData?.problems || []}
            concepts={syncData?.concepts || []}
            bookmarks={bookmarks}
            notes={notes}
            onToggleBookmark={handleToggleBookmark}
            onOpenNotesModal={(prob) => setActiveNotesProblem(prob)}
            selectedConceptFilter={selectedConceptFilter}
            onClearConceptFilter={() => setSelectedConceptFilter('all')}
          />
        )}

        {/* Tab 3: Upcoming Contests */}
        {activeTab === 'contests' && (
          <ContestsHub 
            contests={contests}
          />
        )}

        {/* Tab 4: POTD Hub */}
        {activeTab === 'potd' && (
          <POTDHub 
            potdList={potdList}
            potdCompletions={potdCompletions}
            onTogglePOTDComplete={handleTogglePOTD}
          />
        )}

        {/* Tab 5: Analytics & Skillset */}
        {activeTab === 'analytics' && (
          <AnalyticsView 
            syncData={syncData}
            onSelectConcept={handleNavigateConcept}
          />
        )}

        {/* Tab 6: Handle Verification Page (Dedicated Route) */}
        {activeTab === 'verify' && (
          <HandleVerificationPage 
            currentHandles={handles}
            currentUser={currentUser}
            onSaveHandles={handleSaveHandles}
            onOpenAuthModal={() => handleOpenAuthModal('login')}
          />
        )}

        {/* Tab 7: Dedicated Sign In / Account Profile Page */}
        {(activeTab === 'signin' || activeTab === 'account') && (
          <AccountPage 
            currentUser={currentUser}
            onLogout={handleLogout}
            onAuthSuccess={handleAuthSuccess}
            onNavigateToTab={setActiveTab}
            handles={handles}
            summary={syncData?.summary}
          />
        )}

        {/* Tab 8: Admin Console (Superuser only) */}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel 
            token={token}
            onInspectUser={handleInspectUser}
            onSyncCustomHandles={handleSyncCustomHandles}
          />
        )}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1rem 0',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
        marginTop: 'auto',
        background: 'var(--bg-secondary)'
      }}>
        <div className="app-container" style={{ paddingBottom: 0 }}>
          <p>AlgoTracker • Multi-Platform Competitive Programming Tracker</p>
        </div>
      </footer>

      {/* Modal 1: Platform Handles Config */}
      <HandleModal 
        isOpen={isHandleModalOpen}
        onClose={() => setIsHandleModalOpen(false)}
        currentHandles={handles}
        onSaveHandles={handleSaveHandles}
        currentUser={currentUser}
      />

      {/* Modal 2: Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Modal 3: Problem Notes Modal */}
      <ProblemNotesModal 
        problem={activeNotesProblem}
        isOpen={Boolean(activeNotesProblem)}
        onClose={() => setActiveNotesProblem(null)}
        initialNote={activeNotesProblem ? notes[activeNotesProblem.id] : {}}
        isBookmarked={activeNotesProblem ? !!bookmarks[activeNotesProblem.id] : false}
        onSaveNote={handleSaveNote}
        onToggleBookmark={handleToggleBookmark}
      />

    </div>
  );
}
