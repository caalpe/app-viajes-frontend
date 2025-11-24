import * as bcrypt from 'bcryptjs';

/**
 * Encripta una password usando bcryptjs
 * @param password - Password a encriptar
 * @param rounds - Número de rondas de hash (por defecto 10)
 * @returns Promise con la password encriptada
 */
export async function hashPassword(password: string, rounds: number = 10): Promise<string> {
  return bcrypt.hash(password, rounds);
}

/**
 * Compara una password con su hash encriptado
 * @param password - Password a comparar
 * @param hash - Hash encriptado
 * @returns Promise<boolean> - true si coinciden, false si no
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
