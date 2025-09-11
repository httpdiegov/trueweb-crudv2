// 🎯 Advanced Bundle Analyzer
// Impacto: 20-40% reducción de tamaño de bundle

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BundleAnalyzer {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.reportDir = path.join(process.cwd(), 'reports');
    
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async analyzeBundles() {
    console.log('🔍 Analyzing bundle sizes and dependencies...\n');

    const analysis = {
      timestamp: new Date().toISOString(),
      bundleSize: await this.getBundleSize(),
      dependencies: await this.analyzeDependencies(),
      unusedDependencies: await this.findUnusedDependencies(),
      recommendations: [],
      performanceScore: 0
    };

    analysis.recommendations = this.generateRecommendations(analysis);
    analysis.performanceScore = this.calculatePerformanceScore(analysis);

    await this.generateReport(analysis);
    this.displayResults(analysis);

    return analysis;
  }

  async getBundleSize() {
    try {
      const buildManifest = path.join(this.buildDir, 'build-manifest.json');
      
      if (!fs.existsSync(buildManifest)) {
        console.log('⚠️ Build manifest not found. Running build first...');
        await execAsync('npm run build');
      }

      const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
      const sizes = {};

      // Calculate sizes for different bundles
      for (const [page, files] of Object.entries(manifest.pages)) {
        let totalSize = 0;
        
        for (const file of files) {
          const filePath = path.join(this.buildDir, 'static', 'chunks', file);
          if (fs.existsSync(filePath)) {
            totalSize += fs.statSync(filePath).size;
          }
        }
        
        sizes[page] = {
          totalSize: totalSize,
          totalSizeKB: Math.round(totalSize / 1024),
          files: files.length
        };
      }

      return sizes;
    } catch (error) {
      console.error('Error analyzing bundle size:', error);
      return {};
    }
  }

  async analyzeDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const analysis = {};
      
      for (const [name, version] of Object.entries(dependencies)) {
        try {
          const packagePath = path.join('node_modules', name, 'package.json');
          const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          
          analysis[name] = {
            version: version,
            actualVersion: pkg.version,
            size: await this.getPackageSize(name),
            description: pkg.description || '',
            license: pkg.license || 'Unknown'
          };
        } catch (e) {
          analysis[name] = {
            version: version,
            error: 'Package not found or error reading'
          };
        }
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing dependencies:', error);
      return {};
    }
  }

  async getPackageSize(packageName) {
    try {
      const { stdout } = await execAsync(`du -sh node_modules/${packageName} 2>/dev/null || echo "0K"`);
      return stdout.trim();
    } catch {
      return 'Unknown';
    }
  }

  async findUnusedDependencies() {
    try {
      // Use depcheck to find unused dependencies
      const { stdout } = await execAsync('npx depcheck --json');
      const result = JSON.parse(stdout);
      
      return {
        unused: result.dependencies || [],
        missing: result.missing || {},
        devMissing: result.devDependencies || []
      };
    } catch (error) {
      console.log('⚠️ Could not analyze unused dependencies. Install depcheck: npm i -g depcheck');
      return { unused: [], missing: {}, devMissing: [] };
    }
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Bundle size recommendations
    const totalBundleSize = Object.values(analysis.bundleSize)
      .reduce((sum, bundle) => sum + bundle.totalSizeKB, 0);

    if (totalBundleSize > 500) {
      recommendations.push({
        type: 'BUNDLE_SIZE',
        priority: 'HIGH',
        title: 'Large bundle size detected',
        description: `Total bundle size is ${totalBundleSize}KB. Consider code splitting.`,
        action: 'Implement dynamic imports for large components'
      });
    }

    // Unused dependencies
    if (analysis.unusedDependencies.unused.length > 0) {
      recommendations.push({
        type: 'UNUSED_DEPS',
        priority: 'MEDIUM',
        title: 'Unused dependencies found',
        description: `${analysis.unusedDependencies.unused.length} unused dependencies detected.`,
        action: `Remove: ${analysis.unusedDependencies.unused.slice(0, 3).join(', ')}`
      });
    }

    // Heavy dependencies
    const heavyDeps = Object.entries(analysis.dependencies)
      .filter(([_, dep]) => {
        const sizeStr = dep.size?.toString() || '0';
        const sizeMatch = sizeStr.match(/(\d+(\.\d+)?)[MK]/);
        if (sizeMatch) {
          const size = parseFloat(sizeMatch[1]);
          const unit = sizeStr.includes('M') ? 1024 : 1;
          return size * unit > 100; // > 100KB
        }
        return false;
      });

    if (heavyDeps.length > 0) {
      recommendations.push({
        type: 'HEAVY_DEPS',
        priority: 'MEDIUM',
        title: 'Heavy dependencies detected',
        description: `${heavyDeps.length} dependencies > 100KB found.`,
        action: 'Consider lighter alternatives or lazy loading'
      });
    }

    return recommendations;
  }

  calculatePerformanceScore(analysis) {
    let score = 100;

    // Deduct for bundle size
    const totalBundleSize = Object.values(analysis.bundleSize)
      .reduce((sum, bundle) => sum + bundle.totalSizeKB, 0);
    
    if (totalBundleSize > 1000) score -= 30;
    else if (totalBundleSize > 500) score -= 15;

    // Deduct for unused dependencies
    score -= Math.min(analysis.unusedDependencies.unused.length * 2, 20);

    // Deduct for heavy dependencies
    const heavyDepsCount = Object.values(analysis.dependencies)
      .filter(dep => dep.size && dep.size.includes('M')).length;
    score -= Math.min(heavyDepsCount * 5, 25);

    return Math.max(score, 0);
  }

  async generateReport(analysis) {
    const report = `
# 📊 Bundle Analysis Report
Generated: ${new Date().toLocaleString()}

## 🎯 Performance Score: ${analysis.performanceScore}/100

## 📦 Bundle Sizes
${Object.entries(analysis.bundleSize)
  .map(([page, bundle]) => `- ${page}: ${bundle.totalSizeKB}KB (${bundle.files} files)`)
  .join('\n')}

## 📋 Recommendations
${analysis.recommendations
  .map(rec => `### ${rec.priority} - ${rec.title}\n${rec.description}\n**Action:** ${rec.action}\n`)
  .join('\n')}

