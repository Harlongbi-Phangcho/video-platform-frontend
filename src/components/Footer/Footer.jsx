import { Link } from "react-router-dom";
import { FiYoutube, FiTwitter, FiGithub, FiInstagram } from "react-icons/fi";

const FOOTER_LINKS = {
  Company: [
    { label: "About", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Press", to: "/press" },
    { label: "Blog", to: "/blog" },
  ],
  Explore: [
    { label: "Trending", to: "/trending" },
    { label: "Categories", to: "/categories" },
    { label: "Creators", to: "/creators" },
    { label: "Live", to: "/live" },
  ],
  Support: [
    { label: "Help Center", to: "/help" },
    { label: "Community", to: "/community" },
    { label: "Report Content", to: "/report" },
    { label: "Contact Us", to: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Cookie Policy", to: "/cookies" },
    { label: "Guidelines", to: "/guidelines" },
  ],
};

const SOCIAL_LINKS = [
  { icon: FiTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: FiInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FiGithub, href: "https://github.com", label: "GitHub" },
  { icon: FiYoutube, href: "https://youtube.com", label: "YouTube" },
];

function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 text-zinc-400 mt-auto">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <Link to="/" className="text-xl font-bold text-white">
            My<span className="text-red-500">Tube</span>
          </Link>
          <p className="text-sm leading-relaxed">
            Watch, upload, and share videos with creators around the world.
          </p>
          {/* Social icons */}
          <div className="flex gap-3 mt-1">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-zinc-500 hover:text-white transition"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading} className="flex flex-col gap-3">
            <h3 className="text-white text-sm font-semibold tracking-wide">
              {heading}
            </h3>
            {links.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="text-sm hover:text-white transition"
              >
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800 px-6 py-4 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} MyTube. All rights reserved.</p>
        <p>
          Made with{" "}
          <span className="text-red-500">&hearts;</span>{" "}
          for creators everywhere
        </p>
      </div>
    </footer>
  );
}

export default Footer;