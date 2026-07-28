import React, { useState } from 'react';
import { MoneyProvider, useMoney } from './context/MoneyContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AIAssistantView } from './components/AIAssistantView';
import { DebtManagerView } from './components/DebtManagerView';
import { SavingsView } from './components/SavingsView';
import { BudgetView } from './components/BudgetView';
import { ReportsView } from './components/ReportsView';
import { AccountsView } from './components/AccountsView';
import { AdminPanelView } from './components/AdminPanelView';
import { ProfileView } from './components/ProfileView';
import { AuthView } from './components/AuthView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { TransferModal } from './components/TransferModal';
import { SearchModal } from './components/SearchModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { TransactionType } from './types';

function MainAppContent() {
  const { isSplashActive, dismissSplash, activeTab, currentTheme, currentUser } = useMoney();

  const [addModalType, setAddModalType] = useState<TransactionType | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (isSplashActive) {
    return <SplashScreen onDismiss={dismissSplash} />;
  }

  if (!currentUser || activeTab === 'auth') {
    return (
      <div className={`min-h-screen ${currentTheme.bgClass} flex flex-col font-sans antialiased transition-colors duration-300`}>
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <PWAInstallBanner />
          <AuthView />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bgClass} flex flex-col font-sans antialiased transition-colors duration-300 selection:bg-emerald-500 selection:text-slate-950`}>
      {/* Top Header Navigation */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenTransfer={() => setIsTransferOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <PWAInstallBanner />
        {activeTab === 'home' && (
          <DashboardView
            onOpenAddModal={(type) => setAddModalType(type)}
            onOpenTransferModal={() => setIsTransferOpen(true)}
          />
        )}
        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenAddModal={(type) => setAddModalType(type)}
            onOpenTransferModal={() => setIsTransferOpen(true)}
          />
        )}
        {activeTab === 'ai' && <AIAssistantView />}
        {activeTab === 'debt' && <DebtManagerView />}
        {activeTab === 'savings' && <SavingsView />}
        {activeTab === 'budget' && <BudgetView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'admin' && <AdminPanelView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Glassmorphic Bottom Navigation */}
      <BottomNav />

      {/* Add Transaction Modal */}
      {addModalType && (
        <AddTransactionModal
          initialType={addModalType}
          onClose={() => setAddModalType(null)}
        />
      )}

      {/* Balance Transfer Modal */}
      {isTransferOpen && <TransferModal onClose={() => setIsTransferOpen(false)} />}

      {/* Search Modal */}
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <MoneyProvider>
      <MainAppContent />
    </MoneyProvider>
  );
}
