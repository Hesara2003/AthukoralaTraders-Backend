import React, { useEffect, useState } from 'react';
import { User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const ROLE_OPTIONS = ['CUSTOMER', 'STAFF', 'ADMIN'];

export default function UserList() {
  const { user: currentUser, getToken, login, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const API_BASE = (import.meta.env.VITE_API_BASE?.replace(/\/$/, '')) || '';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
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
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
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
      // Update local list state
      setUsers((prev) => prev.map(u => u.id === userId ? { ...u, role: json.newRole || newRole } : u));

      // If the updated user is the currently logged-in user, update AuthContext immediately
      try {
        const affectedUsername = json.username || users.find(u => u.id === userId)?.username;
        if (affectedUsername && currentUser?.username && affectedUsername === currentUser.username) {
          // Preserve additional user data when re-setting role
          const additionalData = {
            email: currentUser.email,
            profileImage: currentUser.profileImage,
            fullName: currentUser.fullName,
            isGoogleAuth: currentUser.isGoogleAuth,
          };
          // Reuse the same token and username but override role so UI access gates update immediately
          login(token, currentUser.username, (json.newRole || newRole), additionalData);
        }
      } catch (_) {}

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
      <AdminLayout title="User Management" subtitle="View and change user roles">
        <div className="py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="User Management" subtitle="View and change user roles">
        <div className="py-16 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Users</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={fetchUsers} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Try again</button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management" subtitle="View and change user roles">
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
    </AdminLayout>
  );
}
