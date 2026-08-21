export interface MockCustomer {
  id: string;
  memberCode: string;
  fullName: string;
  fatherHusbandName: string;
  phone: string;
  address: string;
  nidNumber: string;
  joiningDate: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  notes?: string;
  savingsBalance: number;
}

export interface MockLoan {
  id: string;
  customerId: string;
  customerName: string;
  memberCode: string;
  loanCode: string;
  loanAmount: number;
  interestRate: number;
  interestType: "FLAT" | "REDUCING";
  loanPurpose: string;
  startDate: string;
  durationMonths: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  totalInstallments: number;
  installmentAmount: number;
  totalPayable: number;
  totalInterest: number;
  paidAmount: number;
  remainingAmount: number;
  status: "ACTIVE" | "COMPLETED" | "OVERDUE" | "PENDING";
}

export interface MockTransaction {
  id: string;
  transactionCode: string;
  customerId: string;
  customerName: string;
  memberCode: string;
  loanId?: string;
  date: string;
  type: "LOAN_DISBURSEMENT" | "INSTALLMENT_PAYMENT" | "SAVINGS_DEPOSIT" | "SAVINGS_WITHDRAWAL" | "ADJUSTMENT";
  amount: number;
  referenceNo?: string;
  description: string;
  createdBy: string;
}

export const INITIAL_CUSTOMERS: MockCustomer[] = [
  {
    id: "cust-0128",
    memberCode: "MEM-0128",
    fullName: "ইমরান হোসেন (রনি)",
    fatherHusbandName: "নুরুল ইসলাম",
    phone: "01872424926",
    address: "মিরপুর-১০, ঢাকা",
    nidNumber: "1994269123456",
    joiningDate: "2024-05-10",
    status: "ACTIVE",
    notes: "ব্যবসার জন্য ঋণ গ্রহণ করেছেন।",
    savingsBalance: 5000,
  },
  {
    id: "cust-0129",
    memberCode: "MEM-0129",
    fullName: "আব্দুল করিম",
    fatherHusbandName: "মকসুদ আলী",
    phone: "01711223344",
    address: "মোহাম্মদপুর, ঢাকা",
    nidNumber: "1988269654321",
    joiningDate: "2024-01-15",
    status: "ACTIVE",
    savingsBalance: 12500,
  },
  {
    id: "cust-0130",
    memberCode: "MEM-0130",
    fullName: "শাহিন আলম",
    fatherHusbandName: "আক্তার হোসেন",
    phone: "01912345678",
    address: "ধানমন্ডি, ঢাকা",
    nidNumber: "1990269987654",
    joiningDate: "2024-03-01",
    status: "ACTIVE",
    savingsBalance: 8200,
  },
  {
    id: "cust-0131",
    memberCode: "MEM-0131",
    fullName: "মোরশেদ মিয়া",
    fatherHusbandName: "হাবিবুর রহমান",
    phone: "01698765432",
    address: "উত্তরা, ঢাকা",
    nidNumber: "1985269112233",
    joiningDate: "2024-02-20",
    status: "ACTIVE",
    savingsBalance: 3400,
  },
  {
    id: "cust-0132",
    memberCode: "MEM-0132",
    fullName: "কামরুল ইসলাম",
    fatherHusbandName: "জাহাঙ্গীর আলম",
    phone: "01555443322",
    address: "তেজগাঁও, ঢাকা",
    nidNumber: "1992269445566",
    joiningDate: "2024-04-12",
    status: "ACTIVE",
    savingsBalance: 15000,
  },
];

export const INITIAL_LOANS: MockLoan[] = [
  {
    id: "loan-0128",
    customerId: "cust-0128",
    customerName: "ইমরান হোসেন (রনি)",
    memberCode: "MEM-0128",
    loanCode: "LN-2024-0128",
    loanAmount: 100000,
    interestRate: 10,
    interestType: "FLAT",
    loanPurpose: "দোকান বিস্তার",
    startDate: "2024-05-10",
    durationMonths: 5,
    frequency: "MONTHLY",
    totalInstallments: 5,
    installmentAmount: 22000,
    totalPayable: 110000,
    totalInterest: 10000,
    paidAmount: 50000,
    remainingAmount: 60000,
    status: "ACTIVE",
  },
  {
    id: "loan-0129",
    customerId: "cust-0129",
    customerName: "আব্দুল করিম",
    memberCode: "MEM-0129",
    loanCode: "LN-2024-0129",
    loanAmount: 50000,
    interestRate: 10,
    interestType: "FLAT",
    loanPurpose: "কৃষি উন্নয়ন",
    startDate: "2024-01-15",
    durationMonths: 10,
    frequency: "MONTHLY",
    totalInstallments: 10,
    installmentAmount: 5500,
    totalPayable: 55000,
    totalInterest: 5000,
    paidAmount: 55000,
    remainingAmount: 0,
    status: "COMPLETED",
  },
  {
    id: "loan-0130",
    customerId: "cust-0130",
    customerName: "শাহিন আলম",
    memberCode: "MEM-0130",
    loanCode: "LN-2024-0130",
    loanAmount: 80000,
    interestRate: 12,
    interestType: "FLAT",
    loanPurpose: "ব্যক্তিগত প্রয়োজন",
    startDate: "2024-03-01",
    durationMonths: 8,
    frequency: "MONTHLY",
    totalInstallments: 8,
    installmentAmount: 11200,
    totalPayable: 89600,
    totalInterest: 9600,
    paidAmount: 22400,
    remainingAmount: 67200,
    status: "OVERDUE",
  },
];

export const INITIAL_TRANSACTIONS: MockTransaction[] = [
  {
    id: "txn-1001",
    transactionCode: "TXN-2024-1001",
    customerId: "cust-0128",
    customerName: "ইমরান হোসেন (রনি)",
    memberCode: "MEM-0128",
    loanId: "loan-0128",
    date: "2024-05-10",
    type: "LOAN_DISBURSEMENT",
    amount: 100000,
    description: "ঋণ প্রদান - দোকান বিস্তার",
    createdBy: "Admin User",
  },
  {
    id: "txn-1002",
    transactionCode: "TXN-2024-1002",
    customerId: "cust-0128",
    customerName: "ইমরান হোসেন (রনি)",
    memberCode: "MEM-0128",
    loanId: "loan-0128",
    date: "2024-06-10",
    type: "INSTALLMENT_PAYMENT",
    amount: 25000,
    referenceNo: "REC-001",
    description: "কিস্তি আদায় - কিস্তি নং ১",
    createdBy: "Admin User",
  },
  {
    id: "txn-1003",
    transactionCode: "TXN-2024-1003",
    customerId: "cust-0128",
    customerName: "ইমরান হোসেন (রনি)",
    memberCode: "MEM-0128",
    loanId: "loan-0128",
    date: "2024-07-10",
    type: "INSTALLMENT_PAYMENT",
    amount: 25000,
    referenceNo: "REC-002",
    description: "কিস্তি আদায় - কিস্তি নং ২",
    createdBy: "Admin User",
  },
  {
    id: "txn-1004",
    transactionCode: "TXN-2024-1004",
    customerId: "cust-0128",
    customerName: "ইমরান হোসেন (রনি)",
    memberCode: "MEM-0128",
    date: "2024-07-10",
    type: "SAVINGS_DEPOSIT",
    amount: 500,
    description: "সঞ্চয় জমা",
    createdBy: "Admin User",
  },
];
