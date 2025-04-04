export const isProd = process.env.NODE_ENV === 'production';

// Use local PostgreSQL in development, Supabase in production
export const getDatabaseUrl = (): string => {
  if (process.env.NODE_ENV === 'development') {
    // In development, use LOCAL_DATABASE_URL from .env.local
    const localUrl = process.env.LOCAL_DATABASE_URL;
    if (!localUrl) {
      console.warn('LOCAL_DATABASE_URL not found, falling back to DATABASE_URL');
      return process.env.DATABASE_URL || '';
    }
    return localUrl;
  } else {
    // In production, use DATABASE_URL from .env
    return process.env.DATABASE_URL || '';
  }
};

// Export other environment variables
export const getNextAuthUrl = (): string => {
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : process.env.NEXTAUTH_URL || '';
};

// Initialize database URL when the module is loaded
getDatabaseUrl(); 