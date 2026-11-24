import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthModal } from './components/common/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { CareerRecommendationsPage } from './pages/CareerRecommendationsPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { JobsPage } from './pages/JobsPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { AtsResumePage } from './pages/AtsResumePage';
import { ResourcesPage } from './pages/ResourcesPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedAssessmentDomain, setSelectedAssessmentDomain] = useState<string>('Full-Stack Software Engineering');
  const [selectedRoleForGap, setSelectedRoleForGap] = useState<string>('default');
  const [resourceSkillFilter, setResourceSkillFilter] = useState<string>('');

  // Handle URL hash or path sync if desired
  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (user && currentRoute === '/') {
      setCurrentRoute('/dashboard');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 animate-pulse" />
          <span className="text-xs text-slate-500 font-medium">Initializing EduPath AI...</span>
        </div>
      </div>
    );
  }

  // If on landing page (or user not logged in and requesting landing page)
  if (currentRoute === '/' && !user) {
    return (
      <>
        <LandingPage
          onNavigate={navigate}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => navigate('/dashboard')}
        />
      </>
    );
  }

  // Authenticated Application Shell
  const renderPage = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case '/profile':
        return <ProfilePage />;
      case '/careers':
        return (
          <CareerRecommendationsPage
            onNavigate={navigate}
            onSelectDomainForAssessment={(dom) => setSelectedAssessmentDomain(dom)}
          />
        );
      case '/assessment':
        return (
          <AssessmentPage
            onNavigate={navigate}
          />
        );
      case '/careers/best-fit':
        return (
          <CareerRecommendationsPage
            onNavigate={navigate}
          />
        );
      case '/roadmap':
        return <RoadmapPage onNavigate={navigate} />;
      case '/jobs':
        return (
          <JobsPage
            onNavigate={navigate}
            onSelectRoleForGap={(roleId) => setSelectedRoleForGap(roleId)}
          />
        );
      case '/skill-gap':
        return (
          <SkillGapPage
            onNavigate={navigate}
            targetRoleIdentifier={selectedRoleForGap}
            onFilterResourceBySkill={(sk) => setResourceSkillFilter(sk)}
          />
        );
      case '/resume-ats':
        return <AtsResumePage />;
      case '/resources':
        return <ResourcesPage initialSkillFilter={resourceSkillFilter} />;
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <>
      <AppLayout currentRoute={currentRoute} onNavigate={navigate}>
        {renderPage()}
      </AppLayout>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
