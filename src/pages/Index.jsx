import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/api";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import WorkflowSection from "@/components/landing/WorkflowSection";
import WhyCodeForge from "@/components/landing/WhyCodeForge";
import TechnologySection from "@/components/landing/TechnologySection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";
/**
 * Public landing page. Authenticated users are sent straight to their
 * projects dashboard; everyone else sees the marketing surface.
 * Auth/routing logic is unchanged from the previous redirect-only version —
 * we just render the landing instead of bouncing to /login.
 */
const Index = () => {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/projects", { replace: true });
        }
        else {
            setReady(true);
        }
    }, [navigate]);
    if (!ready) {
        return <div className="min-h-screen" style={{ background: "#0A0D12" }}/>;
    }
    return (<div className="landing-scope">
      <LandingNav />
      <main>
        <Hero />
        <WorkflowSection />
        <WhyCodeForge />
        <TechnologySection />
        <ArchitectureSection />
        <FeaturesSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>);
};
export default Index;
