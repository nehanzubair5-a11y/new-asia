import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth.ts';
import LoginPage from './components/pages/LoginPage.tsx';
import DashboardLayout from './components/DashboardLayout.tsx';
import DealerDashboardLayout from './components/DealerDashboardLayout.tsx';
import { useAppContext } from './hooks/useAppContext.ts';
import PendingApprovalPage from './components/pages/PendingApprovalPage.tsx';
import DealerRegistrationPage from './components/pages/DealerRegistrationPage.tsx';
import { useData } from './hooks/useData.ts';

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { dealers } = useData();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (!isAuthenticated) {
    if (authView === 'login') {
      return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
    }
    return <DealerRegistrationPage onSwitchToLogin={() => setAuthView('login')} />;
  }

  if (user?.role === 'Dealer') {
    const dealerInfo = dealers.find(d => d._id === user.dealerId);
    if (dealerInfo?.registrationApproved) {
        return <DealerDashboardLayout />;
    }
    return <PendingApprovalPage />;
  }

  return <DashboardLayout />;
};

export default App;
