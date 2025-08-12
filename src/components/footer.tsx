export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      {/* Top section */}
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <img src="/logo.svg" alt="EventHub logo" className="h-8 w-48" />
          </div>
          <p className="text-sm text-gray-600">
            Discover the best events around you.
          </p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-900">Product</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><a href="/">Home</a></li>
            <li><a href="/events">All Events</a></li>
            <li><a href="/#how">How it works</a></li>
            <li><a href="/#faq">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-900">Legal</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/support">Support</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-900">Account</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><a href="/auth/login">Sign in</a></li>
            <li><a href="/auth/signup">Sign up</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-gray-500">
          <span>© {year} CMHOHIO</span>
        </div>
      </div>
    </footer>
  );
}