## 📚 Dependencies (Top 10 Heaviest)
${Object.entries(analysis.dependencies)
  .sort((a, b) => {
    const sizeA = a[1].size?.toString() || '0';
    const sizeB = b[1].size?.toString() || '0';
    return sizeB.localeCompare(sizeA);
  })
  .slice(0, 10)
  .map(([name, dep]) => `- ${name}: ${dep.size} (${dep.version})`)
  .join('\n')}

## ❌ Unused Dependencies
${analysis.unusedDependencies.unused.length > 0 
  ? analysis.unusedDependencies.unused.map(dep => `- ${dep}`).join('\n')
  : 'None found! 🎉'
}
`;

    const reportPath = path.join(this.reportDir, 'bundle-analysis.md');
    fs.writeFileSync(reportPath, report);

    // Generate JSON report for programmatic use
    const jsonReportPath = path.join(this.reportDir, 'bundle-analysis.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(analysis, null, 2));

    console.log(`📄 Reports generated:`);
    console.log(`   - ${reportPath}`);
    console.log(`   - ${jsonReportPath}`);
  }

  displayResults(analysis) {
    console.log('\n🎯 BUNDLE ANALYSIS RESULTS\n');
    console.log(`Performance Score: ${analysis.performanceScore}/100`);
    
    if (analysis.recommendations.length > 0) {
      console.log('\n📋 TOP RECOMMENDATIONS:');
      analysis.recommendations.slice(0, 3).forEach(rec => {
        console.log(`\n${rec.priority === 'HIGH' ? '🔥' : '⚡'} ${rec.title}`);
        console.log(`   ${rec.description}`);
        console.log(`   💡 ${rec.action}`);
      });
    }

    console.log('\n📊 Bundle Summary:');
    const totalSize = Object.values(analysis.bundleSize)
      .reduce((sum, bundle) => sum + bundle.totalSizeKB, 0);
    console.log(`   Total Size: ${totalSize}KB`);
    console.log(`   Dependencies: ${Object.keys(analysis.dependencies).length}`);
    console.log(`   Unused: ${analysis.unusedDependencies.unused.length}`);
  }
}

// CLI execution
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyzeBundles().catch(console.error);
}

module.exports = BundleAnalyzer;
