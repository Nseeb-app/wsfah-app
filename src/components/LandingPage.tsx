import Link from "next/link";
import MaterialIcon from "./MaterialIcon";

const features = [
  {
    icon: "coffee_maker",
    title: "Guided Brew Mode",
    desc: "Step-by-step instructions with built-in timers. Nail your pour-over, espresso, or matcha every time.",
  },
  {
    icon: "menu_book",
    title: "Recipe Library",
    desc: "Thousands of community and brand-verified recipes for coffee, tea, matcha, and more.",
  },
  {
    icon: "edit_note",
    title: "Brew Journal",
    desc: "Log every brew with parameters, notes, and ratings. Track your progress and dial in perfection.",
  },
  {
    icon: "group",
    title: "Community & Groups",
    desc: "Join brewing communities, share photos, follow top brewers, and discover new techniques.",
  },
  {
    icon: "emoji_events",
    title: "Rewards & Challenges",
    desc: "Earn points for brewing, complete challenges, climb the leaderboard, and redeem real rewards.",
  },
  {
    icon: "storefront",
    title: "Brand Marketplace",
    desc: "Discover roasters, cafes, and equipment brands. Read reviews, find nearby shops, and shop products.",
  },
  {
    icon: "timer",
    title: "Smart Brew Timer",
    desc: "Precise timers with haptic feedback, background notifications, and recipe-linked parameters.",
  },
  {
    icon: "bluetooth",
    title: "Smart Scale Integration",
    desc: "Connect Acaia, Timemore, and other Bluetooth scales for real-time weight tracking during brews.",
  },
  {
    icon: "collections",
    title: "Collections & Gallery",
    desc: "Organize recipes into collections, share brew photos, and browse a beautiful gallery of brews.",
  },
];

const userPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Everything you need to start brewing better",
    features: [
      "Browse all recipes",
      "Brew timer & guided mode",
      "Brew ratio calculator",
      "Create up to 3 recipes",
      "Like & save up to 20 recipes",
      "Basic search & leaderboard",
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    desc: "For serious brewers who want the full experience",
    features: [
      "Everything in Free",
      "Unlimited recipes & saves",
      "Brew journal with analytics",
      "Flavor wheel tagging",
      "Custom brew profiles",
      "Offline recipe access",
      "Recipe cloning & remixing",
      "Collections, groups & messages",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=pro",
    highlighted: true,
  },
];

