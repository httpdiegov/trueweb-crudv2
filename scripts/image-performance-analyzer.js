/**
 * 🚀 ANÁLISIS DE RENDIMIENTO DE IMÁGENES
 * Script para medir el impacto de las optimizaciones implementadas
 */

// Performance metrics collector
class ImagePerformanceAnalyzer {
  constructor() {
    this.metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      loadTimes: [],
      imageSizes: [],
      formats: {},
      cacheHits: 0,
      startTime: performance.now()
    };
    
    this.setupObservers();
  }

  setupObservers() {
    // Observe all image elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.observeImages(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Observe existing images
    this.observeImages(document.body);
  }

  observeImages(container) {
    const images = container.querySelectorAll('img[data-nimg], picture img');
    
    images.forEach((img) => {
      if (img.dataset.observed) return;
      img.dataset.observed = 'true';
      
      this.metrics.totalImages++;
      const startTime = performance.now();
      
      img.addEventListener('load', () => {
        this.metrics.loadedImages++;
        this.metrics.loadTimes.push(performance.now() - startTime);
        
        // Analyze image format and size
        this.analyzeImage(img);
      });
      
      img.addEventListener('error', () => {
        this.metrics.failedImages++;
      });
    });
  }

  analyzeImage(img) {
    // Get image format from src
    const format = this.getImageFormat(img.src);
    this.metrics.formats[format] = (this.metrics.formats[format] || 0) + 1;
    
    // Try to get actual size if possible
    if (img.naturalWidth && img.naturalHeight) {
      const size = img.naturalWidth * img.naturalHeight;
      this.metrics.imageSizes.push(size);
    }
  }

  getImageFormat(src) {
    if (src.includes('_next/image')) return 'next-optimized';
    if (src.includes('.webp')) return 'webp';
    if (src.includes('.avif')) return 'avif';
    if (src.includes('.jpg') || src.includes('.jpeg')) return 'jpeg';
    if (src.includes('.png')) return 'png';
    return 'unknown';
  }

  generateReport() {
    const avgLoadTime = this.metrics.loadTimes.length > 0 
      ? this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length 
      : 0;
    
    const successRate = this.metrics.totalImages > 0 
      ? ((this.metrics.loadedImages / this.metrics.totalImages) * 100).toFixed(1)
      : 0;

    const totalTime = performance.now() - this.metrics.startTime;

    const report = {
      timestamp: new Date().toISOString(),
      totalTime: `${(totalTime / 1000).toFixed(2)}s`,
      images: {
        total: this.metrics.totalImages,
        loaded: this.metrics.loadedImages,
        failed: this.metrics.failedImages,
        successRate: `${successRate}%`
      },
      performance: {
        avgLoadTime: `${avgLoadTime.toFixed(2)}ms`,
        fastestLoad: this.metrics.loadTimes.length > 0 ? `${Math.min(...this.metrics.loadTimes).toFixed(2)}ms` : 'N/A',
        slowestLoad: this.metrics.loadTimes.length > 0 ? `${Math.max(...this.metrics.loadTimes).toFixed(2)}ms` : 'N/A'
      },
      formats: this.metrics.formats,
      optimization: {
        modernFormats: (this.metrics.formats.webp || 0) + (this.metrics.formats.avif || 0) + (this.metrics.formats['next-optimized'] || 0),
        legacyFormats: (this.metrics.formats.jpeg || 0) + (this.metrics.formats.png || 0),
        optimizationRate: this.metrics.totalImages > 0 
          ? `${(((this.metrics.formats.webp || 0) + (this.metrics.formats.avif || 0) + (this.metrics.formats['next-optimized'] || 0)) / this.metrics.totalImages * 100).toFixed(1)}%`
          : '0%'
      }
    };

    return report;
  }

  displayReport() {
    const report = this.generateReport();
    
    console.group('🚀 REPORTE DE RENDIMIENTO DE IMÁGENES');
    console.log('📊 Estadísticas Generales:');
    console.table({
      'Tiempo Total': report.totalTime,
      'Imágenes Cargadas': `${report.images.loaded}/${report.images.total}`,
      'Tasa de Éxito': report.images.successRate,
      'Tiempo Promedio': report.performance.avgLoadTime
    });
    
    console.log('🎨 Formatos de Imagen:');
    console.table(report.formats);
    
    console.log('⚡ Optimización:');
    console.table({
      'Formatos Modernos': report.optimization.modernFormats,
      'Formatos Legacy': report.optimization.legacyFormats,
      'Tasa de Optimización': report.optimization.optimizationRate
    });
    
    console.log('📈 Rendimiento:');
    console.table({
      'Carga Más Rápida': report.performance.fastestLoad,
      'Carga Más Lenta': report.performance.slowestLoad,
      'Promedio': report.performance.avgLoadTime
    });
    
    console.groupEnd();
    
    return report;
  }

  // Method to compare with baseline
  compareWithBaseline(baseline) {
    const current = this.generateReport();
    
    const comparison = {
      loadTimeImprovement: baseline.performance.avgLoadTime && current.performance.avgLoadTime
        ? `${((parseFloat(baseline.performance.avgLoadTime) - parseFloat(current.performance.avgLoadTime)) / parseFloat(baseline.performance.avgLoadTime) * 100).toFixed(1)}%`
        : 'N/A',
      optimizationIncrease: baseline.optimization.optimizationRate && current.optimization.optimizationRate
        ? `${(parseFloat(current.optimization.optimizationRate) - parseFloat(baseline.optimization.optimizationRate)).toFixed(1)}%`
        : 'N/A'
    };
    
    console.group('📊 COMPARACIÓN CON BASELINE');
    console.log('⚡ Mejoras:');
    console.table(comparison);
    console.groupEnd();
    
    return comparison;
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  window.imageAnalyzer = new ImagePerformanceAnalyzer();
  
  // Auto-report after 5 seconds
  setTimeout(() => {
    console.log('🚀 Generando reporte automático de rendimiento...');
    window.imageAnalyzer.displayReport();
  }, 5000);
  
  // Add manual trigger
  console.log('💡 Usa window.imageAnalyzer.displayReport() para ver estadísticas en cualquier momento');
}

export default ImagePerformanceAnalyzer;
