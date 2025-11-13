import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiHome, FiBook, FiCode, FiPackage, FiUsers, FiTruck, FiShield, FiBriefcase, FiActivity, FiMessageSquare, FiMonitor, FiZap, FiHelpCircle, FiSettings } from 'react-icons/fi';
import './App.css';
import { documentationData } from './data/documentationData';
import HomePage from './pages/HomePage';
import GettingStarted from './pages/GettingStarted';
import CoreFramework from './pages/CoreFramework';
import CharacterSystem from './pages/CharacterSystem';
import JobSystem from './pages/JobSystem';
import PropertySystem from './pages/PropertySystem';
import VehicleSystem from './pages/VehicleSystem';
import PoliceSystem from './pages/PoliceSystem';
import BusinessSystem from './pages/BusinessSystem';
import CrimeSystem from './pages/CrimeSystem';
import CommunicationSystem from './pages/CommunicationSystem';
import UISystem from './pages/UISystem';
import GameplaySystem from './pages/GameplaySystem';
import UtilitySystem from './pages/UtilitySystem';
import OXEcosystem from './pages/OXEcosystem';
import APIReference from './pages/APIReference';
import DeveloperGuide from './pages/DeveloperGuide';
import Troubleshooting from './pages/Troubleshooting';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const navSections = [
    {
      title: 'Getting Started',
      items: [
        { path: '/', icon: FiHome, label: 'Overview' },
        { path: '/getting-started', icon: FiBook, label: 'Getting Started' },
      ]
    },
    {
      title: 'Core Systems',
      items: [
        { path: '/core-framework', icon: FiCode, label: 'Core Framework' },
        { path: '/character-system', icon: FiUsers, label: 'Character System' },
        { path: '/job-system', icon: FiBriefcase, label: 'Job System' },
      ]
    },
    {
      title: 'Features',
      items: [
        { path: '/property-system', icon: FiHome, label: 'Property System' },
        { path: '/vehicle-system', icon: FiTruck, label: 'Vehicle System' },
        { path: '/police-system', icon: FiShield, label: 'Police System' },
        { path: '/business-system', icon: FiBriefcase, label: 'Business System' },
        { path: '/crime-system', icon: FiActivity, label: 'Crime System' },
      ]
    },
    {
      title: 'Interface',
      items: [
        { path: '/communication-system', icon: FiMessageSquare, label: 'Communication' },
        { path: '/ui-system', icon: FiMonitor, label: 'UI Systems' },
      ]
    },
    {
      title: 'Additional',
      items: [
        { path: '/gameplay-system', icon: FiZap, label: 'Gameplay Systems' },
        { path: '/utility-system', icon: FiSettings, label: 'Utility Systems' },
        { path: '/ox-ecosystem', icon: FiPackage, label: 'OX Ecosystem' },
      ]
    },
    {
      title: 'Developer Resources',
      items: [
        { path: '/api-reference', icon: FiCode, label: 'API Reference' },
        { path: '/developer-guide', icon: FiBook, label: 'Developer Guide' },
        { path: '/troubleshooting', icon: FiHelpCircle, label: 'Troubleshooting' },
      ]
    }
  ];

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            Sandbox RP
          </h1>
          <div className="sidebar-version">v{documentationData.overview.version}</div>
        </div>
        <nav className="sidebar-nav">
          {navSections.map((section, idx) => (
            <div key={idx} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon className="nav-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
            display: window.innerWidth > 1024 ? 'none' : 'block'
          }}
        />
      )}
    </>
  );
}

function Header({ onMenuToggle }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="header">
      <div className="header-content">
        <div className="breadcrumb">
          <span>Sandbox RP Documentation</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app">
        <button
          className="mobile-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="main-content">
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          <div className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/getting-started" element={<GettingStarted />} />
              <Route path="/core-framework" element={<CoreFramework />} />
              <Route path="/character-system" element={<CharacterSystem />} />
              <Route path="/job-system" element={<JobSystem />} />
              <Route path="/property-system" element={<PropertySystem />} />
              <Route path="/vehicle-system" element={<VehicleSystem />} />
              <Route path="/police-system" element={<PoliceSystem />} />
              <Route path="/business-system" element={<BusinessSystem />} />
              <Route path="/crime-system" element={<CrimeSystem />} />
              <Route path="/communication-system" element={<CommunicationSystem />} />
              <Route path="/ui-system" element={<UISystem />} />
              <Route path="/gameplay-system" element={<GameplaySystem />} />
              <Route path="/utility-system" element={<UtilitySystem />} />
              <Route path="/ox-ecosystem" element={<OXEcosystem />} />
              <Route path="/api-reference" element={<APIReference />} />
              <Route path="/developer-guide" element={<DeveloperGuide />} />
              <Route path="/troubleshooting" element={<Troubleshooting />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
