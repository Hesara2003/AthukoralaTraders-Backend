// Comprehensive API Endpoint Checker
// This script checks all API files to ensure they're using the correct backend URL

import fs from 'fs';
import path from 'path';

const CORRECT_BACKEND_URL = 'https://athukorala-traders-backend.onrender.com';
const INCORRECT_PATTERNS = [
  'http://localhost:8080',
  'localhost:8080',
  'VITE_API_BASE_URL', // Should be VITE_API_BASE
];

const API_FILES_TO_CHECK = [
  'src/utils/auditLogApi.js',
  'src/utils/adminProductApi.js',
  'src/utils/productApi.js',
  'src/utils/quickSaleApi.js',
  'src/utils/promotionApi.js',
  'src/utils/poApi.js',
  'src/utils/paymentTransactionsApi.js',
  'src/utils/ordersApi.js',
  'src/utils/orderApi.js',
  'src/utils/invoiceApi.js',
  'src/utils/fulfillmentApi.js',
  'src/utils/customerProductApi.js',
  'src/utils/shiftManagementApi.js',
  'src/utils/reportsApi.js',
  'src/utils/referenceApi.js',
  'src/utils/supplierCatalogApi.js',
  'src/utils/supplierReconciliationApi.js',
  'src/services/returnExchangeApi.js',
  'src/config/api.js',
  'src/utils/crossPortalIntegration.js'
];

class ApiEndpointChecker {
  constructor() {
    this.issues = [];
    this.summary = {
      totalFiles: 0,
      correctFiles: 0,
      issuesFound: 0
    };
  }

  checkFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        this.issues.push({
          file: filePath,
          type: 'FILE_NOT_FOUND',
          message: 'File does not exist'
        });
        return false;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      this.summary.totalFiles++;

      let hasIssues = false;

      // Check for hardcoded localhost URLs
      if (content.includes('http://localhost:8080')) {
        this.issues.push({
          file: filePath,
          type: 'HARDCODED_LOCALHOST',
          message: 'Contains hardcoded localhost URL',
          line: this.findLineNumber(content, 'http://localhost:8080')
        });
        hasIssues = true;
      }

      // Check for incorrect environment variable usage
      if (content.includes('VITE_API_BASE_URL') && !content.includes('VITE_API_BASE')) {
        this.issues.push({
          file: filePath,
          type: 'WRONG_ENV_VAR',
          message: 'Using VITE_API_BASE_URL instead of VITE_API_BASE',
          line: this.findLineNumber(content, 'VITE_API_BASE_URL')
        });
        hasIssues = true;
      }

      // Check if file uses correct pattern
      const hasCorrectPattern = content.includes('import.meta.env.VITE_API_BASE') || 
                               content.includes('base') ||
                               content.includes('API_BASE');

      if (!hasCorrectPattern && content.includes('api/')) {
        this.issues.push({
          file: filePath,
          type: 'NO_ENV_USAGE',
          message: 'API calls found but no environment variable usage detected'
        });
        hasIssues = true;
      }

      if (!hasIssues) {
        this.summary.correctFiles++;
      } else {
        this.summary.issuesFound++;
      }

      return !hasIssues;
    } catch (error) {
      this.issues.push({
        file: filePath,
        type: 'READ_ERROR',
        message: `Error reading file: ${error.message}`
      });
      return false;
    }
  }

  findLineNumber(content, searchString) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchString)) {
        return i + 1;
      }
    }
    return null;
  }

  checkAllFiles() {
    console.log('🔍 Checking all API files for correct backend configuration...\n');

    API_FILES_TO_CHECK.forEach(file => {
      const isCorrect = this.checkFile(file);
      const status = isCorrect ? '✅' : '❌';
      console.log(`${status} ${file}`);
    });

    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 API ENDPOINT CONFIGURATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total Files Checked: ${this.summary.totalFiles}`);
    console.log(`   Correctly Configured: ${this.summary.correctFiles}`);
    console.log(`   Files with Issues: ${this.summary.issuesFound}`);
    
    if (this.issues.length > 0) {
      console.log(`\n🚨 Issues Found:`);
      
      this.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.file}`);
        console.log(`   Type: ${issue.type}`);
        console.log(`   Issue: ${issue.message}`);
        if (issue.line) {
          console.log(`   Line: ${issue.line}`);
        }
      });

      console.log(`\n🛠️ Fixes Needed:`);
      
      const hardcodedFiles = this.issues.filter(i => i.type === 'HARDCODED_LOCALHOST');
      if (hardcodedFiles.length > 0) {
        console.log(`\n1. Replace hardcoded URLs in ${hardcodedFiles.length} files:`);
        hardcodedFiles.forEach(issue => {
          console.log(`   - ${issue.file}: Replace 'http://localhost:8080' with environment variable`);
        });
      }

      const envVarFiles = this.issues.filter(i => i.type === 'WRONG_ENV_VAR');
      if (envVarFiles.length > 0) {
        console.log(`\n2. Fix environment variable usage in ${envVarFiles.length} files:`);
        envVarFiles.forEach(issue => {
          console.log(`   - ${issue.file}: Use 'VITE_API_BASE' instead of 'VITE_API_BASE_URL'`);
        });
      }
    } else {
      console.log(`\n🎉 All API files are correctly configured!`);
    }

    console.log(`\n🎯 Expected Production Configuration:`);
    console.log(`   Environment Variable: VITE_API_BASE`);
    console.log(`   Production Value: ${CORRECT_BACKEND_URL}`);
    console.log(`   Pattern: const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';`);
  }

  // Generate fixes for the issues found
  generateFixes() {
    const fixes = [];
    
    this.issues.forEach(issue => {
      if (issue.type === 'HARDCODED_LOCALHOST') {
        fixes.push({
          file: issue.file,
          search: 'const API_BASE_URL = \'http://localhost:8080/api\';',
          replace: 'const API_BASE = import.meta.env.VITE_API_BASE || \'http://localhost:8080\';\nconst API_BASE_URL = `${API_BASE}/api`;'
        });
      }
    });

    return fixes;
  }
}

// Export for use in other scripts
export default ApiEndpointChecker;