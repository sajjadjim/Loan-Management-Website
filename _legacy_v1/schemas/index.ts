import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const UserRegisterSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  fullName: z.string().min(2, "Full name is required."),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]).default("STAFF"),
});

export const CustomerSchema = z.object({
  memberCode: z.string().min(1, "Member ID code is required."),
  fullName: z.string().min(2, "Full name is required."),
  fatherHusbandName: z.string().optional(),
  phone: z.string().min(10, "Please enter a valid mobile number."),
  address: z.string().optional(),
  nidNumber: z.string().optional(),
  joiningDate: z.string().or(z.date()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
  notes: z.string().optional(),
});

export const LoanSchema = z.object({
  customerId: z.string().uuid("Invalid customer selected."),
  loanAmount: z.number().positive("Loan amount must be greater than 0."),
  interestRate: z.number().min(0, "Interest rate cannot be negative."),
  interestType: z.enum(["FLAT", "REDUCING"]).default("FLAT"),
  loanPurpose: z.string().optional(),
  startDate: z.string().or(z.date()),
  durationMonths: z.number().int().positive().default(12),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("MONTHLY"),
  totalInstallments: z.number().int().positive("Installments count must be at least 1."),
});

export const CollectionPaymentSchema = z.object({
  customerId: z.string().uuid("Customer is required."),
  loanId: z.string().uuid().optional(),
  installmentId: z.string().uuid().optional(),
  paymentDate: z.string().or(z.date()),
  loanPaymentAmount: z.number().min(0).default(0),
  savingsDepositAmount: z.number().min(0).default(0),
  savingsWithdrawalAmount: z.number().min(0).default(0),
  referenceNo: z.string().optional(),
  note: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;
export type CustomerInput = z.infer<typeof CustomerSchema>;
export type LoanInput = z.infer<typeof LoanSchema>;
export type CollectionPaymentInput = z.infer<typeof CollectionPaymentSchema>;
