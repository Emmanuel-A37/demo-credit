import dotenv from 'dotenv';

dotenv.config();

export const env = {
    port : process.env.PORT || 3000,
    nodeEnv : process.env.NODE_ENV || 'development',
    jwtSecret : require(process.env.JWT_SECRET || "JWT_SECRET"),
    db: {
    host: require('DB_HOST'),
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: require('DB_USER'),
    password: require('DB_PASSWORD'),
    name: require('DB_NAME'),
  },
}
