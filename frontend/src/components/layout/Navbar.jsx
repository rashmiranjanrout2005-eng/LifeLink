import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { HeartPulse, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserHomePath } from '../../utils/authRedirect';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollProgressRef = useRef(null);

  useEffect(() => {
    let frameId = null;
    const updateScrollProgress = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
        scrollProgressRef.current?.style.setProperty('--scroll-progress', progress);
      });
    };
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Unable to sign out:', error.message);
    }
  };

  return (
    <header className="navbar">
      <span ref={scrollProgressRef} className="scroll-progress" aria-hidden="true" />
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="LifeLink home">
          <span className="brand-mark"><HeartPulse size={21} /></span>
          <span className="brand-copy">LifeLink<small>Blood care network</small></span>
        </Link>
        <nav className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <Link to="/">Home</Link>
          <Link to="/find-donors">Find Donors</Link>
          <Link to="/blood-availability">Blood Availability</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <Link to={getUserHomePath(user)} className="nav-login">My account</Link>
              <button className="nav-user" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">Sign in</Link>
              <Link to="/register" className="btn btn-primary nav-register">Create account <span>↗</span></Link>
            </>
          )}
        </div>
        <button className="mobile-menu" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </header>
  );
}