const roasterPlans = [
  {
    name: "Roaster Basic",
    price: "$29",
    period: "/month",
    desc: "Get your brand in front of thousands of brewers",
    features: [
      "Verified roaster profile & badge",
      "Product catalog (up to 50 items)",
      "Customer reviews & ratings",
      "Basic brand analytics",
      "Link recipes to your products",
      "Community group page",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=roaster",
    highlighted: false,
  },
  {
    name: "Roaster Pro",
    price: "$79",
    period: "/month",
    desc: "Grow your audience and drive real sales",
    features: [
      "Everything in Roaster Basic",
      "Unlimited product catalog",
      "Promoted recipes in feed",
      "Advanced analytics & insights",
      "Brew comparison tool",
      "Recipe version history",
      "Event hosting & promotion",
      "Priority placement in search",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=roaster-pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large roasters, chains, and distributors",
    features: [
      "Everything in Roaster Pro",
      "Multi-location management",
      "API access & integrations",
      "Dedicated account manager",
      "Custom branding & landing page",
      "Bulk product import",
      "Team member accounts",
      "White-label brew guides",
    ],
    cta: "Contact Sales",
    href: "/signup?plan=enterprise",
    highlighted: false,
  },
];

const stats = [
  { value: "10K+", label: "Recipes" },
  { value: "50K+", label: "Brewers" },
  { value: "500+", label: "Roasters" },
  { value: "4.9", label: "App Rating" },
];

export default function LandingPage() {
  return (
    <div className="bg-background-light text-espresso min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-xl border-b border-espresso/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
              <MaterialIcon icon="coffee" className="text-espresso text-xl" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">BrewCraft</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity">Features</a>
            <a href="#pricing" className="text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity">Pricing</a>
            <Link href="/login" className="text-sm font-bold opacity-80 hover:opacity-100">Log In</Link>
            <Link href="/signup" className="bg-primary text-espresso px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold opacity-80">Log In</Link>
            <Link href="/signup" className="bg-primary text-espresso px-4 py-2 rounded-xl text-sm font-bold">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-brand-gold/5" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-36">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
              <MaterialIcon icon="auto_awesome" className="text-primary text-sm" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">The Ultimate Brew Companion</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Brew Better.{" "}
              <span className="text-primary">Share More.</span>{" "}
              <span className="opacity-40">Repeat.</span>
            </h1>
            <p className="text-lg md:text-xl opacity-60 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
              Discover recipes, track your brews, connect with a global community of coffee and tea enthusiasts, and never make a bad cup again.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="bg-primary text-espresso px-8 py-4 rounded-2xl text-base font-extrabold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center gap-2"
              >
                Start Brewing Free <MaterialIcon icon="arrow_forward" className="text-lg" />
              </Link>
              <Link
                href="/search"
                className="border-2 border-espresso/10 px-8 py-4 rounded-2xl text-base font-bold hover:border-primary/30 transition-colors flex items-center gap-2"
              >
                <MaterialIcon icon="explore" className="text-lg opacity-60" /> Browse Recipes
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-espresso/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Everything You Need to Brew
            </h2>
            <p className="text-base opacity-50 max-w-lg mx-auto font-medium">
              From your first pour-over to mastering latte art — tools for every step of your journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-espresso/5 hover:border-primary/20 hover:shadow-lg transition-all group"
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <MaterialIcon icon={f.icon} className="text-primary text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm opacity-50 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", icon: "person_add", title: "Create Your Account", desc: "Sign up in seconds. Set your brewing preferences and favorite categories." },
              { step: "02", icon: "search", title: "Discover & Brew", desc: "Browse recipes, start guided brew mode with timers, and log your results." },
              { step: "03", icon: "trending_up", title: "Improve & Share", desc: "Track progress in your journal, earn rewards, and share with the community." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <MaterialIcon icon={item.icon} className="text-primary text-3xl" />
                  </div>
                  <div className="absolute -top-2 -right-2 size-8 rounded-full bg-primary text-espresso flex items-center justify-center text-xs font-extrabold shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm opacity-50 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — Brewers */}
      <section id="pricing" className="py-20 md:py-28 bg-espresso/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base opacity-50 max-w-lg mx-auto font-medium">
              Start for free. Upgrade when you&apos;re ready for more.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {userPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border transition-all ${
                  plan.highlighted
                    ? "bg-espresso text-oat-milk border-primary shadow-2xl scale-[1.02] relative"
                    : "bg-white border-espresso/5 hover:border-primary/20 hover:shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-espresso text-[10px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className={`text-sm font-semibold ${plan.highlighted ? "opacity-60" : "opacity-40"}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm mt-2 font-medium ${plan.highlighted ? "opacity-70" : "opacity-50"}`}>{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm font-medium">
                      <MaterialIcon
                        icon="check_circle"
                        className={`text-lg flex-shrink-0 ${plan.highlighted ? "text-primary" : "text-primary/70"}`}
                        filled
                      />
                      <span className={plan.highlighted ? "opacity-90" : "opacity-60"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-primary text-espresso hover:bg-primary/90 shadow-lg"
                      : "bg-espresso/5 text-espresso hover:bg-primary hover:text-espresso"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — Roasters */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-1.5 mb-6">
              <MaterialIcon icon="storefront" className="text-brand-gold text-sm" />
              <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">For Roasters & Brands</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Grow Your Brand on BrewCraft
            </h2>
            <p className="text-base opacity-50 max-w-lg mx-auto font-medium">
              Reach passionate coffee and tea lovers. Showcase your products, build community, and drive sales.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roasterPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border transition-all ${
                  plan.highlighted
                    ? "bg-espresso text-oat-milk border-brand-gold shadow-2xl scale-[1.02] relative"
                    : "bg-white border-espresso/5 hover:border-brand-gold/20 hover:shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-espresso text-[10px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Best Value
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    {plan.period && (
                      <span className={`text-sm font-semibold ${plan.highlighted ? "opacity-60" : "opacity-40"}`}>{plan.period}</span>
                    )}
                  </div>
                  <p className={`text-sm mt-2 font-medium ${plan.highlighted ? "opacity-70" : "opacity-50"}`}>{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm font-medium">
                      <MaterialIcon
                        icon="check_circle"
                        className={`text-lg flex-shrink-0 ${plan.highlighted ? "text-brand-gold" : "text-brand-gold/70"}`}
                        filled
                      />
                      <span className={plan.highlighted ? "opacity-90" : "opacity-60"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-brand-gold text-espresso hover:bg-brand-gold/90 shadow-lg"
                      : "bg-espresso/5 text-espresso hover:bg-brand-gold hover:text-espresso"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <MaterialIcon icon="coffee" className="text-primary text-4xl" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Ready to Brew Something Amazing?
          </h2>
          <p className="text-base opacity-50 max-w-md mx-auto mb-8 font-medium">
            Join thousands of brewers who are perfecting their craft with BrewCraft.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-primary text-espresso px-8 py-4 rounded-2xl text-base font-extrabold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
          >
            Create Free Account <MaterialIcon icon="arrow_forward" className="text-lg" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-espresso/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                  <MaterialIcon icon="coffee" className="text-espresso text-sm" />
                </div>
                <span className="font-extrabold tracking-tight">BrewCraft</span>
              </div>
              <p className="text-sm opacity-40 font-medium leading-relaxed">
                The ultimate platform for coffee and tea enthusiasts.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider opacity-60">Product</h4>
              <div className="space-y-2">
                <Link href="/search" className="block text-sm opacity-50 hover:opacity-100 font-medium">Recipes</Link>
                <Link href="/roasters" className="block text-sm opacity-50 hover:opacity-100 font-medium">Roasters</Link>
                <Link href="/leaderboard" className="block text-sm opacity-50 hover:opacity-100 font-medium">Leaderboard</Link>
                <Link href="/events" className="block text-sm opacity-50 hover:opacity-100 font-medium">Events</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider opacity-60">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">About</a>
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">Blog</a>
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">Careers</a>
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider opacity-60">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">Privacy Policy</a>
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">Terms of Service</a>
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">Cookie Policy</a>
              </div>
            </div>
          </div>
          <div className="border-t border-espresso/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs opacity-30 font-medium">&copy; {new Date().getFullYear()} BrewCraft. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="size-8 rounded-full bg-espresso/5 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <MaterialIcon icon="language" className="text-sm opacity-50" />
              </a>
              <a href="#" className="size-8 rounded-full bg-espresso/5 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <MaterialIcon icon="mail" className="text-sm opacity-50" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
