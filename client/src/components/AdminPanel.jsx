import React, { useState, useEffect } from 'react';
import { apiUrl } from '../services/api';
import { 
  Shield, 
  Users, 
  Database, 
  Search, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  Eye,
  Server,
  Terminal,
  Code2
} from 'lucide-react';

export default function AdminPanel({ token, onInspectUser, onSyncCustomHandles }) {
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Universal Handle Explorer state
  const [explorerHandles, setExplorerHandles] = useState({
    codeforces: 'tourist',
    leetcode: 'neal_wu',
    atcoder: 'tourist',
    codechef: '',
    gfg: '',
    hackerrank: ''
  });
  const [isExploring, setIsExploring] = useState(false);

  // Quick single handle lookup
  const [quickPlatform, setQuickPlatform] = useState('codeforces');
  const [quickHandle, setQuickHandle] = useState('');

  // Fetch admin overview and users
  const fetchAdminOverview = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(apiUrl('/api/admin/status'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(r => r.json());

      if (res.success) {
        setAdminData(res);
      } else {
        setErrorMsg(res.error || 'Failed to load admin overview.');
      }
    } catch (err) {
      setErrorMsg('Error connecting to backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminOverview();
    }
  }, [token]);

  // Check if a handle is currently bound in DB by any registered user
  const getHandleDbOwner = (platform, handle) => {
    if (!handle || !handle.trim() || !adminData?.users) return null;
    const clean = handle.trim().toLowerCase();
    return adminData.users.find(u => {
      const h = u.handles?.[platform];
      return h && h.toLowerCase() === clean;
    });
  };

  // Delete a user
  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`[CONFIRM_DELETE] User "${username}"?`)) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/user/${userId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(r => r.json());

      if (res.success) {
        fetchAdminOverview();
      } else {
        alert(res.error || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Error deleting user.');
    }
  };

  // Run live sync for arbitrary handles (Universal Explorer)
  const handleRunExplorerSync = (e) => {
    if (e) e.preventDefault();
    if (onSyncCustomHandles) {
      setIsExploring(true);
      
      // Check if any handle is in DB
      const inDbOwners = [];
      Object.entries(explorerHandles).forEach(([plat, h]) => {
        const owner = getHandleDbOwner(plat, h);
        if (owner) inDbOwners.push(`${plat}: @${h} (${owner.username})`);
      });

      const targetInfo = {
        name: inDbOwners.length > 0 ? `Explorer (${inDbOwners.join(', ')})` : 'Universal Explorer',
        handles: { ...explorerHandles },
        inDb: inDbOwners.length > 0,
        description: inDbOwners.length > 0 
          ? `Contains handles registered in MongoDB` 
          : `External Handles (Not stored in MongoDB)`
      };

      onSyncCustomHandles(explorerHandles, targetInfo);
      setTimeout(() => setIsExploring(false), 800);
    }
  };

  // Preset quick fill
  const loadPreset = (presetHandles) => {
    setExplorerHandles(prev => ({
      ...prev,
      ...presetHandles
    }));
  };

  // Filter users
  const filteredUsers = (adminData?.users || []).filter(u => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const matchUser = u.username?.toLowerCase().includes(q);
    const matchEmail = u.email?.toLowerCase().includes(q);
    const matchHandles = Object.values(u.handles || {}).some(h => h && h.toLowerCase().includes(q));
    return matchUser || matchEmail || matchHandles;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Admin Banner */}
      <div className="glass-card" style={{
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-green-dark)',
            border: '1px solid var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-green)'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                $ /usr/bin/superadmin --explore --users
              </h2>
              <span className="badge" style={{ background: 'var(--accent-green-dark)', color: 'var(--accent-green-bright)', border: '1px solid var(--accent-green)' }}>
                ROOT_ACCESS
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Universal Handle Explorer (inspect any handle in DB or external) & MongoDB User Directory.
            </p>
          </div>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={fetchAdminOverview}
          disabled={isLoading}
          style={{ fontSize: '0.75rem' }}
        >
          <RefreshCw size={12} className={isLoading ? 'spin-animation' : ''} />
          <span>REFRESH_STATE</span>
        </button>
      </div>

      {/* Admin Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Metric 1: Total Users */}
        <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>REGISTERED_USERS</span>
            <Users size={14} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
            {adminData?.totalUsers || 0}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Stored in Database</span>
        </div>

        {/* Metric 2: Database Mode */}
        <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>STORAGE_ENGINE</span>
            <Database size={14} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {adminData?.dbStatus?.type || 'Persistent Storage'}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {adminData?.dbStatus?.storagePath || 'In-Memory (Non-Persistent)'}
          </span>
        </div>

        {/* Metric 3: Real-Time Sync Status */}
        <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SYNC_DAEMON</span>
            <Server size={14} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-green-bright)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green-bright)', display: 'inline-block' }}></span>
            <span>ACTIVE & ONLINE</span>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Multi-platform crawler</span>
        </div>
      </div>

      {/* Feature 1: Universal Handle Explorer */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Terminal size={16} color="var(--accent-green)" />
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                [UNIVERSAL_HANDLE_EXPLORER]
              </h3>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Inspect ANY handle live on-demand (in DB or external e.g. tourist, neal_wu). Live DB check verifies registered ownership.
            </p>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>PRESETS:</span>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => loadPreset({ codeforces: 'tourist', leetcode: 'neal_wu', atcoder: 'tourist' })}
              style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
            >
              Tourist & Neal
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => loadPreset({ codeforces: 'jiangly', leetcode: 'jiangly', atcoder: 'jiangly' })}
              style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
            >
              Jiangly
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => loadPreset({ codeforces: 'Benq', leetcode: 'benq', atcoder: 'Benq' })}
              style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
            >
              Benq
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => loadPreset({ codeforces: 'ecnerwala', leetcode: 'ecnerwala', atcoder: 'ecnerwala' })}
              style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
            >
              Ecnerwala
            </button>
          </div>
        </div>

        {/* Multi-Platform Explorer Inputs */}
        <form onSubmit={handleRunExplorerSync}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.6rem',
            marginBottom: '0.75rem'
          }}>
            {/* Codeforces */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>CODEFORCES</span>
                {explorerHandles.codeforces && (
                  (() => {
                    const owner = getHandleDbOwner('codeforces', explorerHandles.codeforces);
                    return owner ? (
                      <span style={{ fontSize: '0.62rem', color: 'var(--accent-green-bright)' }}>
                        ● IN_DB ({owner.username})
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                        ○ EXTERNAL
                      </span>
                    );
                  })()
                )}
              </div>
              <input 
                type="text"
                value={explorerHandles.codeforces}
                onChange={(e) => setExplorerHandles({ ...explorerHandles, codeforces: e.target.value })}
                className="input-field"
                placeholder="tourist"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
              />
            </div>

            {/* LeetCode */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>LEETCODE</span>
                {explorerHandles.leetcode && (
                  (() => {
                    const owner = getHandleDbOwner('leetcode', explorerHandles.leetcode);
                    return owner ? (
                      <span style={{ fontSize: '0.62rem', color: 'var(--accent-green-bright)' }}>
                        ● IN_DB ({owner.username})
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                        ○ EXTERNAL
                      </span>
                    );
                  })()
                )}
              </div>
              <input 
                type="text"
                value={explorerHandles.leetcode}
                onChange={(e) => setExplorerHandles({ ...explorerHandles, leetcode: e.target.value })}
                className="input-field"
                placeholder="neal_wu"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
              />
            </div>

            {/* AtCoder */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>ATCODER</span>
                {explorerHandles.atcoder && (
                  (() => {
                    const owner = getHandleDbOwner('atcoder', explorerHandles.atcoder);
                    return owner ? (
                      <span style={{ fontSize: '0.62rem', color: 'var(--accent-green-bright)' }}>
                        ● IN_DB ({owner.username})
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                        ○ EXTERNAL
                      </span>
                    );
                  })()
                )}
              </div>
              <input 
                type="text"
                value={explorerHandles.atcoder}
                onChange={(e) => setExplorerHandles({ ...explorerHandles, atcoder: e.target.value })}
                className="input-field"
                placeholder="tourist"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
              />
            </div>

            {/* CodeChef */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>CODECHEF</span>
                {explorerHandles.codechef && (
                  (() => {
                    const owner = getHandleDbOwner('codechef', explorerHandles.codechef);
                    return owner ? (
                      <span style={{ fontSize: '0.62rem', color: 'var(--accent-green-bright)' }}>
                        ● IN_DB ({owner.username})
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                        ○ EXTERNAL
                      </span>
                    );
                  })()
                )}
              </div>
              <input 
                type="text"
                value={explorerHandles.codechef}
                onChange={(e) => setExplorerHandles({ ...explorerHandles, codechef: e.target.value })}
                className="input-field"
                placeholder="chef_handle"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
              />
            </div>

            {/* GFG */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>GEEKSFORGEEKS</span>
                {explorerHandles.gfg && (
                  (() => {
                    const owner = getHandleDbOwner('gfg', explorerHandles.gfg);
                    return owner ? (
                      <span style={{ fontSize: '0.62rem', color: 'var(--accent-green-bright)' }}>
                        ● IN_DB ({owner.username})
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                        ○ EXTERNAL
                      </span>
                    );
                  })()
                )}
              </div>
              <input 
                type="text"
                value={explorerHandles.gfg}
                onChange={(e) => setExplorerHandles({ ...explorerHandles, gfg: e.target.value })}
                className="input-field"
                placeholder="gfg_handle"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
              />
            </div>

            {/* HackerRank */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>HACKERRANK</span>
                {explorerHandles.hackerrank && (
                  (() => {
                    const owner = getHandleDbOwner('hackerrank', explorerHandles.hackerrank);
                    return owner ? (
                      <span style={{ fontSize: '0.62rem', color: 'var(--accent-green-bright)' }}>
                        ● IN_DB ({owner.username})
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                        ○ EXTERNAL
                      </span>
                    );
                  })()
                )}
              </div>
              <input 
                type="text"
                value={explorerHandles.hackerrank}
                onChange={(e) => setExplorerHandles({ ...explorerHandles, hackerrank: e.target.value })}
                className="input-field"
                placeholder="hr_handle"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              // Syncs all entered handles live into the interactive Dashboard, Problem Tracker & Analytics.
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={isExploring}
              style={{ fontWeight: 700 }}
            >
              <Zap size={13} />
              <span>{isExploring ? 'SYNCING_HANDLES...' : 'EXECUTE_EXPLORER_SYNC'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feature 2: Registered User Directory */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
              [USER_DIRECTORY]
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Accounts registered in the database with bound platform handles and synced statistics.
            </p>
          </div>

          {/* Search input */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={13} color="var(--text-dim)" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="grep user, handle, email..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '1.8rem', fontSize: '0.75rem', padding: '0.35rem 0.6rem 0.35rem 1.8rem' }}
            />
          </div>
        </div>

        {/* User Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>User / Email</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Role</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Bound Handles</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Solved</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Created</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const isRootAdmin = u.username === 'admin';
                const handles = u.handles || {};
                const activeHandles = Object.entries(handles).filter(([k, v]) => Boolean(v && v.trim()));

                return (
                  <tr 
                    key={u.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.78rem'
                    }}
                  >
                    {/* User */}
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.username}</div>
                      {u.email && <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{u.email}</div>}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span className="badge" style={{
                        background: u.role === 'admin' ? 'var(--accent-green-dark)' : 'var(--bg-tag)',
                        color: u.role === 'admin' ? 'var(--accent-green-bright)' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.65rem'
                      }}>
                        {u.role === 'admin' ? 'ROOT' : 'USER'}
                      </span>
                    </td>

                    {/* Bound Handles */}
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {activeHandles.length > 0 ? (
                          activeHandles.map(([plat, handle]) => (
                            <span key={plat} className="badge tag-terminal" style={{ fontSize: '0.65rem' }}>
                              {plat}:{handle}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>// NONE</span>
                        )}
                      </div>
                    </td>

                    {/* Solved Problems */}
                    <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {u.lastSyncStats ? (
                        <span style={{ color: 'var(--accent-green-bright)' }}>
                          {u.lastSyncStats.totalSolved}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>-</span>
                      )}
                    </td>

                    {/* Registered Date */}
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'system'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => onInspectUser(u)}
                          title="Inspect User Dashboard"
                          style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                        >
                          <Eye size={12} color="var(--accent-green)" />
                          <span>INSPECT</span>
                        </button>

                        {!isRootAdmin && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            title="Delete User"
                            style={{ padding: '0.2rem 0.45rem', borderColor: 'var(--verdict-wrong)', color: 'var(--verdict-wrong)' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    // No registered records match search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
