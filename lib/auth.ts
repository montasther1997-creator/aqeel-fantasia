import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './db';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
const ADMIN_COOKIE = 'fantasia_admin';
const CUSTOMER_COOKIE = 'fantasia_customer';

export type AdminPayload = { id: string; email: string; role: string; name: string };
export type CustomerPayload = { id: string; phone: string; name: string };

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

async function sign(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);
}

async function verify<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as T;
  } catch {
    return null;
  }
}

// --- Admin ---
export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!admin) return null;
  const ok = await verifyPassword(password, admin.password);
  if (!ok) return null;
  const token = await sign({ id: admin.id, email: admin.email, role: admin.role, name: admin.name });
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, path: '/',
  });
  return admin;
}

export async function logoutAdmin() {
  cookies().delete(ADMIN_COOKIE);
}

export async function getAdmin(): Promise<AdminPayload | null> {
  const c = cookies().get(ADMIN_COOKIE);
  if (!c) return null;
  return verify<AdminPayload>(c.value);
}

// --- Customer ---
export async function loginCustomer(phone: string, password: string) {
  const customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer || customer.blocked) return null;
  const ok = await verifyPassword(password, customer.password);
  if (!ok) return null;
  await prisma.customer.update({ where: { id: customer.id }, data: { lastLogin: new Date() } });
  const token = await sign({ id: customer.id, phone: customer.phone, name: customer.name });
  cookies().set(CUSTOMER_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, path: '/',
  });
  return customer;
}

export async function registerCustomer(data: { phone: string; password: string; name: string; email?: string }) {
  const existing = await prisma.customer.findUnique({ where: { phone: data.phone } });
  if (existing) throw new Error('phone-exists');
  if (data.email) {
    const e = await prisma.customer.findUnique({ where: { email: data.email } });
    if (e) throw new Error('email-exists');
  }
  const password = await hashPassword(data.password);
  const customer = await prisma.customer.create({
    data: { phone: data.phone, password, name: data.name, email: data.email || null },
  });
  const token = await sign({ id: customer.id, phone: customer.phone, name: customer.name });
  cookies().set(CUSTOMER_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, path: '/',
  });
  return customer;
}

export async function logoutCustomer() {
  cookies().delete(CUSTOMER_COOKIE);
}

export async function getCustomer(): Promise<CustomerPayload | null> {
  const c = cookies().get(CUSTOMER_COOKIE);
  if (!c) return null;
  return verify<CustomerPayload>(c.value);
}
