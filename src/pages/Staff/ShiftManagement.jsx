import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/AdminLayout';

const API_BASE = 'http://localhost:8080/api';

export default function ShiftManagement() {
  const { user } = useAuth();
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalHours: 0, shiftsThisMonth: 0 });

  const staffId = user?.id || 'staff-demo';

  useEffect(() => {
    loadShiftData();
  }, [staffId]);

  const loadShiftData = async () => {
    try {
      setLoading(true);
      const [currentRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/shifts/current/${staffId}`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/shifts/history/${staffId}`).catch(() => ({ data: [] })),
      ]);

      setCurrentShift(currentRes.data);
      setShiftHistory(historyRes.data || []);

      // Calculate stats
      const history = historyRes.data || [];
      const totalHours = history.reduce((sum, shift) => {
        if (shift.startTime && shift.endTime) {
          const start = new Date(shift.startTime);
          const end = new Date(shift.endTime);
          return sum + (end - start) / (1000 * 60 * 60);
        }
        return sum;
      }, 0);

      const thisMonth = history.filter((shift) => {
        if (!shift.startTime) return false;
        const shiftDate = new Date(shift.startTime);
        const now = new Date();
        return (
          shiftDate.getMonth() === now.getMonth() &&
          shiftDate.getFullYear() === now.getFullYear()
        );
      });

      setStats({
        totalHours: totalHours.toFixed(1),
        shiftsThisMonth: thisMonth.length,
      });
    } catch (error) {
      console.error('Failed to load shift data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async () => {
    try {
      await axios.post(`${API_BASE}/shifts/clock-in?staffId=${staffId}`);
      await loadShiftData();
      alert('Clocked in successfully!');
    } catch (error) {
      alert('Failed to clock in: ' + error.message);
    }
  };

  const clockOut = async () => {
    if (!currentShift?.id) {
      alert('No active shift found');
      return;
    }

    try {
      await axios.post(`${API_BASE}/shifts/clock-out?shiftId=${currentShift.id}`);
      await loadShiftData();
      alert('Clocked out successfully!');
    } catch (error) {
      alert('Failed to clock out: ' + error.message);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 'In Progress';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = (endDate - startDate) / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hrs`;
  };

  return (
    <AdminLayout title="Shift Management" subtitle="Track your work hours and shift history">
      {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading shift data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Current Status</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {currentShift && !currentShift.endTime ? 'On Shift' : 'Off Duty'}
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      currentShift && !currentShift.endTime
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <svg
                      className={`h-6 w-6 ${
                        currentShift && !currentShift.endTime
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalHours}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Shifts This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stats.shiftsThisMonth}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Clock In/Out Card */}
            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <div className="text-center">
                {currentShift && !currentShift.endTime ? (
                  <>
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Current Shift Started</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {formatTime(currentShift.startTime)}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {formatDate(currentShift.startTime)}
                      </p>
                    </div>
                    <button
                      onClick={clockOut}
                      className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold"
                    >
                      Clock Out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Ready to start your shift?</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {new Date().toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={clockIn}
                      className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
                    >
                      Clock In
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Shift History */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Shift History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clock In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clock Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shiftHistory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          No shift history available
                        </td>
                      </tr>
                    ) : (
                      shiftHistory.map((shift) => (
                        <tr key={shift.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(shift.startTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(shift.startTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(shift.endTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {calculateDuration(shift.startTime, shift.endTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                shift.endTime
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {shift.endTime ? 'Completed' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
    </AdminLayout>
  );
}
