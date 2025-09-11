/**
 * 🚀 CONFIGURACIÓN DE OPTIMIZACIÓN DE BUNDLE
 * Configuración adicional para optimizar el tamaño y rendimiento del bundle
 */

// Análisis del bundle
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Configuración de PWA (opcional)
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/**
 * Configuración de optimización del bundle
 */
const bundleOptimization = {
  // Configuración de compresión
  compression: {
    gzip: true,
    brotli: true,
  },
  
  // Configuración de tree shaking
  treeShaking: {
    // Eliminar código no utilizado
    unusedExports: true,
    sideEffects: false,
  },
  
  // Configuración de minificación
  minification: {
    removeComments: true,
    removeWhitespace: true,
    mangleProps: /^_/,
  },
  
  // Configuración de code splitting
  codeSplitting: {
    chunks: 'all',
    maxSize: 250000, // 250KB máximo por chunk
    minSize: 20000,  // 20KB mínimo por chunk
  },
};

/**
 * Utilidades para optimización
 */
const optimizationUtils = {
  // Calcular tamaño del bundle
  calculateBundleSize: (stats) => {
    const assets = stats.toJson().assets;
    const totalSize = assets.reduce((total, asset) => total + asset.size, 0);
    return {
      totalSize: (totalSize / 1024 / 1024).toFixed(2) + ' MB',
      jsSize: assets
        .filter(asset => asset.name.endsWith('.js'))
        .reduce((total, asset) => total + asset.size, 0),
      cssSize: assets
        .filter(asset => asset.name.endsWith('.css'))
        .reduce((total, asset) => total + asset.size, 0),
    };
  },
  
  // Validar performance budgets
  validatePerformanceBudget: (stats) => {
    const { jsSize, cssSize } = optimizationUtils.calculateBundleSize(stats);
    const budgets = {
      maxJsSize: 500 * 1024,   // 500KB
      maxCssSize: 100 * 1024,  // 100KB
    };
    
    return {
      jsBudgetOk: jsSize <= budgets.maxJsSize,
      cssBudgetOk: cssSize <= budgets.maxCssSize,
      warnings: [
        ...(jsSize > budgets.maxJsSize ? ['⚠️ JS bundle size exceeds budget'] : []),
        ...(cssSize > budgets.maxCssSize ? ['⚠️ CSS bundle size exceeds budget'] : []),
      ],
    };
  },
};

/**
 * Plugin de análisis de rendimiento
 */
class PerformanceAnalysisPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('PerformanceAnalysisPlugin', (compilation) => {
      if (process.env.NODE_ENV === 'production') {
        const stats = compilation.getStats();
        const bundleInfo = optimizationUtils.calculateBundleSize(stats);
        const budgetCheck = optimizationUtils.validatePerformanceBudget(stats);
        
        console.log('\n🚀 ANÁLISIS DE BUNDLE:');
        console.log(`📦 Tamaño total: ${bundleInfo.totalSize}`);
        console.log(`📄 JavaScript: ${(bundleInfo.jsSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`🎨 CSS: ${(bundleInfo.cssSize / 1024).toFixed(2)} KB`);
        
        if (budgetCheck.warnings.length > 0) {
          console.log('\n⚠️ ADVERTENCIAS:');
          budgetCheck.warnings.forEach(warning => console.log(warning));
        } else {
          console.log('\n✅ Performance budget: PASSED');
        }
      }
    });
  }
}

module.exports = {
  withBundleAnalyzer,
  withPWA,
  bundleOptimization,
  optimizationUtils,
  PerformanceAnalysisPlugin,
};
