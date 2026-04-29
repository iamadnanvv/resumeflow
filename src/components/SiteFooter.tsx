import { Logo } from "./Logo";
import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t mt-24">
      <div className="container py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Logo />
          <p className="text-sm text-muted-foreground mt-4 max-w-xs">
            Build ATS-friendly resumes powered by AI. Land interviews faster.
          </p>
        </div>
        <div>
          <div className="font-medium mb-3 text-sm">Product</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/#features" className="hover:text-foreground">Features</Link></li>
            <li><Link to="/#templates" className="hover:text-foreground">Templates</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-3 text-sm">Solutions</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/ats-resume" className="hover:text-foreground">ATS Resume</Link></li>
            <li><Link to="/resume-builder" className="hover:text-foreground">Resume Builder</Link></li>
            <li><Link to="/cover-letter-generator" className="hover:text-foreground">Cover Letter Generator</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-3 text-sm">Account</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/dashboard" className="hover:text-foreground">Sign in</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/billing" className="hover:text-foreground">Billing</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-6 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
          <span>© {new Date().getFullYear()} resumelylite. All rights reserved.</span>
          <span>
            This platform is developed by{" "}
            <a
              href="https://www.linkedin.com/in/muhammedadnanvv/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Muhammed Adnan Vv
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}