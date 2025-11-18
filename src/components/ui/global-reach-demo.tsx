import { WorldMap } from "@/components/ui/world-map";
import { motion } from "framer-motion";

export function GlobalReachDemo() {
  return (
    <div className="py-20 bg-white w-full">
      <div className="max-w-7xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Global{" "}
            <span className="text-gray-500">
              {"Partnerships".split("").map((letter, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Connecting Sri Lanka to the world's leading hardware manufacturers and suppliers. 
            Our global network ensures quality products and reliable partnerships.
          </p>
        </motion.div>
        
        <WorldMap
          dots={[
            {
              start: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka (Colombo)
              end: { lat: 35.6762, lng: 139.6503 }, // Japan (Tokyo)
            },
            {
              start: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka (Colombo)
              end: { lat: 51.5074, lng: -0.1278 }, // United Kingdom (London)
            },
            {
              start: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka (Colombo)
              end: { lat: 52.5200, lng: 13.4050 }, // Germany (Berlin)
            },
            {
              start: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka (Colombo)
              end: { lat: 40.7128, lng: -74.0060 }, // USA (New York)
            },
            {
              start: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka (Colombo)
              end: { lat: 31.2304, lng: 121.4737 }, // China (Shanghai)
            },
            {
              start: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka (Colombo)
              end: { lat: -33.8688, lng: 151.2093 }, // Australia (Sydney)
            },
          ]}
          lineColor="#3b82f6"
        />
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="text-center">
            <div className="text-2xl font-light text-gray-900 mb-1">50+</div>
            <div className="text-sm text-gray-600">International Brands</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light text-gray-900 mb-1">6</div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light text-gray-900 mb-1">24/7</div>
            <div className="text-sm text-gray-600">Global Support</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light text-gray-900 mb-1">30+</div>
            <div className="text-sm text-gray-600">Years Experience</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}