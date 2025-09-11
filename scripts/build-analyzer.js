#!/usr/bin/env node

/**
 * 📊 ANALIZADOR DE BUILD DE NEXT.JS
 * Script para analizar y reportar métricas de build
 */

const fs = require('fs');
const path = require('path');

class NextBuildAnalyzer {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.staticDir = path.join(this.buildDir, 'static');
    this.serverDir = path.join(this.buildDir, 'server');
  }

  // Analizar tamaños de archivos
  analyzeFileSizes() {
    const results = {
      chunks: [],
      totalSize: 0,
      totalGzipSize: 0
    };

    try {
      // Leer chunks de JavaScript
      const chunksDir = path.join(this.staticDir, 'chunks');
      if (fs.existsSync(chunksDir)) {
        const chunkFiles = fs.readdirSync(chunksDir).filter(f => f.endsWith('.js'));
        
        chunkFiles.forEach(file => {
          const filePath = path.join(chunksDir, file);
          const stats = fs.statSync(filePath);
          const sizeKB = (stats.size / 1024).toFixed(2);
          
          results.chunks.push({
            name: file,
            size: `${sizeKB} KB`,
            sizeBytes: stats.size,
            type: this.getChunkType(file)
          });
          
          results.totalSize += stats.size;
        });
      }
    } catch (error) {
      console.warn('No se pudo analizar chunks:', error.message);
    }

    return results;
  }

  // Determinar tipo de chunk
  getChunkType(filename) {
    if (filename.includes('vendor')) return 'Vendors';
    if (filename.includes('common')) return 'Common';
    if (filename.includes('main')) return 'Main';
    if (filename.includes('framework')) return 'Framework';
    return 'Page';
  }

  // Analizar páginas estáticas
  analyzePages() {
    const pages = [];
    
    try {
      const pagesDir = path.join(this.serverDir, 'app');
      if (fs.existsSync(pagesDir)) {
        const walkDir = (dir, basePath = '') => {
          const items = fs.readdirSync(dir);
          
          items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
              walkDir(itemPath, path.join(basePath, item));
            } else if (item.endsWith('.js') || item.endsWith('.html')) {
              const sizeKB = (stats.size / 1024).toFixed(2);
              pages.push({
                route: basePath + '/' + item.replace(/\.(js|html)$/, ''),
                size: `${sizeKB} KB`,
                sizeBytes: stats.size,
                type: item.endsWith('.js') ? 'Server' : 'Static'
              });
            }
          });
        };
        
        walkDir(pagesDir);
      }
    } catch (error) {
      console.warn('No se pudo analizar páginas:', error.message);
    }

    return pages;
  }

  // Generar reporte completo
  generateReport() {
    console.log('\n🚀 ANÁLISIS DE BUILD DE NEXT.JS\n');
    console.log('='.repeat(50));

    // Analizar chunks
    const chunkAnalysis = this.analyzeFileSizes();
    
    if (chunkAnalysis.chunks.length > 0) {
      console.log('\n📦 ANÁLISIS DE CHUNKS:');
      console.log('-'.repeat(50));
      
      // Agrupar por tipo
      const chunksByType = chunkAnalysis.chunks.reduce((acc, chunk) => {
        acc[chunk.type] = acc[chunk.type] || [];
        acc[chunk.type].push(chunk);
        return acc;
      }, {});

      Object.entries(chunksByType).forEach(([type, chunks]) => {
        console.log(`\n${type}:`);
        chunks.forEach(chunk => {
          console.log(`  📄 ${chunk.name}: ${chunk.size}`);
        });
        
        const totalSize = chunks.reduce((sum, chunk) => sum + chunk.sizeBytes, 0);
        console.log(`  💾 Total ${type}: ${(totalSize / 1024).toFixed(2)} KB`);
      });

      console.log(`\n📊 RESUMEN DE CHUNKS:`);
      console.log(`  📦 Total chunks: ${chunkAnalysis.chunks.length}`);
      console.log(`  💾 Tamaño total: ${(chunkAnalysis.totalSize / 1024).toFixed(2)} KB`);
    }

    // Analizar páginas
    const pageAnalysis = this.analyzePages();
    
    if (pageAnalysis.length > 0) {
      console.log('\n📄 ANÁLISIS DE PÁGINAS:');
      console.log('-'.repeat(50));
      
      // Top 10 páginas más pesadas
      const heaviestPages = pageAnalysis
        .sort((a, b) => b.sizeBytes - a.sizeBytes)
        .slice(0, 10);

      console.log('\n🏋️ Top 10 páginas más pesadas:');
      heaviestPages.forEach((page, index) => {
        console.log(`  ${index + 1}. ${page.route}: ${page.size}`);
      });

      const totalPageSize = pageAnalysis.reduce((sum, page) => sum + page.sizeBytes, 0);
      console.log(`\n📊 RESUMEN DE PÁGINAS:`);
      console.log(`  📄 Total páginas: ${pageAnalysis.length}`);
      console.log(`  💾 Tamaño total: ${(totalPageSize / 1024).toFixed(2)} KB`);
    }

    // Recomendaciones
    this.generateRecommendations(chunkAnalysis, pageAnalysis);
  }

  // Generar recomendaciones
  generateRecommendations(chunkAnalysis, pageAnalysis) {
    console.log('\n💡 RECOMENDACIONES:');
    console.log('-'.repeat(50));

    const recommendations = [];

    // Analizar tamaño de vendors
    const vendorChunks = chunkAnalysis.chunks.filter(c => c.type === 'Vendors');
    if (vendorChunks.length > 0) {
      const vendorSize = vendorChunks.reduce((sum, chunk) => sum + chunk.sizeBytes, 0);
      if (vendorSize > 200 * 1024) { // > 200KB
        recommendations.push('⚠️  Vendor bundle > 200KB. Considera lazy loading para librerías grandes');
      } else {
        recommendations.push('✅ Tamaño de vendors optimizado');
      }
    }

    // Analizar páginas pesadas
    const heavyPages = pageAnalysis.filter(p => p.sizeBytes > 10 * 1024); // > 10KB
    if (heavyPages.length > 0) {
      recommendations.push(`⚠️  ${heavyPages.length} páginas > 10KB. Considera code splitting`);
    } else {
      recommendations.push('✅ Tamaños de página optimizados');
    }

    // Analizar número de chunks
    if (chunkAnalysis.chunks.length > 20) {
      recommendations.push('⚠️  Muchos chunks generados. Revisa configuración de splitting');
    } else {
      recommendations.push('✅ Número de chunks optimizado');
    }

    recommendations.forEach(rec => console.log(`  ${rec}`));

    console.log('\n🎯 PRÓXIMAS OPTIMIZACIONES:');
    console.log('  1. 📊 Implementar bundle analyzer para análisis visual');
    console.log('  2. 🔄 Configurar lazy loading para rutas menos usadas');
    console.log('  3. 📦 Optimizar imports para reducir bundle size');
    console.log('  4. 🗜️  Implementar compresión Brotli en servidor');
    
    console.log('\n='.repeat(50));
    console.log('✅ Análisis completado\n');
  }
}

// Ejecutar análisis si se llama directamente
if (require.main === module) {
  const analyzer = new NextBuildAnalyzer();
  analyzer.generateReport();
}

module.exports = NextBuildAnalyzer;
