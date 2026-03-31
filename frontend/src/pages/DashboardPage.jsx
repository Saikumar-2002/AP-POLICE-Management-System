import React, { useEffect, useState } from 'react';
import { 
  HiOutlineRefresh, HiOutlineChevronRight, HiOutlineBell, HiOutlineClock, HiOutlinePlusCircle, HiOutlineUserGroup
} from 'react-icons/hi';
import { 
  HiOutlineGlobeAlt, HiOutlineMap, HiOutlineBuildingOffice2, 
  HiOutlineMapPin, HiOutlineShieldCheck, HiOutlineSquares2X2
} from 'react-icons/hi2';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import '../dashboard-styles.css';
import useUnitStore from '../store/unitStore';
import useUiStore from '../store/uiStore';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'];

export default function DashboardPage() {
  const { stats, loading, fetchTree, fetchAllUnits } = useUnitStore();
  const { canEdit } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    fetchTree();
    fetchAllUnits();
  }, []);

  const statCards = [
    { label: 'Total Units', value: stats.total || '0', icon: <HiOutlineBuildingOffice2 />, accent: '#3b82f6' },
    { label: 'Districts', value: stats.districts || '0', icon: <HiOutlineMap />, accent: '#ef4444' },
    { label: 'Active Personnel', value: '4,283', icon: <HiOutlineUserGroup />, accent: '#10b981' },
    { label: 'System Accesses', value: '12.4k', icon: <HiOutlinePlusCircle />, accent: '#f59e0b' },
  ];

  const distributionData = [
    { name: 'Stations', value: 850 },
    { name: 'Circles', value: 240 },
    { name: 'Divisions', value: 120 },
    { name: 'Districts', value: 30 },
    { name: 'Ranges', value: 12 },
    { name: 'Zones', value: 6 },
  ];

  const recentActivity = [
    { action: 'New Unit Created', target: 'Visakhapatnam Airport PS', time: '12 mins ago', icon: <HiOutlinePlusCircle /> },
    { action: 'Hierarchy Modified', target: 'NTR District Range', time: '45 mins ago', icon: <HiOutlineRefresh /> },
    { action: 'Permissions Updated', target: 'System Admin', time: '2 hours ago', icon: <HiOutlineShieldCheck /> },
    { action: 'New District Added', target: 'Anakapalli District', time: '5 hours ago', icon: <HiOutlineMapPin /> },
  ];

  const loginsData = [
    { name: 'Visakhapatnam', value: 1800 },
    { name: 'Vijayawada', value: 1400 },
    { name: 'Guntur', value: 900 },
    { name: 'Nellore', value: 400 },
  ];

  return (
    <div className="dashboard-container">
      {/* Breadcrumbs */}
      <div className="dash-breadcrumbs">
        <span>🏠 Home</span> <HiOutlineChevronRight /> <span className="active">Dashboard</span>
      </div>

      {/* Hero Status Banner */}
      <div className="dash-status-banner">
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span>COMMAND CENTER STATUS: OPERATIONAL</span>
        </div>
        <div className="flex gap-md items-center">
          <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>Last sync: Just now</span>
          <button className="btn btn-icon btn-ghost" onClick={() => fetchTree()} style={{ color: 'white' }}>
            <HiOutlineRefresh className={loading ? 'spin-animation' : ''} />
          </button>
        </div>
      </div>

      {/* Stat Cards Layer */}
      <div className="dash-stats-grid">
        {statCards.map((card, i) => (
          <div className="dash-stat-card" key={i} style={{ '--accent': card.accent }}>
            <div className="dash-stat-label">{card.label}</div>
            <div className="dash-stat-value">{card.value}</div>
            <div className="dash-stat-icon-bg">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Primary Analytics Row */}
      <div className="dash-charts-row">
        {/* Main Chart */}
        <div className="dash-chart-card">
          <div className="chart-header">
            <h3>Login Distribution by District</h3>
            <span className="chart-badge">Live Traffic</span>
          </div>
          <div className="chart-body" style={{ marginTop: '24px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loginsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#1e3a8a" radius={[6, 6, 0, 0]} barSize={45}>
                  {loginsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="activity-feed-card">
          <div className="chart-header">
            <h3 style={{ color: 'white' }}>Mission Timeline</h3>
            <HiOutlineBell style={{ color: '#38bdf8' }} />
          </div>
          <div className="activity-list">
            {recentActivity.map((act, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-icon">{act.icon}</div>
                <div className="activity-content">
                  <p style={{ fontWeight: 600, color: 'white' }}>{act.action}</p>
                  <p style={{ color: '#94a3b8' }}>{act.target}</p>
                  <div className="activity-time">{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Structural Breakdown */}
      <div className="distribution-row">
        <div className="dash-chart-card">
          <div className="chart-header">
            <h3>Structural Hierarchy Breakdown</h3>
            <span className="chart-badge">Organisational</span>
          </div>
          <div className="flex gap-lg items-center" style={{ marginTop: '20px' }}>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex flex-col gap-sm">
                {distributionData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-sm">
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dash-chart-card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', border: 'none' }}>
          <div className="chart-header">
            <h3 style={{ color: 'white' }}>Quick Management</h3>
          </div>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '12px' }}>
            Directly access key hierarchy controls to maintain the system integrity.
          </p>
          <div className="flex flex-col gap-md" style={{ marginTop: '32px' }}>
            <Link 
              to="/units"
              className="btn" 
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', justifyContent: 'flex-start', padding: '16px', textDecoration: 'none' }}
            >
              <HiOutlineBuildingOffice2 /> Manage Organisational Units
            </Link>
            <Link 
              to="/upload"
              className="btn" 
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', justifyContent: 'flex-start', padding: '16px', textDecoration: 'none' }}
            >
              <HiOutlineMap /> Import Bulk Hierarchy Data
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

