# Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Generate Security Keys
```bash
cd chef-portfolio-cms
node scripts/generate-keys.js
```
Copy the generated keys for step 4.

### 3. Deploy to Vercel
```bash
# From project root
vercel --prod
```

### 4. Set Environment Variables

#### For CMS (chef-portfolio-cms):
```bash
# Security keys (use generated ones from step 2)
vercel env add APP_KEYS
vercel env add API_TOKEN_SALT
vercel env add ADMIN_JWT_SECRET
vercel env add TRANSFER_TOKEN_SALT
vercel env add JWT_SECRET
vercel env add ENCRYPTION_KEY

# Database (recommended: use Railway/Supabase PostgreSQL)
vercel env add DATABASE_CLIENT postgres
vercel env add DATABASE_URL postgresql://user:pass@host:port/db

# Production settings
vercel env add NODE_ENV production
vercel env add HOST 0.0.0.0
vercel env add PORT 1337
```

#### For Frontend (chef-portfolio-frontend):
```bash
# Update with your CMS deployment URL
vercel env add NEXT_PUBLIC_STRAPI_API_URL https://your-cms.vercel.app/api
vercel env add NEXT_PUBLIC_STRAPI_BASE_URL https://your-cms.vercel.app
```

### 5. Custom Domain Setup
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables with new domain

## 📊 Database Migration

### Option A: Railway (Recommended)
1. Create account at railway.app
2. Create PostgreSQL database
3. Copy connection string to `DATABASE_URL`

### Option B: Supabase
1. Create account at supabase.com
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy URI to `DATABASE_URL`

## 🔧 Post-Deployment

1. **Create Admin User**: Visit `https://your-cms.vercel.app/admin`
2. **Upload Content**: Add chef profile, dishes, etc.
3. **Test Frontend**: Verify data loads at `https://your-frontend.vercel.app`
4. **Configure CORS**: Update CORS origin in CMS settings if needed

## 🔍 Troubleshooting

### Common Issues:
- **Database Connection**: Ensure `DATABASE_URL` is correct
- **CORS Errors**: Check `FRONTEND_URL` in CMS environment
- **Image Upload**: Consider Cloudinary for file storage
- **Build Errors**: Check Node.js version compatibility

### Environment Variables Checklist:
- [ ] All security keys generated and set
- [ ] Database URL configured
- [ ] Frontend/Backend URLs cross-referenced
- [ ] NODE_ENV set to production

## 🌐 Architecture
```
Frontend (Vercel) ←→ CMS (Vercel) ←→ Database (Railway/Supabase)
```

---

**Next Steps**: After deployment, consider upgrading to paid tiers for:
- Custom domain SSL
- Increased bandwidth
- Database persistence
- Advanced analytics