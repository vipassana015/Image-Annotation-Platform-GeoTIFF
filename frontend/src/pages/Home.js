import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function ContactModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box contact-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>âœ•</button>
        <h3>CONTACT US</h3>
        <p className="modal-sub">Reach out to Vasundharaa Geo Technologies</p>
        <div className="contact-grid">
          <div className="contact-item">
            <span className="contact-icon">ðŸŒ</span>
            <div>
              <div className="contact-label">Website</div>
              <a href="https://vasundharaa.in" target="_blank" rel="noreferrer">vasundharaa.in</a>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">ðŸ“§</span>
            <div>
              <div className="contact-label">Email</div>
              <a href="mailto:info@vasundharaa.in">info@vasundharaa.in</a>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">ðŸ“</span>
            <div>
              <div className="contact-label">Location</div>
              <span>Pune, Maharashtra, India</span>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">ðŸ¢</span>
            <div>
              <div className="contact-label">Industry</div>
              <span>Geospatial Technology & AI</span>
            </div>
          </div>
        </div>
        <a href="https://vasundharaa.in" target="_blank" rel="noreferrer" className="modal-btn-link">
          Visit Website â†’
        </a>
      </div>
    </div>
  );
}

function AboutModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box about-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>âœ•</button>
        <div className="about-logo-wrap">
          <img
            src="https://vasundharaa.in/wp-content/uploads/2023/01/Vasundharaa-Logo.png"
            alt="Vasundharaa Logo"
            className="about-logo"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
        <h3>ABOUT THIS PROJECT</h3>
        <p className="modal-sub">Image Annotation Tool â€” Vasundharaa Geo Technologies Pvt. Ltd.</p>
        <div className="about-sections">
          <div className="about-block">
            <div className="about-block-title">What is Annonate?</div>
            <div className="about-block-text">
              A secure, web-based image annotation platform designed for AI teams to efficiently create,
              manage, and export annotated datasets. Built with React + Django + PostgreSQL (PostGIS).
            </div>
          </div>
          <div className="about-block">
            <div className="about-block-title">Key Features</div>
            <div className="about-tags">
              <span className="atag">Bounding Box</span>
              <span className="atag">Polygon</span>
              <span className="atag">YOLO Export</span>
              <span className="atag">COCO Export</span>
              <span className="atag">GeoTIFF Support</span>
              <span className="atag">Role-Based Access</span>
              <span className="atag">JWT Auth</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrame;
    const dots = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0 || d.x > canvas.width) d.dx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.dy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${d.opacity})`;
        ctx.fill();
      });
      dots.forEach((d, i) => {
        dots.slice(i + 1).forEach(d2 => {
          const dist = Math.hypot(d.x - d2.x, d.y - d2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="home-root">
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      <canvas ref={canvasRef} className="home-canvas" />

      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-brand">
          <span className="brand-dot" />
          Annonate
        </div>
        <div className="home-nav-links">
          <a href="#contact" onClick={e => { e.preventDefault(); setShowContact(true); }}>CONTACT US</a>
          <a href="#about" onClick={e => { e.preventDefault(); setShowAbout(true); }}>ABOUT US</a>
        </div>
      </nav>

      {/* Hero */}
      <main className="home-hero">
        <div className="home-hero-inner">
          <span className="home-badge">AI / ANNOTATION TOOL</span>

          <h1 className="home-title">
            HELPING LEADING<br />
            <span className="home-title-accent">AI TEAMS</span> ANNOTATE<br />
            SMARTER, FASTER,<br />AND BETTER.
          </h1>

          <p className="home-tagline">â€” ANNOTATE WITH EASE â€”</p>

          <div className="home-actions">
            <button className="home-btn-primary" onClick={() => navigate('/signup')}>
              SIGN UP <span className="btn-arrow"></span>
            </button>
            <button className="home-btn-secondary" onClick={() => navigate('/login')}>
              SIGN IN
            </button>
          </div>

          {/* Vasundharaa sponsor badge */}
          <div className="sponsor-badge">
            <span className="sponsor-label"></span>
            <a href="https://vasundharaa.in" target="_blank" rel="noreferrer" className="sponsor-link">
              <img
                src="https://vasundharaa.in/wp-content/uploads/2023/01/Vasundharaa-Logo.png"
                alt="Vasundharaa Geo Technologies"
                className="sponsor-logo"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
              <span style={{ display: 'none', color: 'var(--accent)', fontFamily: 'Space Mono', fontSize: '13px' }}>
                Vasundharaa Geo Technologies
              </span>
            </a>
          </div>
        </div>
        

        <div className="home-hero-visual">
          <div className="visual-box">
            <div className="visual-label">IMAGE ANNOTATION</div>
            <div className="visual-img-frame">
              <div className="bbox bbox-1" />
              <div className="bbox bbox-2" />
              <div className="bbox bbox-3" />
              <div className="visual-crosshair" />
            </div>
            <div className="visual-tags">
              <span className="vtag">person</span>
              <span className="vtag vtag-blue">vehicle</span>
              <span className="vtag vtag-green">object</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <span>Privacy Policy</span>
        <span>Â© 2025 Annonate. All rights reserved.</span>
        <span>Copyright@www</span>
      </footer>
    </div>
  );
}

export default Home;