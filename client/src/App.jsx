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
import { Shield, RotateCcw, AlertTriangle, Terminal } from 'lucide-react';

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [activeNotesProblem, setActiveNotesProblem] = useState(null);
  const [selectedConceptFilter, setSelectedConceptFilter] = useState('all');

  // Real-time newly solved questions notification state
  const [newlySolvedList, setNewlySolvedList] = useState([]);

  // Auth token stored only for session recovery
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

  // Handles (strictly loaded from authenticated MongoDB user profile)
  const [handles, setHandles] = useState({
    codeforces: '',
    leetcode: '',
    atcoder: '',
    codechef: '',
    gfg: '',
    hackerrank: ''
  });

  // User notes & bookmarks (strictly synced with MongoDB)
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

  // Admin Explorer Target State (for inspecting any handle in DB or not in DB)
  const [explorerTarget, setExplorerTarget] = useState(null);

  // Ref to prevent duplicate sync collisions
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
        
        // Populate state exclusively from MongoDB user profile
        if (res.user.handles) {
          setHandles(res.user.handles);
        }
        if (res.user.bookmarks) setBookmarks(res.user.bookmarks);
        if (res.user.notes) setNotes(res.user.notes);
        if (res.user.potdCompletions) setPotdCompletions(res.user.potdCompletions);

        // Pre-hydrate problem list from MongoDB saved problems if available
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
        // Expired or invalid token
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

  // Sync user state (notes/bookmarks/potd) directly to MongoDB
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
      console.warn('MongoDB sync error:', err.message);
    }
  };

  // Fetch Contests from Express API
  const fetchContests = async () => {
    try {
      const res = await fetch(apiUrl('/api/contests')).then(r => r.json());
      if (res.success && Array.isArray(res.contests)) {
        setContests(res.contests);
      }
    } catch (err) {
      console.warn('Error fetching contests:', err);
    }
  };

  // Fetch POTD from Express API
  const fetchPOTD = async () => {
    try {
      const res = await fetch(apiUrl('/api/potd')).then(r => r.json());
      if (res.success && Array.isArray(res.potdList)) {
        setPotdList(res.potdList);
      }
    } catch (err) {
      console.warn('Error fetching POTD:', err);
    }
  };

  // Trigger Live Sync with Backend (with real-time newly solved questions diffing)
  const handleSync = useCallback(async (handlesToSync = handles, customToken = token, isBackground = false, isExplorer = Boolean(explorerTarget)) => {
    if (isSyncingRef.current) return;

    if (!isBackground) setIsSyncing(true);
    setSyncError(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      const activeToken = customToken || token;
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const response = await fetch(apiUrl('/api/sync'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ handles: handlesToSync, isExplorer })
      }).then(r => r.json());

      if (response.success) {
        setSyncData(response);
        setLastSyncedTime(new Date());

        // Check for newly solved questions in real-time
        if (response.newlySolved && response.newlySolved.length > 0) {
          setNewlySolvedList(response.newlySolved);
        }
      } else {
        if (!isBackground) {
          setSyncError(response.error || 'Failed to sync platform handles');
        }
      }
    } catch (err) {
      console.error('Sync failed:', err);
      if (!isBackground) {
        setSyncError('Could not connect to backend server. Make sure server is running.');
      }
    } finally {
      if (!isBackground) setIsSyncing(false);
    }
  }, [handles, token, explorerTarget]);

  // 3. REAL-TIME TAB FOCUS & VISIBILITY CHANGE AUTO-SYNC LISTENER
  useEffect(() => {
    if (!currentUser) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleSync(handles, token, true, Boolean(explorerTarget));
      }
    };

    const handleWindowFocus = () => {
      handleSync(handles, token, true, Boolean(explorerTarget));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // 4. Active background heartbeat (syncs every 35s while user has tab open)
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleSync(handles, token, true, Boolean(explorerTarget));
      }
    }, 35000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(heartbeatInterval);
    };
  }, [handleSync, handles, token, currentUser, explorerTarget]);

  // Auth Success Handler
  const handleAuthSuccess = (user, authToken, initialSavedProblems = []) => {
    setCurrentUser(user);
    setToken(authToken);
    setExplorerTarget(null);
    if (user.handles) {
      setHandles(user.handles);
    }
    if (user.bookmarks) setBookmarks(user.bookmarks);
    if (user.notes) setNotes(user.notes);
    if (user.potdCompletions) setPotdCompletions(user.potdCompletions);

    if (initialSavedProblems && initialSavedProblems.length > 0) {
      setSyncData(prev => ({
        ...(prev || {}),
        success: true,
        problems: initialSavedProblems
      }));
    }

    handleSync(user.handles || handles, authToken);
  };

  // Logout Handler (Clears all in-memory user data & session)
  const handleLogout = () => {
    try {
      localStorage.removeItem('algopulse_token');
      sessionStorage.removeItem('algopulse_token');
    } catch {}
    setToken('');
    setCurrentUser(null);
    setSyncData(null);
    setExplorerTarget(null);
    setNotes({});
    setBookmarks({});
    setPotdCompletions({});
    setHandles({ codeforces: '', leetcode: '', atcoder: '', codechef: '', gfg: '', hackerrank: '' });
    setActiveTab('dashboard');
  };

  const handleOpenAuthModal = (initialTab = 'user') => {
    setAuthModalTab(initialTab);
    setIsAuthModalOpen(true);
  };

  // Save new handles from modal
  const handleSaveHandles = (newHandles) => {
    setHandles(newHandles);
    setExplorerTarget(null);
    handleSync(newHandles, token, false, false);
  };

  // Admin: Inspect specific registered user
  const handleInspectUser = (userToInspect) => {
    if (userToInspect.handles) {
      setExplorerTarget({
        isExplorer: true,
        name: `@${userToInspect.username} (${userToInspect.email || 'Registered User'})`,
        inDb: true,
        description: `Inspecting registered MongoDB user profile (@${userToInspect.username})`,
        handles: userToInspect.handles
      });
      setHandles(userToInspect.handles);
      handleSync(userToInspect.handles, token, false, true);
      setActiveTab('dashboard');
    }
  };

  // Admin: Universal Explorer on-the-fly sync (checks ANY handle in or out of DB)
  const handleSyncCustomHandles = (customHandles, targetInfo) => {
    setExplorerTarget({
      isExplorer: true,
      name: targetInfo?.name || 'Custom Handles',
      inDb: Boolean(targetInfo?.inDb),
      description: targetInfo?.description || 'Inspecting arbitrary CP handles live',
      handles: customHandles
    });
    setHandles(customHandles);
    handleSync(customHandles, token, false, true);
    setActiveTab('dashboard');
  };

  // Return from Explorer Mode back to Admin's own account
  const handleReturnToMyAccount = () => {
    setExplorerTarget(null);
    const myHandles = currentUser?.handles || { codeforces: '', leetcode: '', atcoder: '', codechef: '', gfg: '', hackerrank: '' };
    setHandles(myHandles);
    handleSync(myHandles, token, false, false);
  };

  // Toggle Bookmark (Synced directly to MongoDB)
  const handleToggleBookmark = (problemId) => {
    setBookmarks(prev => {
      const updated = { ...prev, [problemId]: !prev[problemId] };
      if (!updated[problemId]) delete updated[problemId];
      syncUserStateToDB({ bookmarks: updated });
      return updated;
    });
  };

  // Save Problem Note (Synced directly to MongoDB)
  const handleSaveNote = (problemId, noteData) => {
    setNotes(prev => {
      const updated = { ...prev, [problemId]: noteData };
      syncUserStateToDB({ notes: updated });
      return updated;
    });
  };

  // Toggle POTD completion (Synced directly to MongoDB)
  const handleTogglePOTD = (key) => {
    setPotdCompletions(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      if (!updated[key]) delete updated[key];
      syncUserStateToDB({ potdCompletions: updated });
      return updated;
    });
  };

  // Navigation helper from dashboard cards
  const handleNavigateConcept = (conceptName) => {
    setSelectedConceptFilter(conceptName);
    setActiveTab('problems');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Real-time Toast Alert when user solves a new problem in another tab */}
      <LiveNotificationToast 
        newProblems={newlySolvedList}
        onClose={() => setNewlySolvedList([])}
      />

      {/* Top Sticky Navigation */}
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
        
        {/* If user is NOT authenticated, show Welcome / Sign In Portal Barrier */}
        {!currentUser && !isAuthChecking && (
          <WelcomeLanding onOpenAuthModal={handleOpenAuthModal} />
        )}

        {/* If user is authenticated, render active dashboard tabs */}
        {currentUser && (
          <>
            {/* Superuser Admin Explorer Active Banner */}
            {explorerTarget && (
              <div className="glass-card" style={{
                padding: '0.6rem 0.85rem',
                borderLeft: '4px solid var(--accent-green-bright)',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    padding: '0.2rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-green-dark)',
                    border: '1px solid var(--accent-green)',
                    color: 'var(--accent-green-bright)',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Shield size={12} />
                    <span>EXPLORER_MODE</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      [INSPECTING]: {explorerTarget.name || 'Custom Handles'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {explorerTarget.description || (explorerTarget.inDb ? 'Inspecting registered user data' : 'External handles (live platform fetch, DB untouched)')}
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleReturnToMyAccount}
                  style={{ fontSize: '0.72rem', fontWeight: 600 }}
                >
                  <RotateCcw size={12} />
                  <span>RETURN_TO_ROOT</span>
                </button>
              </div>
            )}

            {/* Sync error banner if any */}
            {syncError && (
              <div className="glass-card" style={{
                padding: '0.6rem 0.85rem',
                background: 'var(--bg-dark)',
                border: '1px solid var(--verdict-wrong)',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--verdict-wrong)',
                fontSize: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertTriangle size={14} />
                  <span>[SYNC_WARNING]: {syncError}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => handleSync(handles)} style={{ fontSize: '0.7rem' }}>
                  RETRY_SYNC
                </button>
              </div>
            )}

            {/* Tab 1: Dashboard */}
            {activeTab === 'dashboard' && (
              <Dashboard 
                syncData={syncData}
                potdList={potdList}
                contests={contests}
                onNavigateToTab={setActiveTab}
                onSelectConcept={handleNavigateConcept}
                onOpenHandleModal={() => setIsHandleModalOpen(true)}
              />
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

            {/* Tab 6: Admin Console (Superuser only) */}
            {activeTab === 'admin' && isAdmin && (
              <AdminPanel 
                token={token}
                onInspectUser={handleInspectUser}
                onSyncCustomHandles={handleSyncCustomHandles}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '0.65rem 0',
        textAlign: 'center',
        fontSize: '0.72rem',
        color: 'var(--text-dim)',
        marginTop: 'auto',
        background: 'var(--bg-dark)'
      }}>
        <div className="app-container" style={{ paddingBottom: 0 }}>
          <p>// algo::tracker • competitive programming live aggregator • real-time matrix sync engine</p>
        </div>
      </footer>

      {/* Modal 1: Platform Handles Config / Universal Switcher */}
      <HandleModal 
        isOpen={isHandleModalOpen}
        onClose={() => setIsHandleModalOpen(false)}
        currentHandles={handles}
        onSaveHandles={handleSaveHandles}
        currentUser={currentUser}
      />

      {/* Modal 2: Auth Modal (Google OAuth) */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Modal 3: Problem Notes & Revision Modal */}
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
