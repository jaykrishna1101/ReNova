"use client"

import Link from "next/link"
import { Recycle, Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Recycle className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">
                <span className="text-foreground">Re</span>
                <span className="text-primary">Nova</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">Transform e-waste into sustainable value with AI-powered precision.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-foreground font-medium mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/marketplace" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Sell E-Waste
                </Link>
              </li>
              <li>
                <Link href="#impact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Impact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="mailto:jkkhond@gmail.com" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">© 2026 ReNova. Building a sustainable future.</p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/jaykrishna1101"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Github className="w-4 h-4" />
            </Link>
            <Link
              href="https://x.com/jaykrishna1101"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/jaykrishna-khond-68a36822a"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
