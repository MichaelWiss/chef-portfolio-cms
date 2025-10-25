export default ({ env }) => ({
  upload: {
    config: {
      provider: env('UPLOAD_PROVIDER', 'local'),
      providerOptions: {
        // Cloudinary configuration for production
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
        // Optional: Upload presets and transformations
        upload_preset: env('CLOUDINARY_UPLOAD_PRESET', 'chef-portfolio'),
        folder: env('CLOUDINARY_FOLDER', 'chef-portfolio'),
        // Image optimizations
        secure: true,
        resource_type: 'auto',
        quality: 'auto:best',
        fetch_format: 'auto',
      },
      actionOptions: {
        upload: {
          folder: env('CLOUDINARY_FOLDER', 'chef-portfolio'),
          quality: 'auto:best',
          transformation: [
            {
              width: 1920,
              height: 1080,
              crop: 'limit',
              quality: 'auto:best',
              fetch_format: 'auto'
            }
          ]
        },
        delete: {},
      },
    },
  },
  
  // Email provider configuration (falls back to local nodemailer when no SendGrid API key is provided)
  email: {
    config: (() => {
      const apiKey = env('SENDGRID_API_KEY');
      if (apiKey) {
        return {
          provider: 'sendgrid',
          providerOptions: {
            apiKey,
          },
          settings: {
            defaultFrom: env('EMAIL_DEFAULT_FROM', 'noreply@chef-portfolio.com'),
            defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'chef@chef-portfolio.com'),
          },
        };
      }

      // Default to Strapi's nodemailer provider (local transport) until a real provider is configured.
      return {
        provider: env('EMAIL_PROVIDER', 'nodemailer'),
        providerOptions: {},
        settings: {
          defaultFrom: env('EMAIL_DEFAULT_FROM', 'noreply@chef-portfolio.com'),
          defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'chef@chef-portfolio.com'),
        },
      };
    })(),
  },
});
