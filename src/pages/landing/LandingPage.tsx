import * as React from 'react'
import { Link } from 'react-router-dom'

const LANDING_STYLES = String.raw`
.landing-root {
  --navy: #080f1c;
  --navy-2: #0c1628;
  --surface: #111c2d;
  --card: #162035;
  --card-2: #1a2640;
  --cyan: #00d4ff;
  --cyan-dim: #0099b8;
  --cyan-glow: rgba(0,212,255,0.15);
  --red: #e63946;
  --green: #2ec4b6;
  --amber: #f4a261;
  --text-1: #f0f4f8;
  --text-2: #8ba3be;
  --text-3: #4a6580;
  --border: rgba(0,212,255,0.12);
  --border-dim: rgba(255,255,255,0.06);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  position: relative;
  overflow-x: hidden;
  background: var(--navy);
  color: var(--text-1);
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.landing-root,
.landing-root * ,
.landing-root *::before,
.landing-root *::after {
  box-sizing: border-box;
}

.landing-root a {
  color: inherit;
  text-decoration: none;
}

.landing-root img,
.landing-root svg {
  display: block;
  max-width: 100%;
}

.landing-root button {
  cursor: pointer;
  font: inherit;
  border: none;
  background: none;
}

.landing-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.025;
  pointer-events: none;
  z-index: 0;
}

.landing-root nav.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(8,15,28,0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-dim);
  transition: all 0.3s ease;
}

.landing-root .nav-logo { display: flex; align-items: center; gap: 0.75rem; }
.landing-root .nav-logo svg { width: 32px; height: 32px; }
.landing-root .nav-logo-text { font-size: 0.875rem; font-weight: 700; letter-spacing: -0.02em; }
.landing-root .nav-logo-text span { color: var(--cyan); }
.landing-root .nav-links { display: flex; align-items: center; gap: 2rem; }
.landing-root .nav-links a { font-size: 0.875rem; color: var(--text-2); transition: color 0.2s; }
.landing-root .nav-links a:hover { color: var(--text-1); }
.landing-root .nav-cta { display: flex; align-items: center; gap: 0.75rem; }
.landing-root .btn-ghost {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-2);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}
.landing-root .btn-ghost:hover { color: var(--text-1); background: var(--card); }
.landing-root .btn-primary {
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--navy);
  background: var(--cyan);
  border-radius: var(--radius-md);
  transition: all 0.2s;
  white-space: nowrap;
}
.landing-root .btn-primary:hover { background: #33ddff; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,212,255,0.3); }
.landing-root .btn-primary-lg {
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--navy);
  background: var(--cyan);
  border-radius: var(--radius-lg);
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}
.landing-root .btn-primary-lg:hover { background: #33ddff; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,212,255,0.4); }
.landing-root .btn-outline-lg {
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--cyan);
  background: transparent;
  border: 1px solid var(--cyan);
  border-radius: var(--radius-lg);
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}
.landing-root .btn-outline-lg:hover { background: var(--cyan-glow); transform: translateY(-2px); }
.landing-root .hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(80px + 4rem) 2rem 4rem;
  position: relative;
  overflow: hidden;
  text-align: center;
}
.landing-root .hero-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%);
}
.landing-root .hero-glow {
  position: absolute;
  width: 800px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%);
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}
.landing-root .hero-content { position: relative; z-index: 1; max-width: 900px; }
.landing-root .hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0,212,255,0.1);
  border: 1px solid rgba(0,212,255,0.25);
  border-radius: 999px;
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  color: var(--cyan);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}
.landing-root .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); animation: pulse-dot 2s infinite; }
@keyframes pulse-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
.landing-root .hero h1 { font-size: clamp(2.8rem, 1rem + 5.5vw, 6rem); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 1.5rem; color: var(--text-1); }
.landing-root .hero h1 .highlight { background: linear-gradient(135deg, var(--cyan) 0%, #7af3ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.landing-root .hero p { font-size: 1.125rem; color: var(--text-2); max-width: 620px; margin: 0 auto 2.5rem; line-height: 1.7; }
.landing-root .hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3rem; }
.landing-root .hero-trust { display: flex; align-items: center; gap: 1rem; justify-content: center; font-size: 0.75rem; color: var(--text-3); flex-wrap: wrap; }
.landing-root .hero-trust-divider { width: 1px; height: 16px; background: var(--text-3); opacity: 0.4; }
.landing-root .hero-mockup { margin-top: 4rem; position: relative; max-width: 1000px; margin-left: auto; margin-right: auto; }
.landing-root .mockup-frame { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; box-shadow: 0 0 0 1px rgba(0,212,255,0.05), 0 24px 80px rgba(0,0,0,0.6), 0 0 120px rgba(0,212,255,0.06); }
.landing-root .mockup-topbar { background: var(--navy-2); padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--border-dim); }
.landing-root .mockup-dots { display: flex; gap: 6px; }
.landing-root .mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
.landing-root .mockup-dot.red { background: #ff5f57; }
.landing-root .mockup-dot.amber { background: #febc2e; }
.landing-root .mockup-dot.green { background: #28c840; }
.landing-root .mockup-url { flex: 1; background: rgba(255,255,255,0.05); border-radius: var(--radius-sm); padding: 0.25rem 0.75rem; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; color: var(--text-3); text-align: center; }
.landing-root .mockup-body { display: flex; min-height: 420px; }
.landing-root .mockup-sidebar { width: 200px; min-width: 200px; background: var(--navy-2); border-right: 1px solid var(--border-dim); padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.landing-root .mockup-sidebar-logo { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.5rem 1rem; border-bottom: 1px solid var(--border-dim); margin-bottom: 0.5rem; }
.landing-root .mockup-logo-dot { width: 24px; height: 24px; background: var(--cyan); border-radius: 6px; flex-shrink: 0; }
.landing-root .mockup-logo-text { font-size: 0.75rem; font-weight: 700; color: var(--text-1); }
.landing-root .mockup-nav-item { padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; color: var(--text-3); display: flex; align-items: center; gap: 0.5rem; }
.landing-root .mockup-nav-item.active { background: rgba(0,212,255,0.1); color: var(--cyan); border-left: 2px solid var(--cyan); }
.landing-root .mockup-nav-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.landing-root .mockup-main { flex: 1; padding: 1.5rem; overflow: hidden; }
.landing-root .mockup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; }
.landing-root .mockup-title { font-size: 0.875rem; font-weight: 700; color: var(--text-1); }
.landing-root .mockup-subtitle { font-size: 0.75rem; color: var(--text-3); margin-top: 2px; }
.landing-root .mockup-badge-red { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; background: rgba(230,57,70,0.2); color: var(--red); border: 1px solid rgba(230,57,70,0.3); }
.landing-root .mockup-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 0.75rem; margin-bottom: 1rem; }
.landing-root .mockup-stat { background: var(--card-2); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 0.75rem; }
.landing-root .mockup-stat-label { font-size: 9px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
.landing-root .mockup-stat-value { font-size: 1.5rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
.landing-root .mockup-stat-value.cyan { color: var(--cyan); }
.landing-root .mockup-stat-value.red { color: var(--red); }
.landing-root .mockup-stat-value.green { color: var(--green); }
.landing-root .mockup-chart-area { background: var(--card-2); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 1rem; height: 120px; position: relative; overflow: hidden; }
.landing-root .mockup-chart-label { font-size: 9px; color: var(--text-3); margin-bottom: 0.5rem; }
.landing-root .mockup-chart-svg { width: 100%; height: 80px; }
.landing-root .mockup-ai-badge { position: absolute; bottom: 0.75rem; right: 0.75rem; padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 600; background: rgba(0,212,255,0.15); color: var(--cyan); border: 1px solid rgba(0,212,255,0.3); }
.landing-root .stats-strip { border-top: 1px solid var(--border-dim); border-bottom: 1px solid var(--border-dim); padding: 2.5rem 2rem; display: grid; grid-template-columns: repeat(4,1fr); gap: 2rem; max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }
.landing-root .stat-item { text-align: center; }
.landing-root .stat-num { font-size: clamp(2rem, 1.2rem + 2.5vw, 3.5rem); font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--cyan); letter-spacing: -0.04em; margin-bottom: 0.5rem; }
.landing-root .stat-label { font-size: 0.875rem; color: var(--text-2); }
.landing-root section { padding: 6rem 2rem; position: relative; z-index: 1; }
.landing-root .section-inner { max-width: 1100px; margin: 0 auto; }
.landing-root .section-label { font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; color: var(--cyan); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 1rem; display: block; }
.landing-root .section-title { font-size: clamp(2rem, 1.2rem + 2.5vw, 3.5rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1rem; }
.landing-root .section-sub { font-size: 1rem; color: var(--text-2); max-width: 560px; line-height: 1.7; margin-bottom: 3rem; }
.landing-root .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.landing-root .feature-card { background: var(--card); border: 1px solid var(--border-dim); border-radius: var(--radius-lg); padding: 2rem; transition: all 0.3s ease; position: relative; overflow: hidden; }
.landing-root .feature-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,212,255,0.04) 0%, transparent 60%); opacity: 0; transition: opacity 0.3s; }
.landing-root .feature-card:hover { border-color: var(--border); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.landing-root .feature-card:hover::before { opacity: 1; }
.landing-root .feature-icon { width: 48px; height: 48px; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 20px; }
.landing-root .feature-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; }
.landing-root .feature-desc { font-size: 0.875rem; color: var(--text-2); line-height: 1.7; }
.landing-root .feature-tag { display: inline-block; margin-top: 1rem; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: rgba(0,212,255,0.1); color: var(--cyan); border: 1px solid rgba(0,212,255,0.2); }
.landing-root .how-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; position: relative; }
.landing-root .how-steps::before { content: ''; position: absolute; top: 28px; left: calc(16.67% + 28px); right: calc(16.67% + 28px); height: 1px; background: linear-gradient(90deg, var(--cyan), transparent 50%, var(--cyan)); opacity: 0.3; }
.landing-root .how-step { text-align: center; }
.landing-root .how-step-num { width: 56px; height: 56px; border-radius: 50%; background: var(--card); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 1.125rem; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--cyan); position: relative; z-index: 1; }
.landing-root .how-step h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; }
.landing-root .how-step p { font-size: 0.875rem; color: var(--text-2); line-height: 1.7; }
.landing-root .ai-section { background: var(--navy-2); border-top: 1px solid var(--border-dim); border-bottom: 1px solid var(--border-dim); }
.landing-root .ai-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
.landing-root .ai-chat-mockup { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
.landing-root .ai-chat-header { background: var(--navy-2); padding: 1rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--border-dim); }
.landing-root .ai-chat-avatar { width: 32px; height: 32px; border-radius: 50%; background: rgba(0,212,255,0.2); border: 1px solid rgba(0,212,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px; }
.landing-root .ai-chat-name { font-size: 0.875rem; font-weight: 700; }
.landing-root .ai-chat-status { font-size: 11px; color: var(--green); display: flex; align-items: center; gap: 4px; }
.landing-root .ai-chat-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
.landing-root .ai-messages { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; min-height: 240px; }
.landing-root .ai-msg { display: flex; gap: 0.75rem; max-width: 90%; }
.landing-root .ai-msg.user { margin-left: auto; flex-direction: row-reverse; }
.landing-root .ai-msg-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.landing-root .ai-msg-avatar.bot { background: rgba(0,212,255,0.15); border: 1px solid rgba(0,212,255,0.2); }
.landing-root .ai-msg-avatar.human { background: rgba(46,196,182,0.15); border: 1px solid rgba(46,196,182,0.2); }
.landing-root .ai-msg-bubble { padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.75rem; line-height: 1.6; }
.landing-root .ai-msg-bubble.bot { background: var(--card-2); color: var(--text-2); border-bottom-left-radius: 4px; }
.landing-root .ai-msg-bubble.user { background: rgba(0,212,255,0.15); color: var(--cyan); border: 1px solid rgba(0,212,255,0.2); border-bottom-right-radius: 4px; }
.landing-root .ai-chat-input { padding: 1rem 1.5rem; border-top: 1px solid var(--border-dim); display: flex; gap: 0.75rem; align-items: center; }
.landing-root .ai-input-box { flex: 1; background: var(--card-2); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 0.75rem 1rem; font-size: 0.75rem; color: var(--text-3); font-family: 'Inter', sans-serif; }
.landing-root .ai-send-btn { width: 32px; height: 32px; background: var(--cyan); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.landing-root .testimonials-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
.landing-root .testimonial-card { background: var(--card); border: 1px solid var(--border-dim); border-radius: var(--radius-lg); padding: 2rem; }
.landing-root .testimonial-stars { color: var(--amber); font-size: 14px; margin-bottom: 1rem; letter-spacing: 2px; }
.landing-root .testimonial-quote { font-size: 0.875rem; color: var(--text-2); line-height: 1.8; margin-bottom: 1.5rem; font-style: italic; }
.landing-root .testimonial-author { display: flex; align-items: center; gap: 0.75rem; }
.landing-root .testimonial-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.875rem; flex-shrink: 0; }
.landing-root .testimonial-name { font-size: 0.875rem; font-weight: 600; }
.landing-root .testimonial-role { font-size: 0.75rem; color: var(--text-3); }
.landing-root #pricing { background: linear-gradient(180deg, var(--navy) 0%, var(--navy-2) 100%); }
.landing-root .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
.landing-root .pricing-card { background: var(--card); border: 1px solid var(--border-dim); border-radius: var(--radius-xl); padding: 2rem; position: relative; }
.landing-root .pricing-card.featured { background: linear-gradient(135deg, var(--card) 0%, rgba(0,212,255,0.06) 100%); border-color: rgba(0,212,255,0.4); box-shadow: 0 0 60px rgba(0,212,255,0.08); }
.landing-root .pricing-popular { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); padding: 0.25rem 1rem; background: var(--cyan); color: var(--navy); font-size: 0.75rem; font-weight: 800; border-radius: 999px; white-space: nowrap; letter-spacing: 0.04em; text-transform: uppercase; }
.landing-root .pricing-plan { font-size: 0.75rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
.landing-root .pricing-price { margin-bottom: 0.5rem; display: flex; align-items: baseline; gap: 0.25rem; }
.landing-root .pricing-currency { font-size: 1.125rem; font-weight: 700; color: var(--text-2); }
.landing-root .pricing-amount { font-size: clamp(2rem, 1.2rem + 2.5vw, 3.5rem); font-weight: 900; font-family: 'JetBrains Mono', monospace; letter-spacing: -0.04em; }
.landing-root .pricing-period { font-size: 0.875rem; color: var(--text-3); }
.landing-root .pricing-seats { font-size: 0.75rem; color: var(--text-3); margin-bottom: 1.5rem; }
.landing-root .pricing-divider { height: 1px; background: var(--border-dim); margin-bottom: 1.5rem; }
.landing-root .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
.landing-root .pricing-features li { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; }
.landing-root .pricing-check { color: var(--cyan); font-size: 14px; flex-shrink: 0; }
.landing-root .pricing-btn { display: block; width: 100%; padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 700; text-align: center; transition: all 0.2s; }
.landing-root .pricing-btn.primary { background: var(--cyan); color: var(--navy); }
.landing-root .pricing-btn.primary:hover { background: #33ddff; transform: translateY(-1px); }
.landing-root .pricing-btn.outline { border: 1px solid var(--border); color: var(--text-2); }
.landing-root .pricing-btn.outline:hover { border-color: var(--cyan); color: var(--cyan); }
.landing-root .cta-section { text-align: center; padding: 6rem 2rem; position: relative; overflow: hidden; }
.landing-root .cta-glow { position: absolute; width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-50%); }
.landing-root .cta-section h2 { font-size: clamp(2rem, 1.2rem + 2.5vw, 3.5rem); font-weight: 900; letter-spacing: -0.03em; margin-bottom: 1rem; }
.landing-root .cta-section p { font-size: 1rem; color: var(--text-2); max-width: 500px; margin: 0 auto 2.5rem; }
.landing-root .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.landing-root .cta-fine { margin-top: 1.5rem; font-size: 0.75rem; color: var(--text-3); }
.landing-root footer { border-top: 1px solid var(--border-dim); padding: 3rem 2rem 2rem; position: relative; z-index: 1; }
.landing-root .footer-inner { max-width: 1100px; margin: 0 auto; }
.landing-root .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
.landing-root .footer-brand-desc { font-size: 0.875rem; color: var(--text-3); margin-top: 1rem; max-width: 280px; line-height: 1.7; }
.landing-root .footer-col-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-2); margin-bottom: 1rem; }
.landing-root .footer-links { display: flex; flex-direction: column; gap: 0.75rem; }
.landing-root .footer-links a { font-size: 0.875rem; color: var(--text-3); transition: color 0.2s; }
.landing-root .footer-links a:hover { color: var(--text-1); }
.landing-root .footer-bottom { padding-top: 1.5rem; border-top: 1px solid var(--border-dim); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-3); gap: 1rem; }
.landing-root .footer-popia { display: flex; align-items: center; gap: 0.5rem; }
.landing-root .popia-badge { padding: 2px 8px; border-radius: 4px; background: rgba(46,196,182,0.1); color: var(--green); border: 1px solid rgba(46,196,182,0.2); font-size: 10px; font-weight: 700; }
.landing-root .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
.landing-root .reveal.visible { opacity: 1; transform: translateY(0); }
.landing-root .section-center { display: flex; flex-direction: column; gap: 25px; place-content: center; place-items: center; flex-grow: 1; }

@media (max-width: 768px) {
  .landing-root nav.landing-nav { padding: 0.75rem 1rem; }
  .landing-root .nav-links { display: none; }
  .landing-root .hero { padding: calc(70px + 2rem) 1rem 3rem; }
  .landing-root .stats-strip { grid-template-columns: repeat(2,1fr); padding: 2rem 1rem; }
  .landing-root section { padding: 4rem 1rem; }
  .landing-root .features-grid { grid-template-columns: 1fr; }
  .landing-root .how-steps { grid-template-columns: 1fr; }
  .landing-root .how-steps::before { display: none; }
  .landing-root .pricing-grid { grid-template-columns: 1fr; }
  .landing-root .testimonials-grid { grid-template-columns: 1fr; }
  .landing-root .ai-inner { grid-template-columns: 1fr; }
  .landing-root .footer-top { grid-template-columns: 1fr 1fr; gap: 2rem; }
  .landing-root .footer-bottom { flex-direction: column; align-items: flex-start; }
  .landing-root .mockup-sidebar { display: none; }
  .landing-root .mockup-stats { grid-template-columns: repeat(2,1fr); }
  .landing-root .mockup-body { min-height: auto; }
}
`

