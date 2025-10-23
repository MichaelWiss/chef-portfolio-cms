const crypto = require('crypto');

// Generate secure random keys for Strapi
function generateKey(length = 32) {
  return crypto.randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
}

function generateAppKeys() {
  return Array.from({ length: 4 }, () => generateKey()).join(',');
}

function generateSecureKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('🔑 Generating secure keys for Strapi production deployment...');
console.log('\n⚠️  IMPORTANT: Store these securely and never commit to version control!');
console.log('\n📋 Copy these to your Vercel environment variables:');
console.log('=====================================');
console.log(`APP_KEYS=${generateAppKeys()}`);
console.log(`API_TOKEN_SALT=${generateKey()}`);
console.log(`ADMIN_JWT_SECRET=${generateSecureKey()}`);
console.log(`TRANSFER_TOKEN_SALT=${generateKey()}`);
console.log(`JWT_SECRET=${generateSecureKey()}`);
console.log(`ENCRYPTION_KEY=${generateKey()}`);
console.log('=====================================');
console.log('\n🔧 Additional environment variables needed:');
console.log('- DATABASE_URL (PostgreSQL connection string)');
console.log('- CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET');
console.log('- MAILERLITE_API_KEY (optional)');
console.log('- SENDGRID_API_KEY (optional)');
console.log('\n🚀 Next steps:');
console.log('1. Add these variables to Vercel: vercel env add <KEY_NAME>');
console.log('2. Set up PostgreSQL database (Railway/Supabase/Neon)');
console.log('3. Configure Cloudinary account');
console.log('4. Deploy: vercel --prod');
console.log('\n✅ Keys generated successfully!');

// Export for programmatic use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateKey,
    generateAppKeys,
    generateSecureKey
  };
}