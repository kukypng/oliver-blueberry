
/**
 * iOS Design System Tokens - Oliver App
 * Tokens otimizados para dispositivos Apple e experiência mobile-first
 */

export const iosDesignTokens = {
  // Safe Areas e Viewport
  safeArea: {
    top: 'env(safe-area-inset-top, 20px)',
    bottom: 'env(safe-area-inset-bottom, 20px)',
    left: 'env(safe-area-inset-left, 16px)',
    right: 'env(safe-area-inset-right, 16px)',
  },

  // Spacing System (Apple HIG)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px', // Base unit
    lg: '24px',
    xl: '32px',
    '2xl': '44px', // Minimum touch target
    '3xl': '64px',
  },

  // Typography Scale (iOS optimized)
  typography: {
    fontFamily: {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    fontSize: {
      caption: ['11px', { lineHeight: '13px', letterSpacing: '0.07px' }],
      footnote: ['13px', { lineHeight: '18px', letterSpacing: '-0.08px' }],
      subheadline: ['15px', { lineHeight: '20px', letterSpacing: '-0.24px' }],
      callout: ['16px', { lineHeight: '21px', letterSpacing: '-0.32px' }],
      body: ['17px', { lineHeight: '22px', letterSpacing: '-0.41px' }],
      headline: ['17px', { lineHeight: '22px', letterSpacing: '-0.41px', fontWeight: '600' }],
      title3: ['20px', { lineHeight: '25px', letterSpacing: '0.38px', fontWeight: '400' }],
      title2: ['22px', { lineHeight: '28px', letterSpacing: '0.35px', fontWeight: '700' }],
      title1: ['28px', { lineHeight: '34px', letterSpacing: '0.36px', fontWeight: '700' }],
      largeTitle: ['34px', { lineHeight: '41px', letterSpacing: '0.37px', fontWeight: '700' }],
    },
  },

  // Border Radius (iOS style)
  borderRadius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px', // iOS standard
    xl: '20px',
    '2xl': '24px',
    full: '50%',
  },

  // Shadows (iOS layered)
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 2px 4px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.16)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.24)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.16), 0 16px 32px rgba(0, 0, 0, 0.32)',
  },

  // Animation (iOS spring curves)
  animation: {
    spring: {
      gentle: 'cubic-bezier(0.16, 1, 0.3, 1)',
      smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      snappy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
  },

  // Touch Targets
  touchTarget: {
    minimum: '44px', // Apple HIG minimum
    comfortable: '48px',
    large: '56px',
  },

  // iOS Status Colors
  statusColors: {
    success: {
      background: 'hsl(122, 39%, 49%)', // iOS Green
      foreground: 'hsl(0, 0%, 100%)',
      subtle: 'hsl(120, 60%, 95%)',
    },
    warning: {
      background: 'hsl(35, 77%, 49%)', // iOS Orange
      foreground: 'hsl(0, 0%, 100%)',
      subtle: 'hsl(35, 84%, 95%)',
    },
    error: {
      background: 'hsl(1, 83%, 63%)', // iOS Red
      foreground: 'hsl(0, 0%, 100%)',
      subtle: 'hsl(1, 90%, 95%)',
    },
    info: {
      background: 'hsl(218, 85%, 61%)', // iOS Blue
      foreground: 'hsl(0, 0%, 100%)',
      subtle: 'hsl(218, 100%, 95%)',
    },
  },
};

// CSS Custom Properties Generator
export const generateIOSCSSVariables = () => {
  return `
    :root {
      /* Safe Area */
      --safe-area-inset-top: ${iosDesignTokens.safeArea.top};
      --safe-area-inset-bottom: ${iosDesignTokens.safeArea.bottom};
      --safe-area-inset-left: ${iosDesignTokens.safeArea.left};
      --safe-area-inset-right: ${iosDesignTokens.safeArea.right};
      
      /* iOS Spring Animations */
      --spring-gentle: ${iosDesignTokens.animation.spring.gentle};
      --spring-smooth: ${iosDesignTokens.animation.spring.smooth};
      --spring-snappy: ${iosDesignTokens.animation.spring.snappy};
      
      /* Touch Targets */
      --touch-target-min: ${iosDesignTokens.touchTarget.minimum};
      --touch-target-comfortable: ${iosDesignTokens.touchTarget.comfortable};
      --touch-target-large: ${iosDesignTokens.touchTarget.large};
    }
    
    /* iOS Scroll Optimization */
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }
    
    .ios-scroll {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: none;
      scroll-behavior: smooth;
    }
    
    /* iOS Safe Area Classes */
    .safe-top { padding-top: var(--safe-area-inset-top); }
    .safe-bottom { padding-bottom: var(--safe-area-inset-bottom); }
    .safe-left { padding-left: var(--safe-area-inset-left); }
    .safe-right { padding-right: var(--safe-area-inset-right); }
    .safe-all { 
      padding-top: var(--safe-area-inset-top);
      padding-bottom: var(--safe-area-inset-bottom);
      padding-left: var(--safe-area-inset-left);
      padding-right: var(--safe-area-inset-right);
    }
  `;
};
