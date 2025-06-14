export function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="py-8 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        <p className="text-center text-sm text-gray-500">&copy; {currentYear} Retail-Link. All rights reserved.</p>
      </div>
    </footer>
  )
}
