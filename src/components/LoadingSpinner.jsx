import React from 'react';
import Lottie from 'lottie-react';

// Simple loading animation data
const loadingAnimation = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: 'Loading',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Circle',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 120, s: [360] },
          ],
        },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'el',
              s: { a: 0, k: [80, 80] },
              p: { a: 0, k: [0, 0] },
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.2, 0.5, 1, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 8 },
              lc: 2,
              lj: 1,
              d: [
                { n: 'o', nm: 'offset', v: { a: 0, k: 0 } },
                { n: 'd', nm: 'dash', v: { a: 0, k: 40 } },
                { n: 'g', nm: 'gap', v: { a: 0, k: 40 } },
              ],
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
            },
          ],
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
  ],
};

const LoadingSpinner = ({ size = 100, text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div style={{ width: size, height: size }}>
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
        />
      </div>
      {text && (
        <p className="mt-4 text-gray-600 font-semibold text-lg animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
