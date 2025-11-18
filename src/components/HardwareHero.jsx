"use client"

import React from "react"
import { LayoutGroup, motion } from "motion/react"
import { TextRotate } from "./ui/text-rotate"
import Floating, { FloatingElement } from "./ui/parallax-floating"
import { Link } from "react-router-dom"

// Hardware-themed images from Unsplash
const hardwareImages = [
  {
    url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2340&auto=format&fit=crop",
    title: "Power Tools",
  },
  {
    url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2340&auto=format&fit=crop",
    title: "Hardware Tools Collection",
  },
  {
    url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=2340&auto=format&fit=crop",
    title: "Drill and Construction Tools",
  },
  {
    url: "https://images.unsplash.com/photo-1530435460869-d13625c69bbf?q=80&w=2340&auto=format&fit=crop",
    title: "Measuring Tools",
  },
  {
    url: "https://images.unsplash.com/photo-1586864387634-22f8a8b7e3c7?q=80&w=2340&auto=format&fit=crop",
    title: "Screws and Fasteners",
  },
  {
    url: "https://images.unsplash.com/photo-1591453089344-7f4c9e5f6919?q=80&w=2340&auto=format&fit=crop",
    title: "Wrenches and Hand Tools",
  },
  {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2340&auto=format&fit=crop",
    title: "Paint and Hardware Supplies",
  },
  {
    url: "https://images.unsplash.com/photo-1606510907744-ca1c0a53f1ac?q=80&w=2340&auto=format&fit=crop",
    title: "Toolbox with Tools",
  },
]

function HardwareHero() {
  return (
    <section className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center relative bg-gradient-to-b from-gray-50 to-white">
      <Floating sensitivity={-0.5} className="h-full w-full">
        <FloatingElement
          depth={0.5}
          className="top-[15%] left-[2%] md:top-[25%] md:left-[5%]"
        >
          <motion.img
            src={hardwareImages[0].url}
            alt={hardwareImages[0].title}
            className="w-16 h-12 sm:w-24 sm:h-16 md:w-28 md:h-20 lg:w-32 lg:h-24 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[3deg] shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={1}
          className="top-[0%] left-[8%] md:top-[6%] md:left-[11%]"
        >
          <motion.img
            src={hardwareImages[1].url}
            alt={hardwareImages[1].title}
            className="w-40 h-28 sm:w-48 sm:h-36 md:w-56 md:h-44 lg:w-60 lg:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-12 shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={4}
          className="top-[90%] left-[6%] md:top-[80%] md:left-[8%]"
        >
          <motion.img
            src={hardwareImages[2].url}
            alt={hardwareImages[2].title}
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-64 lg:h-64 object-cover -rotate-[4deg] hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={2}
          className="top-[0%] left-[87%] md:top-[2%] md:left-[83%]"
        >
          <motion.img
            src={hardwareImages[3].url}
            alt={hardwareImages[3].title}
            className="w-40 h-36 sm:w-48 sm:h-44 md:w-60 md:h-52 lg:w-64 lg:h-56 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[6deg] rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          />
        </FloatingElement>

        <FloatingElement
          depth={1}
          className="top-[78%] left-[83%] md:top-[68%] md:left-[83%]"
        >
          <motion.img
            src={hardwareImages[4].url}
            alt={hardwareImages[4].title}
            className="w-44 h-44 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[19deg] rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          />
        </FloatingElement>
      </Floating>

      <div className="flex flex-col justify-center items-center w-[250px] sm:w-[300px] md:w-[500px] lg:w-[700px] z-50 pointer-events-auto">
        <motion.h1
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-center w-full justify-center items-center flex-col flex whitespace-pre leading-tight font-bold tracking-tight space-y-1 md:space-y-4"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.3 }}
        >
          <span>Build your </span>
          <LayoutGroup>
            <motion.span layout className="flex whitespace-pre">
              <motion.span
                layout
                className="flex whitespace-pre"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              >
                projects{" "}
              </motion.span>
              <TextRotate
                texts={[
                  "better",
                  "stronger",
                  "faster",
                  "smarter",
                  "right",
                  "perfect",
                  "professional",
                  "solid",
                  "reliable",
                  "easier",
                  "quality",
                  "tough",
                  "precise",
                ]}
                mainClassName="overflow-hidden pr-3 text-blue-600 py-0 pb-2 md:pb-4 rounded-xl"
                staggerDuration={0.03}
                staggerFrom="last"
                rotationInterval={3000}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
            </motion.span>
          </LayoutGroup>
        </motion.h1>
        <motion.p
          className="text-sm sm:text-lg md:text-xl lg:text-2xl text-center text-gray-700 pt-4 sm:pt-8 md:pt-10 lg:pt-12"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.5 }}
        >
          Your trusted partner for quality tools, hardware supplies, and building materials. Everything you need, all in one place.
        </motion.p>

        <div className="flex flex-row justify-center space-x-4 items-center mt-10 sm:mt-16 md:mt-20 lg:mt-20 text-xs">
          <motion.button
            className="sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight text-white bg-gray-900 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-3 rounded-full z-20 shadow-2xl hover:bg-gray-800 transition-colors"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
              delay: 0.7,
              scale: { duration: 0.2 },
            }}
            whileHover={{
              scale: 1.05,
              transition: { type: "spring", damping: 30, stiffness: 400 },
            }}
          >
            <Link to="/products">
              Shop Now <span className="ml-1">→</span>
            </Link>
          </motion.button>
          <motion.button
            className="sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight text-white bg-blue-600 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-3 rounded-full z-20 shadow-2xl hover:bg-blue-700 transition-colors"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
              delay: 0.7,
              scale: { duration: 0.2 },
            }}
            whileHover={{
              scale: 1.05,
              transition: { type: "spring", damping: 30, stiffness: 400 },
            }}
          >
            <Link to="/about">Learn More</Link>
          </motion.button>
        </div>
      </div>
    </section>
  )
}

export { HardwareHero }
