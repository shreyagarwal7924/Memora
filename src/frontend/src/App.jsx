import React, { useState } from 'react';
import {
  Users,
  UserCog,
} from 'lucide-react';
import FamilyView from './components/FamilyView';
import PatientView from './components/PatientView';

function App() {
  const [viewMode, setViewMode] = useState('patient');

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* View Toggle Button - Positioned absolutely over content */}
      <button
        onClick={() => setViewMode(viewMode === 'patient' ? 'family' : 'patient')}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white/90 transition-colors duration-200"
        aria-label="Toggle view mode"
      >
        {viewMode === 'patient' ? (
          <UserCog className="h-6 w-6 text-gray-700 hover:text-blue-600" />
        ) : (
          <Users className="h-6 w-6 text-gray-700 hover:text-blue-600" />
        )}
      </button>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {viewMode === 'patient' ? <PatientView /> : <FamilyView />}
      </main>
    </div>
  );
}

export default App;