const LandingPage: React.FC = () => {
  React.useEffect(() => {
    const style = document.createElement('style')
    style.id = 'landing-styles'
    style.textContent = LANDING_STYLES
    document.head.appendChild(style)
    return () => {
      document.getElementById('landing-styles')?.remove()
    }
  }, [])

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

    const handleScroll = () => {
      const nav = document.querySelector('nav.landing-nav') as HTMLElement | null
      if (nav) {
        nav.style.background =
          window.scrollY > 40
            ? 'rgba(8,15,28,0.97)'
            : 'rgba(8,15,28,0.85)'
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="landing-root">
      <nav className="landing-nav">
        <div className="nav-logo">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="PhishGuard Pro">
            <path d="M16 2L4 7v9c0 7.18 5.15 13.89 12 15.5C22.85 29.89 28 23.18 28 16V7L16 2z" fill="rgba(0,212,255,0.15)" stroke="#00d4ff" strokeWidth="1.5" />
            <path d="M16 8l-6 2.5V16c0 3.9 2.8 7.55 6 8.5 3.2-.95 6-4.6 6-8.5v-5.5L16 8z" fill="rgba(0,212,255,0.2)" />
            <path d="M13 16l2 2 4-4" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 11.5c.5.3.8.5 1 .7" stroke="#e63946" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <line x1="20" y1="10" x2="23" y2="7" stroke="#e63946" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
          <span className="nav-logo-text">PhishGuard <span>Pro</span></span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#testimonials">Customers</a>
        </div>
        <div className="nav-cta">
          <Link to="/login" className="btn-ghost">Sign in</Link>
          <Link to="/register" className="btn-primary">Start free trial</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            SA-First Security Awareness Platform
          </div>
          <h1>Your staff are<br />one click away<br />from a <span className="highlight">breach.</span></h1>
          <p>PhishGuard Pro trains your South African team with real phishing simulations, AI-powered risk analysis, and instant security coaching — at a price SMBs can actually afford.</p>
          <div className="hero-cta">
            <Link to="/register" className="btn-primary-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              Start free 14-day trial
            </Link>
            <a href="#how-it-works" className="btn-outline-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
              See how it works
            </a>
          </div>
          <div className="hero-trust">
            <span>No credit card required</span>
            <div className="hero-trust-divider" />
            <span>POPIA compliant</span>
            <div className="hero-trust-divider" />
            <span>SA-hosted templates</span>
            <div className="hero-trust-divider" />
            <span>Cancel anytime</span>
          </div>

          <div className="hero-mockup reveal">
            <div className="mockup-frame">
              <div className="mockup-topbar">
                <div className="mockup-dots">
                  <div className="mockup-dot red" />
                  <div className="mockup-dot amber" />
                  <div className="mockup-dot green" />
                </div>
                <div className="mockup-url">phishguard-pro.linfytech.xyz/dashboard</div>
              </div>
              <div className="mockup-body">
                <div className="mockup-sidebar">
                  <div className="mockup-sidebar-logo">
                    <div className="mockup-logo-dot" />
                    <span className="mockup-logo-text">PhishGuard Pro</span>
                  </div>
                  <div className="mockup-nav-item active"><div className="mockup-nav-dot" /> Dashboard</div>
                  <div className="mockup-nav-item"><div className="mockup-nav-dot" /> Campaigns</div>
                  <div className="mockup-nav-item"><div className="mockup-nav-dot" /> Employees</div>
                  <div className="mockup-nav-item"><div className="mockup-nav-dot" /> Training</div>
                  <div className="mockup-nav-item"><div className="mockup-nav-dot" /> Reports</div>
                </div>
                <div className="mockup-main">
                  <div className="mockup-header">
                    <div>
                      <div className="mockup-title">Security Dashboard</div>
                      <div className="mockup-subtitle">Linfy Tech Solutions — Pro Plan</div>
                    </div>
                    <div className="mockup-badge-red">⚠ HIGH RISK</div>
                  </div>
                  <div className="mockup-stats">
                    <div className="mockup-stat"><div className="mockup-stat-label">Campaigns Run</div><div className="mockup-stat-value cyan">12</div></div>
                    <div className="mockup-stat"><div className="mockup-stat-label">Click Rate</div><div className="mockup-stat-value red">34%</div></div>
                    <div className="mockup-stat"><div className="mockup-stat-label">Trained</div><div className="mockup-stat-value green">87</div></div>
                    <div className="mockup-stat"><div className="mockup-stat-label">Risk Score</div><div className="mockup-stat-value red">HIGH</div></div>
                  </div>
                  <div className="mockup-chart-area">
                    <div className="mockup-chart-label">Click Rate Trend — 6 months ↓ Improving</div>
                    <svg className="mockup-chart-svg" viewBox="0 0 400 80" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,55 L67,48 L133,42 L200,35 L267,28 L333,20 L400,16" stroke="#00d4ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      <path d="M0,55 L67,48 L133,42 L200,35 L267,28 L333,20 L400,16 L400,80 L0,80 Z" fill="url(#chartGrad)" />
                      <circle cx="67" cy="48" r="4" fill="#00d4ff" />
                      <circle cx="200" cy="35" r="4" fill="#00d4ff" />
                      <circle cx="400" cy="16" r="4" fill="#00d4ff" />
                    </svg>
                    <div className="mockup-ai-badge">🧠 AI Insight active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="stat-item reveal"><div className="stat-num">94%</div><div className="stat-label">of SA breaches start with phishing</div></div>
        <div className="stat-item reveal"><div className="stat-num">R2.75M</div><div className="stat-label">average breach cost for SA SMBs</div></div>
        <div className="stat-item reveal"><div className="stat-num">68%</div><div className="stat-label">click rate drop after 90 days</div></div>
        <div className="stat-item reveal"><div className="stat-num">R749</div><div className="stat-label">per month — vs R50,000 for KnowBe4</div></div>
      </div>

      <section id="features">
        <div className="section-inner">
          <span className="section-label reveal">Platform Features</span>
          <h2 className="section-title reveal">Enterprise security training.<br />SMB pricing.</h2>
          <p className="section-sub reveal">Everything you need to reduce phishing risk — without needing a dedicated security team or a six-figure budget.</p>
          <div className="features-grid">
            <div className="feature-card reveal"><div className="feature-icon">🎣</div><div className="feature-title">SA-Localised Simulations</div><div className="feature-desc">Send realistic phishing emails that look like FNB, SARS, Vodacom, and Standard Bank. Your staff won't know it's a test until they click.</div><span className="feature-tag">6 built-in SA templates</span></div>
            <div className="feature-card reveal"><div className="feature-icon">🧠</div><div className="feature-title">AI Risk Intelligence</div><div className="feature-desc">Security Copilot analyses your campaign data and gives instant, plain-English recommendations — like having a CISO in your pocket.</div><span className="feature-tag">Powered by GPT-4o</span></div>
            <div className="feature-card reveal"><div className="feature-icon">📊</div><div className="feature-title">Real-Time Analytics</div><div className="feature-desc">See exactly who clicked, who reported, and who ignored — with per-employee risk scores that improve over time.</div><span className="feature-tag">Live dashboard</span></div>
            <div className="feature-card reveal"><div className="feature-icon">⚡</div><div className="feature-title">Instant Training</div><div className="feature-desc">The moment an employee clicks, they're automatically enrolled in a 3-minute awareness module. No manual follow-up required.</div><span className="feature-tag">Auto-assigned</span></div>
            <div className="feature-card reveal"><div className="feature-icon">📄</div><div className="feature-title">Board-Ready Reports</div><div className="feature-desc">One-click PDF reports with AI-generated executive summaries your IT manager can paste straight into the board pack.</div><span className="feature-tag">POPIA aligned</span></div>
            <div className="feature-card reveal"><div className="feature-icon">✨</div><div className="feature-title">AI Template Generator</div><div className="feature-desc">Describe a scenario and AI writes a custom phishing email — complete with suspicious domains, SA phrasing, and annotated red flags.</div><span className="feature-tag">Unlimited templates</span></div>
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ background: 'var(--navy-2)', borderTop: '1px solid var(--border-dim)', borderBottom: '1px solid var(--border-dim)' }}>
        <div className="section-inner">
          <span className="section-label reveal">How It Works</span>
          <h2 className="section-title reveal">Up and running in<br />under 5 minutes.</h2>
          <p className="section-sub reveal">No IT experience required. Import your team, pick a template, and launch your first simulation today.</p>
          <div className="how-steps">
            <div className="how-step reveal"><div className="how-step-num">01</div><h3>Import Your Team</h3><p>Upload a CSV of employee names and emails. PhishGuard Pro creates their profiles automatically with department tracking and risk scoring.</p></div>
            <div className="how-step reveal"><div className="how-step-num">02</div><h3>Launch a Simulation</h3><p>Choose from 6 SA-localised phishing templates — or generate a custom one with AI. Schedule and send in under 3 minutes.</p></div>
            <div className="how-step reveal"><div className="how-step-num">03</div><h3>Watch Risk Drop</h3><p>Employees who click get instant training. Your dashboard tracks improvement over time. Export a PDF report for your compliance records.</p></div>
          </div>
        </div>
      </section>

      <section className="ai-section">
        <div className="section-inner">
          <div className="ai-inner">
            <div className="reveal">
              <span className="section-label">Security Copilot</span>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem)' }}>Your always-on AI security analyst</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.8, marginBottom: '2rem' }}>Ask anything. Get instant, SA-context-aware answers about your phishing data, POPIA obligations, and what to do after a high click rate.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  '"40% of my Finance team clicked — what do I tell the partners?"',
                  '"Write me a POPIA risk paragraph for our board meeting"',
                  '"Which employees should I target in the next campaign?"',
                ].map((prompt) => (
                  <div key={prompt} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{prompt}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal">
              <div className="ai-chat-mockup">
                <div className="ai-chat-header">
                  <div className="ai-chat-avatar">🛡️</div>
                  <div>
                    <div className="ai-chat-name">Security Copilot</div>
                    <div className="ai-chat-status"><div className="ai-chat-status-dot" /> Online</div>
                  </div>
                </div>
                <div className="ai-messages">
                  <div className="ai-msg">
                    <div className="ai-msg-avatar bot">🛡️</div>
                    <div className="ai-msg-bubble bot">Hi! I'm your Security Copilot. Ask me anything about your phishing results or POPIA compliance. 🛡️</div>
                  </div>
                  <div className="ai-msg user">
                    <div className="ai-msg-avatar human">👤</div>
                    <div className="ai-msg-bubble user">My Finance team had a 42% click rate. What should I do?</div>
                  </div>
                  <div className="ai-msg">
                    <div className="ai-msg-avatar bot">🛡️</div>
                    <div className="ai-msg-bubble bot">That's above the SA benchmark of 32%. I'd recommend running a targeted Standard Bank OTP simulation this week — banking phishing is the most common vector for Finance teams. Also assign mandatory training to the 4 high-risk individuals identified in your last campaign.</div>
                  </div>
                </div>
                <div className="ai-chat-input">
                  <div className="ai-input-box">Ask your Security Copilot...</div>
                  <div className="ai-send-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080f1c" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials">
        <div className="section-inner">
          <span className="section-label reveal">Customer Stories</span>
          <h2 className="section-title reveal">Trusted by South African businesses</h2>
          <p className="section-sub reveal">From accounting firms in Sandton to logistics companies in Cape Town — real results from real SA teams.</p>
          <div className="testimonials-grid">
            <div className="testimonial-card reveal">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">"Our Finance team went from a 48% click rate to 11% in three months. The AI debrief saved me an hour every time I had to report to the board."</p>
              <div className="testimonial-author"><div className="testimonial-avatar" style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--cyan)' }}>NV</div><div><div className="testimonial-name">Nadia van der Merwe</div><div className="testimonial-role">IT Manager · Cape Town Law Firm</div></div></div>
            </div>
            <div className="testimonial-card reveal">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">"I tried KnowBe4 but R45,000 a year is absurd for a 30-person practice. PhishGuard Pro does everything we need for a fraction of the cost."</p>
              <div className="testimonial-author"><div className="testimonial-avatar" style={{ background: 'rgba(46,196,182,0.15)', color: 'var(--green)' }}>KS</div><div><div className="testimonial-name">Kagiso Sithole</div><div className="testimonial-role">Partner · Johannesburg Accounting Firm</div></div></div>
            </div>
            <div className="testimonial-card reveal">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">"The SARS phishing template caught 6 out of 8 people in our first campaign. That's when we realised how exposed we were. Now we run simulations monthly."</p>
              <div className="testimonial-author"><div className="testimonial-avatar" style={{ background: 'rgba(244,162,97,0.15)', color: 'var(--amber)' }}>PM</div><div><div className="testimonial-name">Priya Moodley</div><div className="testimonial-role">Operations Director · Durban Logistics Co.</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="section-inner">
          <span className="section-label reveal">Pricing</span>
          <h2 className="section-title reveal">Simple, honest pricing.<br />No surprises.</h2>
          <p className="section-sub reveal">All plans include a 14-day free trial. No credit card required. Cancel anytime.</p>
          <div className="pricing-grid">
            <div className="pricing-card reveal">
              <div className="pricing-plan">Starter</div>
              <div className="pricing-price"><span className="pricing-currency">R</span><span className="pricing-amount">399</span><span className="pricing-period">/month</span></div>
              <div className="pricing-seats">Up to 10 employee seats</div>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                <li><span className="pricing-check">✓</span> 5 SA phishing templates</li>
                <li><span className="pricing-check">✓</span> Click &amp; open tracking</li>
                <li><span className="pricing-check">✓</span> Auto training assignment</li>
                <li><span className="pricing-check">✓</span> Basic dashboard</li>
                <li><span className="pricing-check">✓</span> Email support</li>
              </ul>
              <Link to="/register" className="pricing-btn outline">Start free trial</Link>
            </div>
            <div className="pricing-card featured reveal">
              <div className="pricing-popular">Most Popular</div>
              <div className="pricing-plan">Pro</div>
              <div className="pricing-price"><span className="pricing-currency">R</span><span className="pricing-amount">749</span><span className="pricing-period">/month</span></div>
              <div className="pricing-seats">Up to 25 employee seats</div>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                <li><span className="pricing-check">✓</span> All 6 SA phishing templates</li>
                <li><span className="pricing-check">✓</span> <strong>AI Risk Intelligence</strong></li>
                <li><span className="pricing-check">✓</span> <strong>Security Copilot chat</strong></li>
                <li><span className="pricing-check">✓</span> Full analytics + PDF reports</li>
                <li><span className="pricing-check">✓</span> AI template generator</li>
                <li><span className="pricing-check">✓</span> Employee risk scoring</li>
                <li><span className="pricing-check">✓</span> Priority email support</li>
              </ul>
              <Link to="/register" className="pricing-btn primary">Start free trial</Link>
            </div>
            <div className="pricing-card reveal">
              <div className="pricing-plan">Business</div>
              <div className="pricing-price"><span className="pricing-currency">R</span><span className="pricing-amount">1,499</span><span className="pricing-period">/month</span></div>
              <div className="pricing-seats">Up to 100 employee seats</div>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                <li><span className="pricing-check">✓</span> Everything in Pro</li>
                <li><span className="pricing-check">✓</span> Custom phishing templates</li>
                <li><span className="pricing-check">✓</span> Multi-department reporting</li>
                <li><span className="pricing-check">✓</span> POPIA compliance report</li>
                <li><span className="pricing-check">✓</span> Dedicated account manager</li>
                <li><span className="pricing-check">✓</span> Phone support</li>
              </ul>
              <a href="mailto:info@linfytech.xyz" className="pricing-btn outline">Contact sales</a>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-glow" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="section-label" style={{ display: 'block', marginBottom: '1rem' }}>Get started today</span>
          <h2>Stop the click<br />before it costs you.</h2>
          <p>Join South African businesses that have reduced their phishing risk by up to 68%. Your first simulation is free.</p>
          <div className="cta-btns">
            <Link to="/register" className="btn-primary-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              Start free 14-day trial
            </Link>
            <a href="mailto:info@linfytech.xyz" className="btn-outline-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16a2 2 0 0 1 .27.92z" /></svg>
              Book a demo
            </a>
          </div>
          <p className="cta-fine">No credit card required · POPIA compliant · SA-hosted</p>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="nav-logo">
                <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
                  <path d="M16 2L4 7v9c0 7.18 5.15 13.89 12 15.5C22.85 29.89 28 23.18 28 16V7L16 2z" fill="rgba(0,212,255,0.15)" stroke="#00d4ff" strokeWidth="1.5" />
                  <path d="M13 16l2 2 4-4" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="nav-logo-text">PhishGuard <span>Pro</span></span>
              </div>
              <p className="footer-brand-desc">South Africa's most affordable phishing simulation and security awareness training platform. Built for SMBs by <a href="https://linfytech.xyz" target="_blank" rel="noreferrer">Linfy Tech Solutions</a>.</p>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <div className="footer-links">
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#how-it-works">How it works</a>
                <a href="#testimonials">Customers</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <div className="footer-links">
                <a href="#features">About</a>
                <a href="#testimonials">Blog</a>
                <a href="mailto:info@linfytech.xyz">Contact</a>
                <a href="https://linfytech.xyz" target="_blank" rel="noreferrer">Linfy Tech Solutions</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Legal</div>
              <div className="footer-links">
                <a href="#pricing">Privacy Policy</a>
                <a href="#pricing">Terms of Service</a>
                <a href="#pricing">POPIA Compliance</a>
                <a href="#features">Security</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 PhishGuard Pro · A Linfy Tech Solutions product · Cape Town, SA</span>
            <div className="footer-popia">
              <span className="popia-badge">POPIA</span>
              <span>Compliant · South African data hosting</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
