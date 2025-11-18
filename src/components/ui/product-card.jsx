"use client"

import React from "react"
import { motion, useReducedMotion } from "motion/react"
import { ShoppingCart, Star, Eye, Package } from "lucide-react"
import { useState } from "react"
import { cn } from "../../lib/utils"

export function ProductCard({
  name = "Premium Power Drill",
  description = "Professional grade cordless drill with LED light and 20V battery",
  image = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop&auto=format&q=80",
  price = "Rs. 12,500",
  originalPrice = null,
  discount = null,
  rating = 4.5,
  inStock = true,
  enableAnimations = true,
  className,
  onAddToCart = () => {},
  onQuickView = () => {},
  isInCart = false,
}) {
  const [hovered, setHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion

  const containerVariants = {
    rest: { 
      scale: 1,
      y: 0,
      filter: "blur(0px)",
    },
    hover: shouldAnimate ? { 
      scale: 1.02, 
      y: -4,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 28,
        mass: 0.6,
      }
    } : {},
  }

  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  }

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      filter: "blur(4px)",
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.6,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 15,
      scale: 0.95,
      filter: "blur(2px)",
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      },
    },
  }

  return (
    <motion.div
      data-slot="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      className={cn(
        "relative w-80 h-96 rounded-3xl border border-gray-200 overflow-hidden shadow-xl cursor-pointer group bg-white",
        className
      )}
    >
      {/* Full Cover Image */}
      <motion.img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
        variants={imageVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* Discount Badge */}
      {discount && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10"
        >
          -{discount}%
        </motion.div>
      )}

      {/* Stock Status Badge */}
      {!inStock && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold z-10"
        >
          Out of Stock
        </motion.div>
      )}

      {/* Smooth Blur Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-black/20 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/60 via-black/30 via-black/15 via-black/8 to-transparent backdrop-blur-[1px]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent backdrop-blur-sm" />

      {/* Content */}
      <motion.div 
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-0 left-0 right-0 p-6 space-y-3"
      >
        {/* Product Name */}
        <motion.h2 
          variants={itemVariants}
          className="text-2xl font-bold text-white line-clamp-2"
        >
          {name}
        </motion.h2>

        {/* Description */}
        <motion.p 
          variants={itemVariants}
          className="text-gray-300 text-sm leading-relaxed line-clamp-2"
        >
          {description}
        </motion.p>

        {/* Stats - Rating and Stock */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-6 pt-2"
        >
          <div className="flex items-center gap-2 text-gray-300">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-white">{rating}</span>
            <span className="text-sm">rating</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Package className="w-4 h-4" />
            <span className="text-sm">{inStock ? 'In Stock' : 'Out of Stock'}</span>
          </div>
        </motion.div>

        {/* Price and Actions */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between pt-2"
        >
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-gray-400 text-sm line-through">{originalPrice}</span>
            )}
            <span className="text-2xl font-bold text-white">{price}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onQuickView}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              <Eye className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Add to Cart Button */}
        <motion.button
          variants={itemVariants}
          onClick={onAddToCart}
          disabled={!inStock}
          whileHover={{ 
            scale: inStock ? 1.02 : 1,
            transition: { type: "spring", stiffness: 400, damping: 25 }
          }}
          whileTap={{ scale: inStock ? 0.98 : 1 }}
          className={cn(
            "w-full cursor-pointer py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2",
            "border border-white/20 shadow-sm",
            inStock
              ? isInCart 
                ? "bg-white/10 text-white hover:bg-white/20" 
                : "bg-white text-black hover:bg-gray-100"
              : "bg-gray-700 text-gray-400 cursor-not-allowed",
            "transform-gpu"
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          {!inStock ? "Out of Stock" : isInCart ? "Added to Cart" : "Add to Cart"}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
