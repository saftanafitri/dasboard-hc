import React from 'react';

/**
 * Reusable SVG Linear Gradients for Recharts
 * Brand colors: Hijau Tua (#05473A), Hijau Emerald (#1F7A5C), Orange (#FF5A1F), Amber (#F59E0B)
 */
export const ChartGradients: React.FC = () => {
  return (
    <defs>
      {/* 1. Orange Horizontal Gradient (left to right) */}
      <linearGradient id="orangeGradH" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#EA580C" stopOpacity={0.9} />
        <stop offset="60%" stopColor="#FF5A1F" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#FFA07A" stopOpacity={1} />
      </linearGradient>

      {/* 2. Orange Vertical Gradient (top to bottom) */}
      <linearGradient id="orangeGradV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFA07A" stopOpacity={1} />
        <stop offset="60%" stopColor="#FF5A1F" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#EA580C" stopOpacity={0.9} />
      </linearGradient>

      {/* 3. Emerald Green Horizontal Gradient (left to right) */}
      <linearGradient id="greenGradH" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#05473A" stopOpacity={0.95} />
        <stop offset="60%" stopColor="#0E5E4A" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#1F7A5C" stopOpacity={1} />
      </linearGradient>

      {/* 4. Emerald Green Vertical Gradient (top to bottom) */}
      <linearGradient id="greenGradV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1F7A5C" stopOpacity={1} />
        <stop offset="60%" stopColor="#0E5E4A" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#05473A" stopOpacity={0.95} />
      </linearGradient>

      {/* 5. Amber Horizontal Gradient */}
      <linearGradient id="amberGradH" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#D97706" stopOpacity={0.9} />
        <stop offset="60%" stopColor="#F59E0B" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#FCD34D" stopOpacity={1} />
      </linearGradient>

      {/* 6. Amber Vertical Gradient */}
      <linearGradient id="amberGradV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FCD34D" stopOpacity={1} />
        <stop offset="60%" stopColor="#F59E0B" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#D97706" stopOpacity={0.9} />
      </linearGradient>

      {/* 7. Area Fill - Emerald Green */}
      <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1F7A5C" stopOpacity={0.45} />
        <stop offset="60%" stopColor="#1F7A5C" stopOpacity={0.15} />
        <stop offset="100%" stopColor="#1F7A5C" stopOpacity={0.01} />
      </linearGradient>

      {/* 8. Area Fill - Orange */}
      <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FF5A1F" stopOpacity={0.45} />
        <stop offset="60%" stopColor="#FF5A1F" stopOpacity={0.15} />
        <stop offset="100%" stopColor="#FF5A1F" stopOpacity={0.01} />
      </linearGradient>

      {/* 9. Donut Slices Gradients */}
      <linearGradient id="sliceOrangeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF7A45" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>

      <linearGradient id="sliceGreenGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1F7A5C" />
        <stop offset="100%" stopColor="#05473A" />
      </linearGradient>

      <linearGradient id="sliceAmberGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>

      <linearGradient id="sliceSageGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#0B5D48" />
      </linearGradient>

      <linearGradient id="sliceDeepGreenGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1F7A5C" />
        <stop offset="100%" stopColor="#05473A" />
      </linearGradient>

      {/* 10. Active Filter Highlight Gradient */}
      <linearGradient id="activeHighlightGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FF5A1F" stopOpacity={1} />
        <stop offset="100%" stopColor="#FF8A48" stopOpacity={1} />
      </linearGradient>
    </defs>
  );
};

export const GRADIENT_SLICE_IDS = [
  'url(#sliceOrangeGrad)',
  'url(#sliceGreenGrad)',
  'url(#sliceAmberGrad)',
  'url(#sliceSageGrad)',
  'url(#sliceDeepGreenGrad)',
];
