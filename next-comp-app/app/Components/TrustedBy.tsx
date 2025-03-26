// app/Components/TrustedBy.tsx
export default function TrustedBy() {
    return (
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">
              Trusted by legal professionals across South Carolina
            </h2>
            <div className="mx-auto mt-10 grid grid-cols-4 items-center gap-x-8 gap-y-10 sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:grid-cols-5">
              {/* Replace these placeholder divs with actual logos of law firms or organizations */}
              <div className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1">
                <div className="h-12 w-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500 font-semibold">
                  Law Firm
                </div>
              </div>
              <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1">
                <div className="h-12 w-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500 font-semibold">
                  Insurance Co
                </div>
              </div>
              <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1">
                <div className="h-12 w-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500 font-semibold">
                  Legal Group
                </div>
              </div>
              <div className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1">
                <div className="h-12 w-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500 font-semibold">
                  Adjuster Firm
                </div>
              </div>
              <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1">
                <div className="h-12 w-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500 font-semibold">
                  Association
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }