import { Globe } from "@/components/ui/globe"

export function ContactGlobeSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-light text-gray-900">
                Global Hardware Solutions
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Connecting Sri Lanka to the world's best hardware suppliers. 
                Our global network ensures access to premium quality products 
                from trusted manufacturers across Asia, Europe, and America.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Direct partnerships with 50+ global suppliers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Island-wide delivery network</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">International quality standards</span>
                </div>
              </div>
              
              <div className="pt-4">
                <button className="bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
                  View Our Partners
                </button>
              </div>
            </div>

            {/* Globe */}
            <div className="relative h-[500px] flex items-center justify-center">
              <div className="relative w-full max-w-[500px] h-[500px]">
                <Globe 
                  className="top-0" 
                  config={{
                    width: 500,
                    height: 500,
                    onRender: () => {},
                    devicePixelRatio: 2,
                    phi: 0,
                    theta: 0.3,
                    dark: 0,
                    diffuse: 0.4,
                    mapSamples: 16000,
                    mapBrightness: 1.2,
                    baseColor: [0.9, 0.9, 0.9],
                    markerColor: [251 / 255, 100 / 255, 21 / 255],
                    glowColor: [0.9, 0.9, 0.9],
                    markers: [
                      // Sri Lanka (main location)
                      { location: [7.8731, 80.7718], size: 0.12 },
                      // Major supplier countries
                      { location: [35.6762, 139.6503], size: 0.08 }, // Tokyo, Japan
                      { location: [39.9042, 116.4074], size: 0.08 }, // Beijing, China
                      { location: [1.3521, 103.8198], size: 0.06 }, // Singapore
                      { location: [37.5665, 126.9780], size: 0.06 }, // Seoul, South Korea
                      { location: [28.7041, 77.1025], size: 0.07 }, // Delhi, India
                      { location: [52.5200, 13.4050], size: 0.06 }, // Berlin, Germany
                      { location: [40.7128, -74.0060], size: 0.07 }, // New York, USA
                      { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney, Australia
                    ],
                  }}
                />
                {/* Subtle overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}