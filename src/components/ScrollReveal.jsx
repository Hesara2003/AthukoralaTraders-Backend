import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ScrollReveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  const initial = {
    opacity: 0,
    ...directions[direction],
  };

  const animate = {
    opacity: inView ? 1 : 0,
    y: inView ? 0 : directions[direction].y,
    x: inView ? 0 : directions[direction].x,
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
