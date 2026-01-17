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
              {["Marketplace", "AI Analysis", "Impact", "Pricing"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              {["Privacy", "Terms", "Security"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">© 2026 ReNova. Building a sustainable future.</p>
          <div className="flex items-center gap-4">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Icon className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
