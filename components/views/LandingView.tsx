import React, { useState } from 'react';
import { LandingNavbar } from '../landing/LandingNavbar';
import { HeroSection } from '../landing/HeroSection';
import { FeaturesSection } from '../landing/FeaturesSection';
import { WhyUsSection } from '../landing/WhyUsSection';
import { PricingSection } from '../landing/PricingSection';
import { FaqSection } from '../landing/FaqSection';
import { ContactSection } from '../landing/ContactSection';
import { LandingFooter } from '../landing/LandingFooter';
import { CookieConsentBanner } from '../landing/CookieConsentBanner';
import { LegalPoliciesModal } from '../legal/LegalPoliciesModal';
import { DemoRequestModal } from '../landing/DemoRequestModal';
import { SubscriptionCheckoutModal } from '../subscription/SubscriptionCheckoutModal';
import { SubscriptionTier } from '../../packages/shared/types';

export const LandingView: React.FC = () => {
    const [demoModalOpen, setDemoModalOpen] = useState(false);
    const [policyModalOpen, setPolicyModalOpen] = useState(false);
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('Starter Clinic');
    const [activePolicyTab, setActivePolicyTab] = useState<'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa'>('terms');

    const handleOpenPolicy = (tab: 'terms' | 'privacy' | 'cookies' | 'disclaimer' | 'baa') => {
        setActivePolicyTab(tab);
        setPolicyModalOpen(true);
    };

    const handleOpenCheckout = (tierName?: string) => {
        if (tierName === 'Hospital Standard') {
            setSelectedTier('Community Hospital');
        } else if (tierName === 'Enterprise Network') {
            setSelectedTier('Enterprise Health System');
        } else {
            setSelectedTier('Starter Clinic');
        }
        setCheckoutModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Sticky Navigation */}
            <LandingNavbar
                onOpenDemoModal={() => setDemoModalOpen(true)}
                onOpenPolicyModal={handleOpenPolicy}
                onOpenSubscriptionCheckout={() => handleOpenCheckout()}
            />

            {/* Minimalist, High-Focus Landing Flow */}
            <main>
                <HeroSection
                    onOpenDemoModal={() => setDemoModalOpen(true)}
                />

                <FeaturesSection
                    onOpenDemoModal={() => setDemoModalOpen(true)}
                />

                <WhyUsSection
                    onOpenDemoModal={() => setDemoModalOpen(true)}
                />

                <PricingSection
                    onOpenDemoModal={() => setDemoModalOpen(true)}
                    onOpenSubscriptionCheckout={(tier) => handleOpenCheckout(tier)}
                />

                <FaqSection
                    onOpenPolicyModal={handleOpenPolicy}
                />

                <ContactSection />
            </main>

            {/* Clean Corporate & Legal Footer */}
            <LandingFooter
                onOpenPolicyModal={handleOpenPolicy}
                onOpenDemoModal={() => setDemoModalOpen(true)}
            />

            {/* Minimal Cookie Consent */}
            <CookieConsentBanner
                onOpenPolicy={(tab) => handleOpenPolicy(tab)}
            />

            {/* Clean Demo Walkthrough Modal */}
            <DemoRequestModal
                isOpen={demoModalOpen}
                onClose={() => setDemoModalOpen(false)}
            />

            {/* Comprehensive Legal Protections & SaaS Policies Modal */}
            <LegalPoliciesModal
                isOpen={policyModalOpen}
                onClose={() => setPolicyModalOpen(false)}
                initialTab={activePolicyTab}
            />

            {/* School / Institutional Multi-Channel Subscription Checkout */}
            <SubscriptionCheckoutModal
                isOpen={checkoutModalOpen}
                onClose={() => setCheckoutModalOpen(false)}
                initialTier={selectedTier}
            />
        </div>
    );
};
