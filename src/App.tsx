import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { OverviewPage } from '@/pages/Overview';
import { AssetsListPage } from '@/pages/Assets/List';
import { AssetFormPage } from '@/pages/Assets/Form';
import { AssetDetailPage } from '@/pages/Assets/Detail';
import { LiabilitiesListPage } from '@/pages/Liabilities/List';
import { LiabilityFormPage } from '@/pages/Liabilities/Form';
import { LiabilityDetailPage } from '@/pages/Liabilities/Detail';
import { ProfilePage } from '@/pages/Profile';
import { ReportPage } from '@/pages/Profile/Report';
import { SettingsPage } from '@/pages/Profile/Settings';
import { SandboxIndexPage } from '@/pages/Sandbox/Index';
import { SandboxFreedomPage } from '@/pages/Sandbox/Freedom';
import { SandboxMilestonesPage } from '@/pages/Sandbox/Milestones';
import { BottomNav } from '@/components/layout/BottomNav';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';

const AutoSnapshot = () => {
  const checkAndCreateMonthlySnapshot = useStore((s) => s.checkAndCreateMonthlySnapshot);
  const autoSnapshot = useStore((s) => s.settings.autoSnapshot);
  useEffect(() => {
    if (autoSnapshot) {
      checkAndCreateMonthlySnapshot();
    }
  }, [autoSnapshot, checkAndCreateMonthlySnapshot]);
  return null;
};

const NavWrapper = () => {
  const location = useLocation();
  const mainPaths = ['/', '/assets', '/liabilities', '/sandbox', '/profile'];
  const showNav = mainPaths.includes(location.pathname);
  return showNav ? <BottomNav /> : null;
};

export default function App() {
  return (
    <Router>
      <AutoSnapshot />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/assets" element={<AssetsListPage />} />
          <Route path="/assets/add" element={<AssetFormPage />} />
          <Route path="/assets/:id" element={<AssetDetailPage />} />
          <Route path="/assets/edit/:id" element={<AssetFormPage />} />
          <Route path="/liabilities" element={<LiabilitiesListPage />} />
          <Route path="/liabilities/add" element={<LiabilityFormPage />} />
          <Route path="/liabilities/:id" element={<LiabilityDetailPage />} />
          <Route path="/liabilities/edit/:id" element={<LiabilityFormPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/report" element={<ReportPage />} />
          <Route path="/profile/settings" element={<SettingsPage />} />
          <Route path="/sandbox" element={<SandboxIndexPage />} />
          <Route path="/sandbox/freedom" element={<SandboxFreedomPage />} />
          <Route path="/sandbox/milestones" element={<SandboxMilestonesPage />} />
        </Routes>
        <NavWrapper />
      </div>
    </Router>
  );
}
