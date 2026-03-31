import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Toast from '../common/Toast';
import useUiStore from '../../store/uiStore';

export default function Layout() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <div className="app-layout">
      <TopNavbar />
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
