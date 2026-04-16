import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const env = {
    port : parseInt(process.env.PORT || '3000', 10),
    nodeEnv : process.env.NODE_ENV || 'development',
    jwtSecret : required('JWT_SECRET'),
    db: {
    host: required('DB_HOST'),
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    name: required('DB_NAME'),
  },
}
