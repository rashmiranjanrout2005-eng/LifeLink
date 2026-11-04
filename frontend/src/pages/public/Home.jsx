import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowDown, ArrowRight, Clock3, Droplets, Heart, MapPin, ShieldCheck, Users } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { getPublicData } from '../../services/publicApi';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const initialInventory = bloodGroups.map((bloodGroup) => ({ bloodGroup, units: 0 }));

export default function Home() {
  const [inventory, setInventory] = useState(initialInventory);
  const [inventoryState, setInventoryState] = useState('loading');
  const heroArtRef = useRef(null);
  const pointerFrameRef = useRef(null);
  const pointerPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let active = true;

    getPublicData('/inventory/availability')
      .then((data) => {
        if (!active) return;
        const available = Array.isArray(data?.data) ? data.data : [];
        setInventory(bloodGroups.map((bloodGroup) => ({
          bloodGroup,
          units: available.find((item) => item.bloodGroup === bloodGroup)?.units ?? 0
        })));
        setInventoryState(data?.demo ? 'demo' : 'live');
      })
      .catch(() => {
        if (active) setInventoryState('unavailable');
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const revealTargets = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -36px 0px' });
    revealTargets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const handleHeroPointerMove = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    pointerPositionRef.current = { x: event.clientX, y: event.clientY };
    if (pointerFrameRef.current !== null) return;
    pointerFrameRef.current = window.requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      const bounds = heroArtRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const x = (pointerPositionRef.current.x - bounds.left) / bounds.width - 0.5;
      const y = (pointerPositionRef.current.y - bounds.top) / bounds.height - 0.5;
      heroArtRef.current.style.setProperty('--pointer-x', `${x.toFixed(3)}`);
      heroArtRef.current.style.setProperty('--pointer-y', `${y.toFixed(3)}`);
    });
  };

  const resetHeroPointer = () => {
    if (pointerFrameRef.current !== null) {
      window.cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = null;
    }
    heroArtRef.current?.style.setProperty('--pointer-x', '0');
    heroArtRef.current?.style.setProperty('--pointer-y', '0');
  };

  return (
    <>
      <Navbar />
      <main>
        <section className="home-hero">
          <div className="hero-glow hero-glow-a" />
          <div className="hero-glow hero-glow-b" />
          <div className="hero-particles" aria-hidden="true">
            <span className="hero-particle particle-one" /><span className="hero-particle particle-two" />
            <span className="hero-particle particle-three" /><span className="hero-particle particle-four" />
            <span className="hero-cross cross-one">+</span><span className="hero-cross cross-two">+</span>
          </div>
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow hero-eyebrow"><span className="live-dot" /> THE LIFELINK COMMUNITY</span>
              <h1>When it matters most,<br />we <span>show up.</span></h1>
              <p className="hero-lead">A nearby donor can change everything. Find blood, reach real people, and bring help closer—one connection at a time.</p>
              <div className="button-row hero-actions">
                <Link to="/find-donors" className="btn btn-primary hero-cta">Find a donor <ArrowRight size={18} /></Link>
                <Link to="/become-donor" className="btn btn-glass"><Heart size={17} /> Become a donor</Link>
              </div>
              <div className="hero-proof">
                <div className="proof-avatars" aria-hidden="true"><span>R</span><span>A</span><span>S</span><span><Heart size={13} fill="currentColor" /></span></div>
                <p><strong>Every connection counts.</strong><br />Be part of someone's next chapter.</p>
              </div>
            </div>
            <div className="hero-art" ref={heroArtRef} onPointerMove={handleHeroPointerMove} onPointerLeave={resetHeroPointer} aria-label="Blood donation illustration">
              <div className="art-ring art-ring-one" />
              <div className="art-ring art-ring-two" />
              <div className="art-orbit"><span className="orbit-bead" /><span className="orbit-heart"><Heart size={13} fill="currentColor" /></span></div>
              <div className="hero-art-image"><img src="/images/hero-image.svg" alt="" fetchPriority="high" decoding="async" /></div>
              <div className="floating-card floating-card-top"><span className="float-icon"><Activity size={17} /></span><span><strong>Help, made closer</strong><small>Find donors in your area</small></span><ArrowRight size={16} /></div>
              <div className="floating-card floating-card-bottom"><span className="float-icon float-icon-red"><Droplets size={18} /></span><span><strong>Blood availability</strong><small>Check stock listings</small></span><span className="float-live">VIEW</span></div>
              <div className="art-sparkle sparkle-one">✳</div><div className="art-sparkle sparkle-two">✦</div>
              <svg className="heartbeat-line" viewBox="0 0 280 60" fill="none" aria-hidden="true"><path d="M2 32h68l16-1 12-17 18 34 15-24 13 8h133" /></svg>
            </div>
          </div>
          <a className="scroll-cue" href="#availability"><span>EXPLORE</span><ArrowDown size={14} /></a>
        </section>

        <section className="trust-strip" aria-label="Our commitments" data-reveal>
          <div className="container trust-strip-inner">
            <div><ShieldCheck size={18} /><span>Privacy comes first</span></div>
            <div><MapPin size={18} /><span>Community-focused search</span></div>
            <div><Clock3 size={18} /><span>Built for urgent moments</span></div>
          </div>
        </section>

        <section className="section availability-section" id="availability" data-reveal>
          <div className="container">
            <div className="section-heading-row">
              <div><span className="eyebrow section-eyebrow">KNOW WHAT'S AVAILABLE</span><h2>Blood availability</h2><p>Check blood group stock before you make the next move.</p></div>
              <Link to="/blood-availability" className="text-link">View all availability <ArrowRight size={16} /></Link>
            </div>
            <div className="availability-grid">
              {inventory.map(({ bloodGroup, units }, index) => (
                <article className="blood-card" key={bloodGroup} style={{ '--card-index': index }}>
                  <div className="blood-card-top"><span className="blood-drop"><Droplets size={18} /></span><span className={`stock-status ${inventoryState === 'live' ? 'is-live' : ''}`}><i />{inventoryState === 'live' ? 'Updated' : inventoryState === 'demo' ? 'Demo data' : inventoryState === 'loading' ? 'Loading' : 'Offline'}</span></div>
                  <span className="blood-type">{bloodGroup}</span>
                  <div className="blood-stock">{inventoryState === 'loading' ? '—' : units}<span>units</span></div>
                  <div className="stock-track"><span style={{ width: `${inventoryState === 'live' ? Math.min(units * 4, 100) : 0}%` }} /></div>
                </article>
              ))}
            </div>
            {inventoryState === 'unavailable' && <p className="availability-note">Inventory service is offline. Showing no live stock values—please try again later.</p>}
            {inventoryState === 'demo' && <p className="availability-note">Demo inventory is sample data. Connect your Supabase project to display real stock.</p>}
          </div>
        </section>

        <section className="section steps-section" data-reveal>
          <div className="container">
            <div className="section-heading centered-heading">
              <span className="eyebrow section-eyebrow">HOW LIFELINK WORKS</span>
              <h2>Small steps. <span>Life-changing</span> outcomes.</h2>
              <p>From the first search to the moment help arrives, every step is designed to make it easier to act.</p>
            </div>
            <div className="steps-grid">
              <article className="step-card" data-reveal style={{ '--reveal-delay': '0ms' }}><span className="step-number">01</span><span className="step-icon"><Users size={21} /></span><h3>Find your people</h3><p>Search by blood group and location to discover potential donors near you.</p><Link to="/find-donors">Search donors <ArrowRight size={15} /></Link></article>
              <article className="step-card step-card-highlight" data-reveal style={{ '--reveal-delay': '120ms' }}><span className="step-number">02</span><span className="step-icon"><Droplets size={21} /></span><h3>Make a request</h3><p>Share what is needed and keep the request status connected to your account.</p><Link to="/hospital/request-blood">Request blood <ArrowRight size={15} /></Link></article>
              <article className="step-card" data-reveal style={{ '--reveal-delay': '240ms' }}><span className="step-number">03</span><span className="step-icon"><Heart size={21} /></span><h3>Be someone's hope</h3><p>Donate when you can, and keep the circle of care moving forward.</p><Link to="/become-donor">Become a donor <ArrowRight size={15} /></Link></article>
            </div>
          </div>
        </section>

        <section className="community-cta" data-reveal>
          <div className="container community-cta-inner">
            <div className="cta-heart"><Heart size={25} fill="currentColor" /></div>
            <div><span className="eyebrow">BROWSING IS ALWAYS OPEN</span><h2>Make an account when you're ready to take part.</h2><p>Search public blood availability anytime. Sign in to save your donor profile or follow a blood request.</p></div>
            <Link to="/register" className="btn btn-light">Create account <ArrowRight size={17} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
