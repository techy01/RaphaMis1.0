
import React from 'react';

interface CardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    change?: string;
    changeType?: 'increase' | 'decrease';
    children?: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, value, icon, change, changeType, children, className = '' }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg hover:-translate-y-1 ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <p className="text-2xl font-bold text-neutral mt-1">{value}</p>
                    {change && (
                        <p className={`text-xs mt-2 flex items-center ${changeColor}`}>
                            {changeType === 'increase' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                </svg>
                            )}
                            {change}
                        </p>
                    )}
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    {icon}
                </div>
            </div>
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
};
