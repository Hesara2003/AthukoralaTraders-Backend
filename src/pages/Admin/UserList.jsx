import React, { useEffect, useState } from 'react';
import { User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_OPTIONS = ['CUSTOMER', 'STAFF', 'ADMIN'];

export default function UserList() {
  const { getToken, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch('http://localhost:8080/api/admin/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed loading users', err);
      setError('Failed loading users.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm('Change role for this user?')) return;
    setUpdatingId(userId);
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();
      // Update local state
      setUsers((prev) => prev.map(u => u.id === userId ? { ...u, role: json.newRole || newRole } : u));
      alert('Role updated successfully');
    } catch (err) {
      console.error('Failed to update role', err);
      alert('Failed to update role. See console for details.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Users</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchUsers} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Try again</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">User Management</h2>
                <p className="text-sm text-gray-600">View and change user roles</p>
              </div>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{u.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          defaultValue={u.role}
                          onChange={(e) => setUsers(prev => prev.map(p => p.id === u.id ? { ...p, _selectedRole: e.target.value } : p))}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {ROLE_OPTIONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleChangeRole(u.id, (u._selectedRole || u.role))}
                          disabled={updatingId === u.id || (u._selectedRole || u.role) === u.role}
                          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        >
                          {updatingId === u.id ? <Loader2 className="h-4 w-4 animate-spin inline" /> : 'Change Role'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
