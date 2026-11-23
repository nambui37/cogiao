import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import ClassManagement from './pages/ClassManagement';
import StudentManagement from './pages/StudentManagement';
import ParentAccountManagement from './pages/ParentAccountManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import TuitionManagement from './pages/TuitionManagement';
import SettingsPage from './pages/SettingsPage';
import ParentPortal from './pages/ParentPortal';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import VietQRModal from './components/VietQRModal';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import CreateAnnouncementModal from './components/CreateAnnouncementModal';
import InstallPwaModal from './components/InstallPwaModal';
import { initialNotifications } from './components/NotificationDropdown';
import { initialClasses } from './services/mockData';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [viewLandingDirectly, setViewLandingDirectly] = useState(false);

  const [role, setRole] = useState('admin');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedQR, setSelectedQR] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  // Modern Toast System
  const [toasts, setToasts] = useState([]);

  // Global Confirm Dialog State (Completely replaces browser window.confirm!)
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemName: '',
    onConfirm: () => {}
  });

  const askConfirm = ({ title, message, itemName, onConfirm }) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      itemName,
      onConfirm
    });
  };

  const closeConfirm = () => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  };

  const showToast = (message, type = 'success', title = '') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Listen to window.alert overrides
  useEffect(() => {
    const handleCustomToast = (e) => {
      if (e.detail?.message) {
        showToast(e.detail.message, e.detail.type || 'info');
      }
    };
    window.addEventListener('app-toast', handleCustomToast);
    return () => window.removeEventListener('app-toast', handleCustomToast);
  }, []);

  const handleLoginSuccess = (user, token, children) => {
    const userWithChildren = {
      ...user,
      children: children || user.children || []
    };
    setCurrentUser(userWithChildren);
    localStorage.setItem('thuy_auth_user_v2', JSON.stringify(userWithChildren));
    if (token) localStorage.setItem('thuy_token_v2', token);

    const userRole = user.role_name || (user.phone === '0912345678' ? 'admin' : 'parent');
    setRole(userRole);
    setActiveTab(userRole === 'admin' ? 'dashboard' : 'parent');
    showToast(`Chào mừng ${user.full_name} đã đăng nhập!`, 'success', 'Đăng nhập thành công');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('thuy_auth_user_v2');
    localStorage.removeItem('thuy_token_v2');
    showToast('Đã đăng xuất khỏi hệ thống', 'info');
  };

  const handleOpenQR = (fee) => {
    setSelectedQR(fee);
    setIsQRModalOpen(true);
  };

  const handleSendAnnouncement = (newAnnouncement) => {
    setNotifications(prev => [newAnnouncement, ...prev]);
    showToast('Đã phát thông báo tới phụ huynh thành công!', 'success', 'Thông báo lớp học');
  };

  if (!currentUser || viewLandingDirectly) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Toast toasts={toasts} removeToast={removeToast} />
        
        <LandingPage 
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          showToast={showToast}
          currentUser={currentUser}
          onBackToApp={() => setViewLandingDirectly(false)}
        />

        <InstallPwaModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />

        {isLoginModalOpen && (
          <LoginPage 
            onLoginSuccess={(user, token, children) => {
              setIsLoginModalOpen(false);
              setViewLandingDirectly(false);
              handleLoginSuccess(user, token, children);
            }}
            onClose={() => setIsLoginModalOpen(false)}
            isModal={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans text-slate-800">
      
      {/* Toast Notification Container */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Global Custom Confirm Modal (Replaces browser window.confirm!) */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        itemName={confirmConfig.itemName}
      />

      <div>
        {/* Navigation Bar with Notifications */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          role={role} 
          setRole={setRole}
          currentUser={currentUser}
          onLogout={handleLogout}
          onViewLanding={() => setViewLandingDirectly(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          notifications={notifications}
          setNotifications={setNotifications}
          onOpenCreateAnnouncement={() => setIsAnnouncementOpen(true)}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          
          {role === 'admin' ? (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard 
                  setActiveTab={setActiveTab} 
                  onOpenQR={handleOpenQR} 
                  showToast={showToast} 
                />
              )}
              {activeTab === 'classes' && (
                <ClassManagement 
                  showToast={showToast} 
                  askConfirm={askConfirm} 
                  setActiveTab={setActiveTab} 
                />
              )}
              {activeTab === 'students' && <StudentManagement showToast={showToast} askConfirm={askConfirm} />}
              {activeTab === 'parents' && <ParentAccountManagement showToast={showToast} askConfirm={askConfirm} />}
              {activeTab === 'attendance' && <AttendanceManagement showToast={showToast} />}
              {activeTab === 'tuition' && (
                <TuitionManagement 
                  onOpenQR={handleOpenQR} 
                  showToast={showToast} 
                  askConfirm={askConfirm} 
                />
              )}
              {activeTab === 'settings' && <SettingsPage showToast={showToast} />}
            </>
          ) : (
            <ParentPortal 
              onOpenQR={handleOpenQR} 
              announcements={notifications} 
              currentUser={currentUser}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
            />
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-600">
            Thủy English Center • Student & Parent Management System 2.0
          </p>
          <p>
            Hệ thống quản lý giáo dục thông minh • Tích hợp điểm danh 1-chạm, Cổng VietQR Napas & Trung tâm thông báo
          </p>
        </div>
      </footer>

      {/* Global VietQR Modal */}
      <VietQRModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
        fee={selectedQR} 
        showToast={showToast}
      />

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
        onSend={handleSendAnnouncement}
        classes={initialClasses}
        showToast={showToast}
      />

      {/* PWA Install Guide Modal */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

    </div>
  );
}
