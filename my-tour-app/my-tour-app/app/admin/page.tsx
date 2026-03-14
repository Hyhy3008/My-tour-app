'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, Users, MapPin, TrendingUp, 
  Lock, Eye, EyeOff, RefreshCw, LogOut 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  totalVisits: number;
  recentOrders: any[];
  topLocations: any[];
  dailyRevenue: any[];
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password }),
      });
      
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_auth', 'true');
        fetchStats();
      } else {
        setError('Mật khẩu không đúng');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats', password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && password) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setPassword('');
    setStats(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Ninh Bình Tour Guide</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu admin"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !password}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">📊 Admin Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Doanh thu</p>
                <p className="text-xl font-bold text-gray-800">
                  ${stats?.totalRevenue ? (stats.totalRevenue / 100).toFixed(0) : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng đơn</p>
                <p className="text-xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đang hoạt động</p>
                <p className="text-xl font-bold text-gray-800">{stats?.activeUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <MapPin className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lượt ghé thăm</p>
                <p className="text-xl font-bold text-gray-800">{stats?.totalVisits || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Doanh thu 7 ngày qua</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.dailyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">📍 Địa điểm phổ biến</h2>
          <div className="space-y-3">
            {stats?.topLocations?.map((loc, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </span>
                <div className="flex-grow">
                  <p className="font-medium">{loc.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(loc.visits / (stats?.topLocations?.[0]?.visits || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-500">{loc.visits} lượt</span>
              </div>
            ))}
            {(!stats?.topLocations || stats.topLocations.length === 0) && (
              <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">💳 Đơn hàng gần đây</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">Thời gian</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Số tiền</th>
                  <th className="pb-3">Phương thức</th>
                  <th className="pb-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 text-sm">
                      {new Date(order.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 text-sm">{order.email || '-'}</td>
                    <td className="py-3 text-sm font-medium">
                      {order.currency === 'VND' 
                        ? `${order.amount.toLocaleString()}đ` 
                        : `$${(order.amount / 100).toFixed(2)}`
                      }
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.payment_method === 'stripe' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {order.payment_method === 'stripe' ? 'Stripe' : 'VietQR'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'paid' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {order.status === 'paid' ? '✓ Đã TT' : 'Chờ'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Chưa có đơn hàng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
