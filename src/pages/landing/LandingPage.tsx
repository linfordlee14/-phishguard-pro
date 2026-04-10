import { Link } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  FileBarChart,
  LayoutDashboard,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './landing.module.css'

interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
  meta: string
}

interface PricingPlan {
  name: string
  price: string
  seats: string
  featured: boolean
  cta: string
  items: string[]
}

interface Testimonial {
  initials: string
  name: string
  role: string
  quote: string
}

interface NavItem {
  href: string
  label: string
}

interface MockSidebarItem {
  icon: LucideIcon
  label: string
  active?: boolean
}

const featureItems: FeatureItem[] = [
  {
    icon: Mail,
    title: 'Realistic phishing simulations',
    description: 'Launch South African phishing templates that feel real enough to train teams before attackers do.',
    meta: 'SARS · banking · payroll',
  },
  {
    icon: Sparkles,
    title: 'AI-powered risk intelligence',
    description: 'Security Copilot translates campaign results into clear recommendations your team can act on quickly.',
    meta: 'Insight refreshes automatically',
  },
  {
    icon: Users,
    title: 'Employee risk visibility',
    description: 'Track high-risk users, departments, and click history with the same premium shell used inside the app.',
    meta: 'Prioritise coaching',
  },
  {
    icon: BookOpen,
    title: 'Instant awareness training',
    description: 'Route people into lightweight training right after a click so follow-up happens while the lesson still lands.',
    meta: 'Faster behaviour change',
  },
  {
    icon: FileBarChart,
    title: 'Board-ready reporting',
    description: 'Export clean risk summaries, campaign outcomes, and proof points for compliance and leadership updates.',
    meta: 'Designed for SMB reporting',
  },
  {
    icon: ShieldCheck,
    title: 'Security program momentum',
    description: 'Turn one simulation into an ongoing security rhythm with dashboards, training, and campaign planning in one place.',
    meta: 'Built for repeatable monthly drills',
  },
] 

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '399',
    seats: 'Up to 10 employee seats',
    featured: false,
    cta: 'Start free trial',
    items: ['5 phishing templates', 'Click and open tracking', 'Auto training assignment', 'Basic reporting'],
  },
  {
    name: 'Pro',
    price: '749',
    seats: 'Up to 25 employee seats',
    featured: true,
    cta: 'Start free trial',
    items: ['All templates included', 'AI risk intelligence', 'Security Copilot support', 'Premium analytics and exports'],
  },
  {
    name: 'Business',
    price: '1,499',
    seats: 'Up to 100 employee seats',
    featured: false,
    cta: 'Talk to sales',
    items: ['Everything in Pro', 'Custom template workflows', 'Department rollups', 'Priority support'],
  },
] 

const testimonials: Testimonial[] = [
  {
    initials: 'NV',
    name: 'Nadia van der Merwe',
    role: 'IT Manager · Cape Town Law Firm',
    quote: 'The premium dashboard makes risk reviews feel instantly executive-ready. Our finance team click rate dropped within the first quarter.',
  },
  {
    initials: 'KS',
    name: 'Kagiso Sithole',
    role: 'Partner · Johannesburg Accounting Firm',
    quote: 'We needed strong phishing training without enterprise complexity. PhishGuard Pro feels polished, focused, and easy to run every month.',
  },
  {
    initials: 'PM',
    name: 'Priya Moodley',
    role: 'Operations Director · Durban Logistics Co.',
    quote: 'The risky employee view and campaign card flow make it obvious where to act next. It finally feels like a real security product.',
  },
] 

const navItems: NavItem[] = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#testimonials', label: 'Customers' },
] 

