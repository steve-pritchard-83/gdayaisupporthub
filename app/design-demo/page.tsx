'use client';

import { useState } from 'react';
import { Search, Settings, User, Bell, ChevronDown, Play, Pause, SkipForward } from 'lucide-react';

export default function DesignDemoPage() {
  const [activeTab, setActiveTab] = useState('page-one');
  const [toggleState, setToggleState] = useState(false);
  const [progressValue, setProgressValue] = useState(65);

  const tabs = [
    { id: 'page-one', label: 'PAGE ONE' },
    { id: 'page-two', label: 'PAGE TWO' },
    { id: 'page-three', label: 'PAGE THREE' },
    { id: 'page-four', label: 'PAGE FOUR' },
    { id: 'page-five', label: 'PAGE FIVE' },
    { id: 'page-six', label: 'PAGE SIX' },
  ];

  const tableData = [
    { id: 1, name: 'Item one', year: '2012', status: 'Active' },
    { id: 2, name: 'Item two', year: '2013', status: 'Active' },
    { id: 3, name: 'Item three', year: '2014', status: 'Inactive' },
  ];

  const menuItems = [
    { id: 1, label: 'MENU ONE', active: false },
    { id: 2, label: 'MENU TWO', active: true },
    { id: 3, label: 'MENU THREE', active: false },
    { id: 4, label: 'SUBMENU ONE', active: false, submenu: true },
    { id: 5, label: 'SUBMENU TWO', active: false, submenu: true },
    { id: 6, label: 'MENU FOUR', active: false },
  ];

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Modern Dark Theme UI Kit</h1>
          <p className="text-secondary text-lg">G'day AI Support Hub - Design System Demo</p>
        </div>

        {/* Navigation Tabs */}
        <div className="card-compact">
          <h2 className="text-xl font-semibold text-primary mb-6">Navigation Tabs</h2>
          <div className="nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab ${activeTab === tab.id ? 'nav-tab-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Menu */}
          <div className="card-compact">
            <h3 className="text-lg font-semibold text-primary mb-4">Menu System</h3>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`${item.submenu ? 'submenu-item' : 'menu-item'} ${item.active ? 'menu-item-active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* Login Form */}
            <div className="mt-8 space-y-4">
              <h4 className="text-sm font-semibold text-secondary uppercase">LOGIN</h4>
              <input
                type="email"
                placeholder="Enter your email"
                className="form-input"
              />
              <h4 className="text-sm font-semibold text-secondary uppercase">PASSWORD</h4>
              <input
                type="password"
                placeholder="Enter your password"
                className="form-input"
              />
              <button className="btn-primary w-full">Sign In</button>
            </div>
          </div>

          {/* Middle Column - Content */}
          <div className="space-y-6">
            {/* Search */}
            <div className="card-compact">
              <h3 className="text-lg font-semibold text-primary mb-4">Search</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search items..."
                  className="search-input"
                />
                <Search className="search-icon w-5 h-5" />
              </div>
            </div>

            {/* Data Table */}
            <div className="card-compact">
              <h3 className="text-lg font-semibold text-primary mb-4">Data Table</h3>
              <div className="table-modern">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">Year</th>
                      <th className="table-header">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item) => (
                      <tr key={item.id} className="table-row">
                        <td className="table-cell">{item.name}</td>
                        <td className="table-cell">{item.year}</td>
                        <td className="table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.status === 'Active' ? 'bg-accent text-black' : 'bg-grey-600 text-white'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="card-compact">
              <h3 className="text-lg font-semibold text-primary mb-4">Progress Bars</h3>
              <div className="space-y-4">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '80%' }}></div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '60%' }}></div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '40%' }}></div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Components */}
          <div className="space-y-6">
            {/* Alert Boxes */}
            <div className="card-compact">
              <h3 className="text-lg font-semibold text-primary mb-4">Alert Boxes</h3>
              <div className="space-y-4">
                <div className="alert-attention-dark">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-primary">ATTENTION</h4>
                      <p className="text-sm text-secondary mt-1">
                        This is an important notification that requires your attention.
                        Please review the details carefully.
                      </p>
                      <button className="btn-small mt-3">SMALL BUTTON</button>
                    </div>
                  </div>
                </div>

                <div className="alert-attention-dark">
                  <div className="flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-primary">ATTENTION</h4>
                      <p className="text-sm text-secondary mt-1">
                        System configuration needs to be updated to ensure optimal performance.
                      </p>
                      <button className="btn-small mt-3">SMALL BUTTON</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="card-compact">
              <h3 className="text-lg font-semibold text-primary mb-4">Buttons</h3>
              <div className="space-y-4">
                <button className="btn-primary">BUTTON</button>
                <div className="flex space-x-3">
                  <button className="btn-small">BUTTON</button>
                  <button className="btn-small-secondary">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                <button className="btn-small">SMALL BUTTON</button>
                <div className="flex space-x-3">
                  <button className="btn-secondary">BUTTON</button>
                  <button className="btn-small-secondary">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                <button className="btn-small">SMALL BUTTON</button>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="card-compact">
              <h3 className="text-lg font-semibold text-primary mb-4">Toggle Switch</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-secondary">OFF</span>
                <button
                  onClick={() => setToggleState(!toggleState)}
                  className={`toggle-switch ${toggleState ? 'toggle-switch-on' : 'toggle-switch-off'}`}
                >
                  <span className={`toggle-thumb ${toggleState ? 'toggle-thumb-on' : 'toggle-thumb-off'}`} />
                </button>
                <span className="text-sm text-secondary">ON</span>
              </div>
            </div>

            {/* Tooltip Example */}
            <div className="card-compact">
              <h3 className="text-lg font-semibold text-primary mb-4">Tooltip</h3>
              <div className="relative">
                <button className="btn-secondary">TOOLTIP</button>
                <div className="tooltip mt-2 left-0">
                  <p className="text-xs">
                    This is a helpful tooltip that provides additional context.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Additional Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Elements */}
          <div className="card">
            <h3 className="text-xl font-semibold text-primary mb-6">Form Elements</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Input Field</label>
                <input type="text" placeholder="Enter text here..." className="form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Select Dropdown</label>
                <select className="form-select">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Text Area</label>
                <textarea
                  placeholder="Enter your message..."
                  rows={4}
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="card">
            <h3 className="text-xl font-semibold text-primary mb-6">Status & Priority Indicators</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-secondary mb-3">Status Badges</h4>
                <div className="flex space-x-3">
                  <span className="status-open">Open</span>
                  <span className="status-progress">In Progress</span>
                  <span className="status-closed">Closed</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-secondary mb-3">Priority Badges</h4>
                <div className="flex space-x-3">
                  <span className="priority-high">High</span>
                  <span className="priority-medium">Medium</span>
                  <span className="priority-low">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="card-compact">
          <h3 className="text-lg font-semibold text-primary mb-4">Pagination</h3>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <div className="w-2 h-2 bg-dark-surface-light rounded-full"></div>
            <div className="w-2 h-2 bg-dark-surface-light rounded-full"></div>
            <div className="w-2 h-2 bg-dark-surface-light rounded-full"></div>
            <div className="w-2 h-2 bg-dark-surface-light rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 