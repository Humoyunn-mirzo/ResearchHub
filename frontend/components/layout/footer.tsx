import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold">ResearchHub</h3>
            <p className="text-sm text-muted-foreground">
              Connecting students and professors for collaborative research opportunities.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/projects" className="text-muted-foreground hover:text-foreground">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link href="/rankings" className="text-muted-foreground hover:text-foreground">
                  Rankings
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {currentYear} ResearchHub. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
