import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: required('DATABASE_URL'),
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bootstrapAdmin: {
    name: process.env.BOOTSTRAP_ADMIN_NAME || 'Admin Doctor',
    email: process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@docpulse.local',
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD || 'ChangeMe123!',
    phone: process.env.BOOTSTRAP_ADMIN_PHONE || '',
  },
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

    resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'DocPulse <onboarding@resend.dev>',
  },


    cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};
