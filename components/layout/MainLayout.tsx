import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ExchangeRatesModal } from '../currency/ExchangeRatesModal';
import { DepartmentNotificationToast } from '../notifications/DepartmentNotificationToast';
import { CrossDepartmentHandoffModal } from '../notifications/CrossDepartmentHandoffModal';
import { OfflineSyncModal } from '../offline/OfflineSyncModal';

export const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100 lg:static">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-y-auto lg:pl-64">
                <Header />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
            <ExchangeRatesModal />
            <DepartmentNotificationToast />
            <CrossDepartmentHandoffModal />
            <OfflineSyncModal />
        </div>
    );
};