const mockSidebarItems: MockSidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Mail, label: 'Campaigns' },
  { icon: Users, label: 'Employees' },
  { icon: BookOpen, label: 'Training' },
  { icon: BarChart3, label: 'Reports' },
]

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlow} />

      <nav className={styles.navbar} data-testid="landing-navbar">
        <Link to="/" className={styles.brand} data-testid="landing-brand-link">
          <div className={styles.brandMark}>
            <Shield className={styles.brandShield} />
          </div>
          <div>
            <p className={styles.brandName} data-testid="landing-brand-name">PhishGuard</p>
            <span className={styles.brandBadge}>PRO</span>
          </div>
        </Link>

        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={styles.navLink} data-testid={`landing-nav-${item.label.toLowerCase()}`}>
              {item.label}
            </a>
          ))}
        </div>

        <div className={styles.navActions}>
          <Link to="/login" className={styles.secondaryLink} data-testid="landing-signin-link">Sign in</Link>
          <Link to="/register" className={styles.primaryButton} data-testid="landing-start-trial-button">
            Start free trial
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow} data-testid="landing-hero-eyebrow">
              <span className={styles.eyebrowDot} />
              Security awareness, tuned for South African teams
            </div>
            <h1 className={styles.heroTitle} data-testid="landing-hero-title">Stop the click before it costs you.</h1>
            <p className={styles.heroText} data-testid="landing-hero-subtitle">
              PhishGuard Pro trains South African teams with realistic phishing simulations and AI-powered risk intelligence.
            </p>

            <div className={styles.heroActions}>
              <Link to="/register" className={styles.primaryButtonLarge} data-testid="landing-hero-primary-cta">
                Start free 14-day trial
                <ChevronRight className={styles.inlineIcon} />
              </Link>
              <a href="#pricing" className={styles.outlineButton} data-testid="landing-hero-secondary-cta">
                View pricing
              </a>
            </div>

            <div className={styles.heroTrust} data-testid="landing-trust-row">
              <span>No credit card required</span>
              <span>POPIA aware workflows</span>
              <span>Executive-ready reporting</span>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statCard} data-testid="landing-stat-1">
                <span className={styles.statValue}>94%</span>
                <span className={styles.statLabel}>of breaches start with phishing</span>
              </div>
              <div className={styles.statCard} data-testid="landing-stat-2">
                <span className={styles.statValue}>68%</span>
                <span className={styles.statLabel}>risk reduction after steady drills</span>
              </div>
              <div className={styles.statCard} data-testid="landing-stat-3">
                <span className={styles.statValue}>R749</span>
                <span className={styles.statLabel}>for the premium plan</span>
              </div>
            </div>
          </div>

          <div className={styles.heroMockupWrap} data-testid="landing-dashboard-mockup">
            <div className={styles.browserFrame}>
              <div className={styles.browserBar}>
                <div className={styles.browserDots}>
                  <span className={`${styles.dot} ${styles.dotRed}`} />
                  <span className={`${styles.dot} ${styles.dotAmber}`} />
                  <span className={`${styles.dot} ${styles.dotGreen}`} />
                </div>
                <div className={styles.browserUrl}>app.phishguardpro.com/dashboard</div>
              </div>

              <div className={styles.mockApp}>
                <aside className={styles.mockSidebar}>
                  <div className={styles.mockSidebarBrand}>
                    <div className={styles.mockSidebarShield}><Shield className={styles.mockSidebarShieldIcon} /></div>
                    <div>
                      <p className={styles.mockSidebarTitle}>PhishGuard</p>
                      <span className={styles.mockSidebarBadge}>PRO</span>
                    </div>
                  </div>

                  <div className={styles.mockNavList}>
                    {mockSidebarItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.label} className={`${styles.mockNavItem} ${item.active ? styles.mockNavItemActive : ''}`}>
                          <Icon className={styles.mockNavIcon} />
                          <span>{item.label}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className={styles.mockSidebarFooter}>
                    <div className={styles.mockAvatar}>NV</div>
                    <div>
                      <p className={styles.mockFooterName}>Nadia</p>
                      <p className={styles.mockFooterMeta}>Pro Plan</p>
                    </div>
                  </div>
                </aside>

                <div className={styles.mockMain}>
                  <div className={styles.mockTopbar}>
                    <div>
                      <p className={styles.mockLabel}>Security posture</p>
                      <h2 className={styles.mockHeading}>Operational risk at a glance</h2>
                    </div>
                    <div className={styles.mockTrendPill}>Risk trend improving</div>
                  </div>

                  <div className={styles.mockKpis}>
                    {[
                      ['Campaigns Run', '12'],
                      ['Avg Click Rate', '18%'],
                      ['Employees Trained', '87'],
                      ['Coverage', '74%'],
                    ].map(([label, value]) => (
                      <div key={label} className={styles.mockKpiCard}>
                        <span className={styles.mockKpiLabel}>{label}</span>
                        <strong className={styles.mockKpiValue}>{value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className={styles.mockPanels}>
                    <div className={styles.mockChartCard}>
                      <div className={styles.mockCardHeader}>
                        <div>
                          <p className={styles.mockCardTitle}>Campaign Performance</p>
                          <p className={styles.mockCardMeta}>Six-campaign rolling click trend</p>
                        </div>
                        <span className={styles.mockInfoBadge}>Improving</span>
                      </div>

                      <svg className={styles.mockChart} viewBox="0 0 320 140" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="landingChartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0 102 L54 88 L108 82 L162 67 L216 58 L270 45 L320 39 L320 140 L0 140 Z" fill="url(#landingChartGradient)" />
                        <path d="M0 102 L54 88 L108 82 L162 67 L216 58 L270 45 L320 39" fill="none" stroke="#00d4ff" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="108" cy="82" r="6" fill="#00d4ff" />
                        <circle cx="216" cy="58" r="6" fill="#00d4ff" />
                        <circle cx="320" cy="39" r="6" fill="#00d4ff" />
                      </svg>
                    </div>

                    <div className={styles.mockRightColumn}>
                      <div className={styles.mockGaugeCard}>
                        <div className={styles.mockCardHeader}>
                          <div>
                            <p className={styles.mockCardTitle}>Risk Gauge</p>
                            <p className={styles.mockCardMeta}>Current exposure index</p>
                          </div>
                        </div>
                        <div className={styles.gaugeWrap}>
                          <div className={styles.gaugeRing}>
                            <div className={styles.gaugeInner}>
                              <strong className={styles.gaugeValue}>38</strong>
                              <span className={styles.gaugeMeta}>Stable</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.mockRiskCard}>
                        <div className={styles.mockCardHeader}>
                          <div>
                            <p className={styles.mockCardTitle}>Top risky employees</p>
                            <p className={styles.mockCardMeta}>Highest click exposure</p>
                          </div>
                        </div>
                        {[
                          ['TM', 'Finance', 'High'],
                          ['JD', 'Operations', 'Medium'],
                          ['AR', 'Sales', 'Medium'],
                        ].map(([initials, dept, risk]) => (
                          <div key={initials} className={styles.mockRiskRow}>
                            <div className={styles.mockRiskPerson}>
                              <span className={styles.mockRiskAvatar}>{initials}</span>
                              <span>{dept}</span>
                            </div>
                            <span className={styles.mockRiskBadge}>{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="features">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Platform features</p>
            <h2 className={styles.sectionTitle} data-testid="landing-features-title">Everything your team needs to run a security program with confidence.</h2>
            <p className={styles.sectionText}>The landing experience now mirrors the premium app shell, so what prospects see matches what customers use every day.</p>
          </div>

          <div className={styles.featureGrid}>
            {featureItems.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className={styles.surfaceCard} data-testid={`feature-card-${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  <div className={styles.featureIconRow}>
                    <Icon className={styles.featureIcon} />
                    <span className={styles.featureMeta}>{feature.meta}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{feature.title}</h3>
                  <p className={styles.cardText}>{feature.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className={`${styles.section} ${styles.pricingSection}`} id="pricing">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Pricing</p>
            <h2 className={styles.sectionTitle} data-testid="landing-pricing-title">Simple plans for growing security programs.</h2>
            <p className={styles.sectionText}>Choose the plan that matches your team size, then grow into richer campaigns, analytics, and AI support.</p>
          </div>

          <div className={styles.pricingGrid}>
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`${styles.surfaceCard} ${styles.pricingCard} ${plan.featured ? styles.pricingFeatured : ''}`} data-testid={`pricing-card-${plan.name.toLowerCase()}`}>
                <div className={styles.pricingTop}>
                  <div>
                    <p className={styles.pricingPlan}>{plan.name}</p>
                    <div className={styles.pricingValueRow}>
                      <span className={styles.pricingCurrency}>R</span>
                      <span className={styles.pricingValue}>{plan.price}</span>
                      <span className={styles.pricingPeriod}>/month</span>
                    </div>
                    <p className={styles.pricingSeats}>{plan.seats}</p>
                  </div>
                  {plan.featured && <span className={styles.pricingBadge}>Most Popular</span>}
                </div>

                <div className={styles.pricingDivider} />
                <ul className={styles.pricingList}>
                  {plan.items.map((item) => (
                    <li key={item} className={styles.pricingItem}>
                      <ShieldCheck className={styles.pricingItemIcon} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Business' ? '/login' : '/register'}
                  className={plan.featured ? styles.primaryButtonLarge : styles.outlineButtonFull}
                  data-testid={`pricing-cta-${plan.name.toLowerCase()}`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} id="testimonials">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Customer stories</p>
            <h2 className={styles.sectionTitle} data-testid="landing-testimonials-title">Teams trust the product because it looks and works like a real control center.</h2>
          </div>

          <div className={styles.testimonialGrid}>
            {testimonials.map((item) => (
              <article key={item.name} className={styles.surfaceCard} data-testid={`testimonial-card-${item.initials.toLowerCase()}`}>
                <p className={styles.testimonialQuote}>“{item.quote}”</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{item.initials}</div>
                  <div>
                    <p className={styles.testimonialName}>{item.name}</p>
                    <p className={styles.testimonialRole}>{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection} data-testid="landing-cta-section">
          <div className={styles.ctaCard}>
            <p className={styles.sectionEyebrow}>Get started</p>
            <h2 className={styles.ctaTitle}>Bring your phishing program into one premium workspace.</h2>
            <p className={styles.ctaText}>Start with realistic simulations, train employees faster, and keep leadership aligned with clearer risk reporting.</p>
            <div className={styles.ctaActions}>
              <Link to="/register" className={styles.primaryButtonLarge} data-testid="landing-cta-primary">
                Start free 14-day trial
                <ChevronRight className={styles.inlineIcon} />
              </Link>
              <Link to="/login" className={styles.outlineButton} data-testid="landing-cta-secondary">Sign in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer} data-testid="landing-footer">
        <div className={styles.footerInner}>
          <div className={styles.footerBrandBlock}>
            <div className={styles.brand}>
              <div className={styles.brandMark}>
                <Shield className={styles.brandShield} />
              </div>
              <div>
                <p className={styles.brandName}>PhishGuard</p>
                <span className={styles.brandBadge}>PRO</span>
              </div>
            </div>
            <p className={styles.footerText}>Premium phishing simulation and awareness training for South African businesses that want a cleaner, sharper security workflow.</p>
          </div>

          <div className={styles.footerLinksWrap}>
            <div>
              <p className={styles.footerHeading}>Product</p>
              <div className={styles.footerLinks}>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#testimonials">Customers</a>
              </div>
            </div>
            <div>
              <p className={styles.footerHeading}>Resources</p>
              <div className={styles.footerLinks}>
                <Link to="/login">Sign in</Link>
                <Link to="/register">Free trial</Link>
                <a href="mailto:info@phishguardpro.com">Contact</a>
              </div>
            </div>
            <div>
              <p className={styles.footerHeading}>Compliance</p>
              <div className={styles.footerLinks}>
                <a href="#pricing">Privacy policy</a>
                <a href="#pricing">Terms</a>
                <a href="#pricing">Security</a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span className={styles.footerText}>© 2026 PhishGuard Pro · Cape Town, South Africa</span>
          <span className={styles.popiaBadge}>POPIA aligned</span>
        </div>
      </footer>
    </div>
  )
}