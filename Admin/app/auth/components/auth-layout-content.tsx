import { CheckCircle2 } from "lucide-react"

export function AuthLayoutContent() {
  return (
    <div className="hidden lg:flex flex-col justify-center px-12 pb-12 pt-24 xl:px-20 xl:pb-20 xl:pt-28 bg-white h-full">
      {/* New wrapper div for content with max-width */}
      <div className="w-full max-w-xl">
        <h1 className="text-5xl xl:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
          Start your business journey with <span className="whitespace-nowrap">Retail-Link</span>
        </h1>
        <p className="text-base xl:text-lg text-gray-700 mb-10">
          Try Retail-Link for free, and explore all the tools and services you need to start, run, and grow your
          business.
        </p>
        <ul className="space-y-5 mb-10">
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-800">14-day free trial</span>
              <p className="text-sm text-gray-600">No credit card required</p>
            </div>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-800">24/7 support</span>
              <p className="text-sm text-gray-600">Get help when you need it</p>
            </div>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-800">Cancel anytime</span>
              <p className="text-sm text-gray-600">No long-term contracts</p>
            </div>
          </li>
        </ul>
        <p className="text-xs text-gray-600">Trusted by over 1,000,000 businesses worldwide</p>
      </div>
    </div>
  )
}
