import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().optional(),
  password: z.string().min(4).optional(),
  pin: z.string().length(4).optional(),
}).refine(data => data.password || data.pin, {
  message: "Se requiere contraseña o PIN de 4 dígitos",
});

export const invoiceSignSchema = z.object({
  issuerNif: z.string().min(8).max(12),
  issuerName: z.string().min(2),
  invoiceNumber: z.string().min(1),
  issueTimestamp: z.string(),
  documentType: z.enum(['TICKET_SIMPLIFICADO', 'FACTURA_COMPLETA']),
  subtotal: z.number().nonnegative(),
  vatAmount: z.number().nonnegative(),
  total: z.number().positive(),
  previousHash: z.string(),
});

export const ticketBaiSignSchema = z.object({
  issuerNif: z.string().min(8).max(12),
  issuerName: z.string().min(2),
  invoiceNumber: z.string().min(1),
  issueTimestamp: z.string(),
  subtotal: z.number().nonnegative(),
  vatAmount: z.number().nonnegative(),
  total: z.number().positive(),
  province: z.enum(['GIPUZKOA', 'BIZKAIA', 'ALAVA']),
});

export const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
  course: z.enum(['PRIMERO', 'SEGUNDO', 'POSTRE', 'BEBIDA']).default('PRIMERO'),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  tableId: z.string().optional(),
  tableName: z.string().optional(),
  serverId: z.string().optional(),
  serverName: z.string(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerNif: z.string().optional(),
  paymentMethod: z.enum(['EFECTIVO', 'TARJETA', 'BIZUM', 'TRANSFERENCIA', 'TICKET_RESTAURANTE']).optional(),
  items: z.array(orderItemSchema),
});

export const cashMovementSchema = z.object({
  registerId: z.string().min(1),
  type: z.enum(['IN', 'OUT']),
  amount: z.number().positive(),
  reason: z.string().min(1),
});
