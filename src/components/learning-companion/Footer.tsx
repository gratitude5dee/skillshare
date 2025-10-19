import geminiLogo from "@/assets/gemini-logo.png";
import { Twitter, Linkedin, Github, Youtube } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#050816] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={geminiLogo} alt="WZRD.work" className="w-10 h-10" />
              <span className="text-xl font-headline font-bold text-white">
                WZRD.work
              </span>
            </div>
            <p className="text-white/60 text-sm mb-6">
              Intelligent automation for modern teams
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Github, label: 'GitHub' },
                { icon: Youtube, label: 'YouTube' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Columns */}
          {[
            {
              title: 'Product',
              links: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'],
            },
            {
              title: 'Resources',
              links: ['Documentation', 'Blog', 'Case Studies', 'Community', 'Support'],
            },
            {
              title: 'Company',
              links: ['About', 'Careers', 'Contact', 'Privacy', 'Terms'],
            },
          ].map((column) => (
            <div key={column.title}>
              <h4 className="text-white font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2025 WZRD.work. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Security'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
