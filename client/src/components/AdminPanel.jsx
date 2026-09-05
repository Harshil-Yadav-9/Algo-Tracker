import React, { useState, useEffect } from 'react';
import { apiUrl } from '../services/api';
import { 
  Shield, 
  Users, 
  Search, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  Eye,
  Server,
  Code2
} from 'lucide-react';
import PlatformIcon from './PlatformIcons';

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

  // Delete a user
  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;

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
      
      const targetInfo = {
        name: 'Universal Explorer',
        handles: { ...explorerHandles },
        description: 'Live Platform Explorer'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Admin Banner */}
      <div className="glass-card" style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid #ca8a04',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fde047'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                Admin Control Center
              </h2>
              <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid #ca8a04' }}>
                Superuser
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Universal Handle Explorer & Registered User Directory.
            </p>
          </div>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={fetchAdminOverview}
          disabled={isLoading}
          style={{ fontSize: '0.8rem' }}
        >
          <RefreshCw size={13} className={isLoading ? 'spin-animation' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.85rem'
      }}>
        {/* Metric 1: Total Users */}
        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Registered Users</span>
            <Users size={16} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {adminData?.totalUsers || 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active user accounts</span>
        </div>

        {/* Metric 2: Sync Status */}
        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Sync Service</span>
            <Server size={16} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-green-bright)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
            <span className="pulse-dot"></span>
            <span>Online & Ready</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Multi-platform crawler</span>
        </div>
      </div>

      {/* Feature 1: Universal Handle Explorer */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} color="var(--accent-green)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Universal Handle Explorer
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Inspect and live-aggregate statistics for any arbitrary handles across platforms without modifying user accounts.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => loadPreset({ codeforces: 'tourist', leetcode: 'neal_wu', atcoder: 'tourist' })}
              style={{ fontSize: '0.72rem' }}
            >
              Legendary Preset
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => loadPreset({ codeforces: 'Benq', leetcode: 'lee215', codechef: 'gennady' })}
              style={{ fontSize: '0.72rem' }}
            >
              Pro Preset
            </button>
          </div>
        </div>

        <form onSubmit={handleRunExplorerSync}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.65rem',
            marginBottom: '1rem'
          }}>
            {['codeforces', 'leetcode', 'atcoder', 'codechef', 'gfg', 'hackerrank'].map(plat => (
              <div key={plat}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'capitalize' }}>
                  <PlatformIcon platformKey={plat} size={14} />
                  <span>{plat}</span>
                </label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder={`Handle on ${plat}`}
                  value={explorerHandles[plat] || ''}
                  onChange={(e) => setExplorerHandles(prev => ({ ...prev, [plat]: e.target.value }))}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            ))}
          </div>

          <button 
            type="submit"
            disabled={isExploring}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <Zap size={15} className={isExploring ? 'spin-animation' : ''} />
            <span>{isExploring ? 'Fetching Platform Data...' : 'Inspect Live Handles'}</span>
          </button>
        </form>
      </div>

      {/* Feature 2: User Accounts Directory */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--accent-green)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              User Directory ({filteredUsers.length})
            </h3>
          </div>

          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search user, email, handle..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2rem', fontSize: '0.78rem' }}
            />
          </div>
        </div>

        {/* User Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>User</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Email</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Role</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Bound Handles</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id || u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {u.avatar ? (
                        <img src={u.avatar} alt="" style={{ width: '22px', height: '22px', borderRadius: '4px' }} />
                      ) : (
                        <Users size={14} />
                      )}
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.username || u.name}</span>
                    </div>
                  </td>

                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>
                    {u.email}
                  </td>

                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span className="badge" style={{
                      background: u.role === 'admin' ? 'rgba(234, 179, 8, 0.15)' : 'var(--bg-surface)',
                      color: u.role === 'admin' ? '#fde047' : 'var(--text-muted)'
                    }}>
                      {u.role?.toUpperCase()}
                    </span>
                  </td>

                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {Object.entries(u.handles || {}).map(([plat, handle]) => {
                        if (!handle) return null;
                        return (
                          <span key={plat} className={`badge tag-${plat}`} style={{ fontSize: '0.65rem' }}>
                            {plat}: @{handle}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <button 
                        onClick={() => onInspectUser(u)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem' }}
                        title="Inspect user performance"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>

                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(u._id || u.id, u.username || u.email)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#f87171', padding: '0.25rem 0.45rem' }}
                          title="Delete user"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No users found matching search filter.
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
