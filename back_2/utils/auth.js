import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Hash de senha
export const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Erro ao criar hash da senha');
  }
};

// Verificar senha
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Erro ao verificar senha');
  }
};

// Gerar token JWT
export const generateToken = (userData) => {
  try {
    return jwt.sign(
      {
        id: userData.id,
        email: userData.email,
        role: userData.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  } catch (error) {
    throw new Error('Erro ao gerar token');
  }
};

// Verificar token JWT (para uso interno)
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};