import { ArrowRight, BarChart3, BellRing, Check, ChevronRight, CircleCheck, Clock3, Menu, ShieldCheck, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { ProgressRing } from "../components/Ui";

const routine = [
  ["08:00", "Wake up"], ["08:05", "Water"], ["08:25", "Brush teeth"], ["08:40", "Breakfast"], ["09:00", "Focus block"]
];

const premiumFeatures = ["30/60/90 Day Reset", "Unlimited habits", "Advanced progress", "Smoking reduction", "Screen-time reduction", "Custom routines", "Morning emails", "Evening check-ins", "Weekly reports", "Future core updates"];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="marketing-page">
      <header className="marketing-header">
        <Logo />
        <nav className={menuOpen ? "open" : ""} aria-label="Main navigation">
          <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
          <Link className="button button-primary mobile-cta" to="/signup">Start Your Reset</Link>
        </nav>
        <div className="header-actions"><Link to="/login" className="text-link">Log in</Link><Link className="button button-primary" to="/signup">Start Your Reset</Link></div>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <main>
        <section className="hero section-shell">
          <div className="hero-copy">
            <p className="eyebrow"><span /> 30 days. One clearer system.</p>
            <h1>Reset your life<br />in <em>30 days.</em></h1>
            <p className="hero-lead">Stop scrolling. Start living. Build a routine that fits your real schedule, reduce the habits that drain you, and see honest progress every day.</p>
            <div className="hero-actions"><Link className="button button-primary button-large" to="/signup">Start Your Reset <ArrowRight size={18} /></Link><a className="button button-ghost button-large" href="#preview">See how it works</a></div>
            <div className="hero-proof"><span><Check size={15} /> Free 7 Day Reset</span><span><Check size={15} /> No card required</span><span><Check size={15} /> Not another streak trap</span></div>
          </div>
          <div className="hero-product" id="preview">
            <div className="product-glow" />
            <div className="phone-card">
              <div className="phone-top"><div><small>MONDAY · DAY 08</small><strong>Today</strong></div><ProgressRing value={68} size={66} /></div>
              <div className="focus-strip"><small>DAILY FOCUS</small><p>Protect your attention.</p></div>
              <div className="phone-list">{routine.map(([time, task], index) => <div key={task} className={index < 3 ? "complete" : ""}><button aria-label={`${task} demo checkbox`}>{index < 3 && <Check size={14} />}</button><time>{time}</time><span>{task}</span></div>)}</div>
              <div className="phone-stats"><div><span className="status-dot" />No-scroll<strong>2h 14m</strong></div><div><span className="status-dot amber" />Cigarettes<strong>4 / 7</strong></div></div>
            </div>
            <div className="floating-note note-one"><CircleCheck size={18} /><span><strong>6 day streak</strong><small>Quiet consistency.</small></span></div>
            <div className="floating-note note-two"><BellRing size={18} /><span><strong>Morning plan sent</strong><small>07:30 · right on time</small></span></div>
          </div>
        </section>

        <section className="problem-strip"><p>You do not need more motivation.</p><strong>You need fewer decisions and a system you can return to.</strong></section>

        <section className="section-shell section-block" id="how">
          <div className="section-heading"><p className="eyebrow">HOW IT WORKS</p><h2>From scattered to structured.<br /><em>Without rebuilding your whole life overnight.</em></h2></div>
          <div className="steps-grid">
            <article><span>01</span><div className="step-icon"><Sparkles /></div><h3>Tell us what needs a reset</h3><p>Choose scrolling, smoking, sleep, movement, reading, productivity, or your daily routine.</p></article>
            <article><span>02</span><div className="step-icon"><Clock3 /></div><h3>Get a plan that fits your day</h3><p>Use exact times or flexible anchors such as Morning, Midday, Evening, and Before bed.</p></article>
            <article><span>03</span><div className="step-icon"><BarChart3 /></div><h3>Act, check in, adjust</h3><p>Complete the next useful action and use neutral progress data to shape tomorrow.</p></article>
          </div>
        </section>

        <section className="feature-section section-block" id="features">
          <div className="section-shell feature-split">
            <div><p className="eyebrow">YOUR DAILY OPERATING SYSTEM</p><h2>One screen.<br />The next right action.</h2><p>Today keeps your routine, goals, and reset focus together. Nothing is buried in charts when you need to act.</p><ul className="tick-list"><li><Check />Exact time or flexible routine</li><li><Check />Done, Skip, and private notes</li><li><Check />Habits and core routine in one flow</li></ul></div>
            <div className="dashboard-preview">
              <header><div><small>TODAY · DAY 08</small><h3>Good morning, Alex.</h3></div><ProgressRing value={68} /></header>
              <div className="preview-columns"><div><p className="preview-label">MORNING</p>{routine.slice(0,4).map(([time, task], index) => <div className="mini-task" key={task}><span className={index < 3 ? "checked" : ""}>{index < 3 && <Check size={12} />}</span><time>{time}</time><b>{task}</b></div>)}</div><aside><small>DAY 08 FOCUS</small><strong>Protect your attention.</strong><p>Keep your phone outside reach for one focused block.</p><button>View challenge <ChevronRight size={15} /></button></aside></div>
            </div>
          </div>
        </section>

        <section className="section-shell section-block progress-showcase">
          <div className="analytics-card">
            <div className="analytics-top"><div><small>30 DAY VIEW</small><strong>Your progress, without the guilt.</strong></div><span>+14% this week</span></div>
            <div className="bars" aria-label="Example weekly completion chart">{[44, 62, 57, 76, 68, 84, 92].map((value, index) => <div key={index}><i style={{ height: `${value}%` }} /><small>{["M","T","W","T","F","S","S"][index]}</small></div>)}</div>
            <div className="metric-row"><div><small>ROUTINE</small><strong>74%</strong></div><div><small>SCREEN TIME</small><strong>−52m</strong></div><div><small>CIGARETTES</small><strong>−3/day</strong></div></div>
          </div>
          <div className="showcase-copy"><p className="eyebrow">PROGRESS YOU CAN USE</p><h2>See patterns.<br />Make the next week easier.</h2><p>Track cigarettes, screen time, mood, movement, reading, sleep consistency, and routine completion across 7 days, 30 days, or all time.</p><div className="calm-note"><ShieldCheck /><span><strong>Neutral by design</strong><small>No shame, aggressive warnings, or fake motivation.</small></span></div></div>
        </section>

        <section className="email-section section-block">
          <div className="section-shell email-grid"><div><p className="eyebrow">MORNING RESET EMAIL</p><h2>Your day, already decided.</h2><p>Wake up to one clean plan: routine, habits, targets, focus, movement, reading, and a useful podcast.</p><div className="email-points"><span><Check />Arrives at your chosen time</span><span><Check />Personalized to your reset</span><span><Check />Opens straight into Today</span></div></div><div className="email-card"><header><Logo /><span>07:30</span></header><small>YOUR RESET PLAN · DAY 08</small><h3>Protect your attention.</h3><p>Good morning. Keep today simple and complete the next useful action.</p><div><span>Wake time</span><b>08:00</b></div><div><span>Screen target</span><b>3h 00m</b></div><div><span>Reading</span><b>20 min</b></div><button>OPEN TODAY'S PLAN</button></div></div>
        </section>

        <section className="section-shell section-block pricing-section" id="pricing">
          <div className="section-heading centered"><p className="eyebrow">SIMPLE PRICING</p><h2>Start free. Keep the system for life.</h2><p>No recurring subscription for founding members.</p></div>
          <div className="pricing-grid">
            <article className="price-card"><p>FREE</p><h3>€0</h3><small>Start with the essentials.</small><ul>{["Basic onboarding", "7 Day Reset", "Up to 5 habits", "Today dashboard", "Basic progress tracking"].map(item => <li key={item}><Check />{item}</li>)}</ul><Link className="button button-ghost" to="/signup">Start Free</Link></article>
            <article className="price-card featured"><span className="offer">LIMITED EARLY ACCESS OFFER</span><p>FOUNDING LIFETIME ACCESS</p><h3>€19 <small>one-time</small></h3><small>Pay once. No monthly subscription.</small><ul>{premiumFeatures.map(item => <li key={item}><Check />{item}</li>)}</ul><Link className="button button-primary" to="/signup?plan=lifetime">Get Lifetime Access</Link><p className="secure-note"><ShieldCheck /> Secure checkout by Stripe</p></article>
          </div>
        </section>

        <section className="section-shell section-block faq" id="faq">
          <div className="section-heading"><p className="eyebrow">FAQ</p><h2>Clear answers before you start.</h2></div>
          <div className="faq-list">
            <details><summary>Is RESET a medical or smoking-cessation treatment?<span>+</span></summary><p>No. RESET is a habit and behaviour tracking tool. It does not diagnose, treat, or replace professional medical support.</p></details>
            <details><summary>Do I need to follow exact times?<span>+</span></summary><p>No. Choose exact times or flexible day anchors. Your plan should fit shift work and changing schedules.</p></details>
            <details><summary>Is €19 really a one-time payment?<span>+</span></summary><p>Yes. Founding Lifetime Access is a single €19 payment with no monthly subscription.</p></details>
            <details><summary>What happens after the 30 days?<span>+</span></summary><p>Lifetime members can continue with a 60 or 90 day program, restart, or keep the habits and routine that worked.</p></details>
            <details><summary>Can I turn emails off?<span>+</span></summary><p>Yes. Morning, evening, and weekly emails are controlled independently from Settings.</p></details>
          </div>
        </section>

        <section className="final-cta"><div><p className="eyebrow">YOUR NEXT DAY CAN START DIFFERENTLY</p><h2>Stop scrolling.<br /><em>Start living.</em></h2><p>Begin with seven days. Keep the system only if it earns its place.</p><Link className="button button-primary button-large" to="/signup">Start Your Reset <ArrowRight size={18} /></Link></div></section>
      </main>

      <footer className="marketing-footer"><Logo /><p>Habit and behaviour tracking for real life.</p><nav><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/cookies">Cookies</Link><a href="mailto:hello@stilloak-studio.com">Contact</a></nav><small>© {new Date().getFullYear()} Stilloak Studio</small></footer>
    </div>
  );
}
