import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTenants } from '../../api/tenantsApi';
import { Tenant, TenantStatus } from '../../packages/shared/types';
import { format } from 'date-fns';
import { StatusBadge } from '../shared/StatusBadge';

export const TenantsView: React.FC = () => {
    const { data: tenants, isLoading, error } = useQuery({ queryKey: ['tenants'], queryFn: getTenants });
    const tenantList = Array.isArray(tenants) ? tenants : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold text-neutral">Tenant Management</h2>
                <button className="px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-80">
                    Add New Tenant
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Tenant Name</th>
                                <th scope="col" className="px-6 py-3">Contact</th>
                                <th scope="col" className="px-6 py-3">Plan</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Date Joined</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && <tr><td colSpan={6} className="text-center py-4">Loading tenants...</td></tr>}
                            {error && <tr><td colSpan={6} className="text-center py-4 text-red-500">Error loading tenants.</td></tr>}
                            {tenantList.map((tenant: Tenant) => {
                                let formattedDate = '';
                                try {
                                    formattedDate = tenant.createdAt ? format(new Date(tenant.createdAt), 'MMM d, yyyy') : 'N/A';
                                } catch {
                                    formattedDate = String(tenant.createdAt || 'N/A');
                                }

                                return (
                                    <tr key={tenant.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{tenant.name}</td>
                                        <td className="px-6 py-4">{tenant.email}</td>
                                        <td className="px-6 py-4">{tenant.subscriptionPlan}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={tenant.status as TenantStatus} />
                                        </td>
                                        <td className="px-6 py-4">{formattedDate}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="font-medium text-primary hover:underline">Manage</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden">
                    <ul className="divide-y divide-gray-200">
                        {isLoading && <li className="p-4 text-center">Loading tenants...</li>}
                        {error && <li className="p-4 text-center text-red-500">Error loading tenants.</li>}
                        {tenantList.map((tenant: Tenant) => {
                            let formattedDate = '';
                            try {
                                formattedDate = tenant.createdAt ? format(new Date(tenant.createdAt), 'MMM d, yyyy') : 'N/A';
                            } catch {
                                formattedDate = String(tenant.createdAt || 'N/A');
                            }

                            return (
                                <li key={tenant.id} className="p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-neutral">{tenant.name}</p>
                                        <StatusBadge status={tenant.status as TenantStatus} />
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p><span className="font-semibold">Contact:</span> {tenant.email}</p>
                                        <p><span className="font-semibold">Plan:</span> {tenant.subscriptionPlan}</p>
                                        <p><span className="font-semibold">Joined:</span> {formattedDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <button className="font-medium text-primary hover:underline">Manage</button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};
