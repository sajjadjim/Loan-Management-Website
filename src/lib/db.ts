import { Member, Transaction, LedgerRowCalculation, FinancialSummary } from './types';
import { 
  supabasePrimary, 
  supabaseSecondary, 
  isPrimaryConfigured, 
  isSecondaryConfigured 
} from './supabaseClient';

const LOCAL_STORAGE_MEMBERS_KEY = 'loan_mgmt_members_v4';
const LOCAL_STORAGE_TRANSACTIONS_KEY = 'loan_mgmt_transactions_v4';

// Helper to convert English digits to Bengali numerals
export function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)]);
}

// Helper to parse both English and Bengali number strings into integers
export function parseNumeral(str: string): number {
  if (!str) return 0;
  const bengaliToEnglish: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  const normalized = str.replace(/[০-৯]/g, (b) => bengaliToEnglish[b] || b);
  const num = parseInt(normalized.replace(/\D/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

// Initial realistic Bengali seed data based on handwritten image
const SEED_MEMBERS: Member[] = [
  {
    id: 'm-125',
    member_no: '১২৫',
    name: 'আনোয়ার হোসেন',
    father_mother_spouse: 'আব্দুল হাশেম / আমেনা বেগম',
    loan_amount: 100000,
    savings_initial: 10000,
    loan_purpose: 'ব্যবসা সম্প্রসারণ',
    admission_date: '2024-06-20',
    total_installments: 44,
    mobile: '01712345678',
    address: 'গ্রাম: রামপুর, ডাকঘর: বাজার রোড, থানা: সদর',
    book_no: '১',
    guarantor_name: 'মোঃ রফিকুল ইসলাম',
    guarantor_father_mother_spouse: 'মোঃ শফিকুল ইসলাম',
    guarantor_mobile: '01799887766',
    guarantor_address: 'রামপুর পশ্চিম পাড়া',
    guarantor_nid: '19852694152000999',
    nid_number: '19922694152000125',
    photo_url: '',
    nid_image_url: '',
    status: 'active',
    created_at: new Date('2024-06-20').toISOString()
  },
  {
    id: 'm-102',
    member_no: '১০২',
    name: 'মোছাঃ রহিমা বেগম',
    father_mother_spouse: 'নুরুল ইসলাম / মোঃ জহিরুল ইসলাম',
    loan_amount: 50000,
    savings_initial: 5000,
    loan_purpose: 'গবাদিপশু পালন',
    admission_date: '2024-05-15',
    total_installments: 44,
    mobile: '01898765432',
    address: 'উত্তর পাড়া, ডাকঘর: রামপুর',
    book_no: '১',
    guarantor_name: 'আব্দুল কুদ্দুস',
    guarantor_father_mother_spouse: 'আলী আকবর',
    guarantor_mobile: '01811223344',
    guarantor_address: 'উত্তর পাড়া',
    guarantor_nid: '19802694152000888',
    nid_number: '19882694152000102',
    photo_url: '',
    nid_image_url: '',
    status: 'active',
    created_at: new Date('2024-05-15').toISOString()
  },
  {
    id: 'm-140',
    member_no: '১৪০',
    name: 'মোঃ কবির মিয়া',
    father_mother_spouse: 'আকরাম মিয়া',
    loan_amount: 75000,
    savings_initial: 8000,
    loan_purpose: 'দোকান মেরামত',
    admission_date: '2024-07-01',
    total_installments: 44,
    mobile: '01911223344',
    address: 'বাজার রোড, দোকান নং ৪',
    book_no: '২',
    guarantor_name: 'মোঃ শাহ আলম',
    guarantor_father_mother_spouse: 'জাহাঙ্গীর আলম',
    guarantor_mobile: '01955667788',
    guarantor_address: 'দক্ষিণ পাড়া',
    guarantor_nid: '19822694152000777',
    nid_number: '19952694152000140',
    photo_url: '',
    nid_image_url: '',
    status: 'active',
    created_at: new Date('2024-07-01').toISOString()
  }
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 't-1',
    member_id: 'm-125',
    date: '2024-06-10',
    savings_deposit: 10000,
    savings_withdraw: 0,
    installment_no: null,
    loan_repayment: 0,
    collector_signature: 'জসিম',
    notes: 'প্রাথমিক সঞ্চয় জমা',
    created_at: '2024-06-10T10:00:00Z'
  },
  {
    id: 't-2',
    member_id: 'm-125',
    date: '2024-06-10',
    savings_deposit: 10000,
    savings_withdraw: 0,
    installment_no: null,
    loan_repayment: 10000,
    collector_signature: 'জসিম',
    notes: 'ঋণ বিতরণের সময় সঞ্চয় ও প্রাথমিক জমা',
    created_at: '2024-06-10T11:00:00Z'
  },
  {
    id: 't-3',
    member_id: 'm-125',
    date: '2024-07-10',
    savings_deposit: 500,
    savings_withdraw: 0,
    installment_no: 1,
    loan_repayment: 3000,
    collector_signature: 'জসিম',
    notes: 'প্রথম কিস্তি',
    created_at: '2024-07-10T10:00:00Z'
  },
  {
    id: 't-4',
    member_id: 'm-125',
    date: '2024-08-10',
    savings_deposit: 500,
    savings_withdraw: 2000,
    installment_no: 2,
    loan_repayment: 3000,
    collector_signature: 'জসিম',
    notes: 'দ্বিতীয় কিস্তি ও সঞ্চয় উত্তোলন',
    created_at: '2024-08-10T10:00:00Z'
  }
];

function initializeLocalStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(SEED_MEMBERS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(SEED_TRANSACTIONS));
  }
}

// ----------------------------------------------------------------------
// LOCAL BACKUP WRITE HELPERS
// ----------------------------------------------------------------------

function saveMemberToLocalBackup(member: Member) {
  if (typeof window === 'undefined') return;
  initializeLocalStorage();
  const raw = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
  const members: Member[] = raw ? JSON.parse(raw) : [];
  const idx = members.findIndex(m => m.id === member.id);
  if (idx >= 0) {
    members[idx] = member;
  } else {
    members.unshift(member);
  }
  localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
}

function removeMemberFromLocalBackup(id: string) {
  if (typeof window === 'undefined') return;
  initializeLocalStorage();
  const raw = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
  const members: Member[] = raw ? JSON.parse(raw) : [];
  const filtered = members.filter(m => m.id !== id);
  localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(filtered));
}

function saveTransactionToLocalBackup(tx: Transaction) {
  if (typeof window === 'undefined') return;
  initializeLocalStorage();
  const raw = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
  const all: Transaction[] = raw ? JSON.parse(raw) : [];
  const idx = all.findIndex(t => t.id === tx.id);
  if (idx >= 0) {
    all[idx] = tx;
  } else {
    all.push(tx);
  }
  localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(all));
}

function removeTransactionFromLocalBackup(id: string) {
  if (typeof window === 'undefined') return;
  initializeLocalStorage();
  const raw = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
  const all: Transaction[] = raw ? JSON.parse(raw) : [];
  const filtered = all.filter(t => t.id !== id);
  localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(filtered));
}

// ----------------------------------------------------------------------
// MULTI-CLOUD DUAL SUPABASE API FUNCTIONS
// ----------------------------------------------------------------------

export async function getNextAutoMemberAndBookNo(): Promise<{
  nextMemberNo: string;
  nextBookNo: string;
}> {
  const members = await getMembers();
  let maxMemberNo = 125;

  for (const m of members) {
    const parsed = parseNumeral(m.member_no);
    if (parsed > maxMemberNo) {
      maxMemberNo = parsed;
    }
  }

  const nextVal = maxMemberNo + 1;
  const nextMemberNo = toBengaliNumber(nextVal);

  const memberCount = members.length;
  const bookNum = Math.max(1, Math.floor(memberCount / 20) + 1);
  const nextBookNo = toBengaliNumber(bookNum);

  return {
    nextMemberNo,
    nextBookNo
  };
}

export async function getMembers(): Promise<Member[]> {
  const mergedMap = new Map<string, Member>();

  // 1. Try Primary Supabase Cloud DB
  if (isPrimaryConfigured && supabasePrimary) {
    try {
      const { data, error } = await supabasePrimary
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        data.forEach((m: Member) => {
          const key = m.id || m.member_no;
          if (key) mergedMap.set(key, m);
        });
      }
    } catch (e) {
      console.warn('Primary Supabase fetch failed', e);
    }
  }

  // 2. Try Secondary Supabase Cloud DB
  if (isSecondaryConfigured && supabaseSecondary) {
    try {
      const { data, error } = await supabaseSecondary
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        data.forEach((m: Member) => {
          const key = m.id || m.member_no;
          if (key && !mergedMap.has(key)) {
            mergedMap.set(key, m);
          }
        });
      }
    } catch (e) {
      console.warn('Secondary Supabase fetch failed', e);
    }
  }

  // 3. Try Local Storage Backup / Seed Data
  initializeLocalStorage();
  const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY) : null;
  const localMembers: Member[] = raw ? JSON.parse(raw) : SEED_MEMBERS;

  localMembers.forEach((m: Member) => {
    const key = m.id || m.member_no;
    if (key && !mergedMap.has(key)) {
      mergedMap.set(key, m);
    }
  });

  const mergedList = Array.from(mergedMap.values());
  const finalMembers = mergedList.length > 0 ? mergedList : SEED_MEMBERS;

  // Keep final list ordered by created_at descending
  finalMembers.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  if (typeof window !== 'undefined' && finalMembers.length > 0) {
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(finalMembers));
  }

  return finalMembers;
}

export async function getMemberById(id: string): Promise<Member | null> {
  const members = await getMembers();
  return members.find(m => m.id === id || m.member_no === id) || null;
}

/**
 * CREATE MEMBER: Parallel Write to Primary Supabase DB + Secondary Supabase DB + Local Storage Backup!
 */
export async function createMember(member: Omit<Member, 'id' | 'created_at'>): Promise<Member> {
  let finalMemberNo = member.member_no;
  let finalBookNo = member.book_no;

  if (!finalMemberNo || !finalBookNo) {
    const autoGen = await getNextAutoMemberAndBookNo();
    if (!finalMemberNo) finalMemberNo = autoGen.nextMemberNo;
    if (!finalBookNo) finalBookNo = autoGen.nextBookNo;
  }

  let newMember: Member = {
    ...member,
    member_no: finalMemberNo,
    book_no: finalBookNo,
    id: 'm-' + Date.now(),
    created_at: new Date().toISOString()
  };

  const memberPayload = {
    member_no: newMember.member_no,
    name: newMember.name,
    father_mother_spouse: newMember.father_mother_spouse || '',
    loan_amount: Number(newMember.loan_amount),
    savings_initial: Number(newMember.savings_initial),
    loan_purpose: newMember.loan_purpose,
    admission_date: newMember.admission_date,
    total_installments: Number(newMember.total_installments),
    mobile: newMember.mobile,
    address: newMember.address || '',
    book_no: newMember.book_no,
    guarantor_name: newMember.guarantor_name || '',
    guarantor_father_mother_spouse: newMember.guarantor_father_mother_spouse || '',
    guarantor_mobile: newMember.guarantor_mobile || '',
    guarantor_address: newMember.guarantor_address || '',
    guarantor_nid: newMember.guarantor_nid || '',
    nid_number: newMember.nid_number || '',
    photo_url: newMember.photo_url || '',
    nid_front_url: newMember.nid_front_url || newMember.nid_image_url || '',
    nid_back_url: newMember.nid_back_url || '',
    nid_image_url: newMember.nid_image_url || newMember.nid_front_url || '',
    guarantor_nid_front_url: newMember.guarantor_nid_front_url || '',
    guarantor_nid_back_url: newMember.guarantor_nid_back_url || '',
    guarantor_photo_url: newMember.guarantor_photo_url || '',
    drive_folder_url: newMember.drive_folder_url || '',
    status: 'active'
  };

  // 1. Write to Primary Supabase Cloud DB
  if (isPrimaryConfigured && supabasePrimary) {
    try {
      const { data, error } = await supabasePrimary
        .from('members')
        .insert([memberPayload])
        .select()
        .single();
      if (!error && data) {
        newMember = data as Member;
      } else if (error) {
        console.warn('Primary Supabase insert warning, trying basic payload fallback:', error.message);
        // Fallback: If new columns fail due to unmigrated DB table schema, retry with basic payload
        const basicPayload = { ...memberPayload };
        delete (basicPayload as Record<string, unknown>).father_mother_spouse;
        delete (basicPayload as Record<string, unknown>).guarantor_father_mother_spouse;

        const { data: fbData } = await supabasePrimary
          .from('members')
          .insert([basicPayload])
          .select()
          .single();
        if (fbData) {
          newMember = { ...newMember, ...fbData };
        }
      }
    } catch (e) {
      console.warn('Primary Supabase write failed', e);
    }
  }

  // 2. Parallel Write to Secondary Supabase Cloud DB
  if (isSecondaryConfigured && supabaseSecondary) {
    try {
      const { error } = await supabaseSecondary.from('members').insert([memberPayload]);
      if (error) {
        const basicPayload = { ...memberPayload };
        delete (basicPayload as Record<string, unknown>).father_mother_spouse;
        delete (basicPayload as Record<string, unknown>).guarantor_father_mother_spouse;
        await supabaseSecondary.from('members').insert([basicPayload]);
      }
    } catch (e) {
      console.warn('Secondary Supabase write failed', e);
    }
  }

  // 3. Parallel Write to Local Storage Backup
  saveMemberToLocalBackup(newMember);

  return newMember;
}

/**
 * UPDATE MEMBER: Parallel Update to Primary Supabase DB + Secondary Supabase DB + Local Storage Backup!
 */
export async function updateMember(id: string, updates: Partial<Member>): Promise<Member | null> {
  let updatedMember: Member | null = null;

  // 1. Update Primary Supabase DB
  if (isPrimaryConfigured && supabasePrimary) {
    try {
      const { data, error } = await supabasePrimary
        .from('members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        updatedMember = data as Member;
      }
    } catch (e) {
      console.warn('Primary Supabase update failed', e);
    }
  }

  // 2. Update Secondary Supabase DB
  if (isSecondaryConfigured && supabaseSecondary) {
    try {
      await supabaseSecondary.from('members').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Secondary Supabase update failed', e);
    }
  }

  // 3. Update Local Storage Backup
  initializeLocalStorage();
  const members = await getMembers();
  const index = members.findIndex(m => m.id === id);
  if (index >= 0) {
    updatedMember = { ...members[index], ...updates, updated_at: new Date().toISOString() };
    saveMemberToLocalBackup(updatedMember);
  }

  return updatedMember;
}

/**
 * DELETE MEMBER: Parallel Delete from Primary Supabase DB + Secondary Supabase DB + Local Storage Backup!
 */
export async function deleteMember(id: string): Promise<boolean> {
  if (isPrimaryConfigured && supabasePrimary) {
    try {
      await supabasePrimary.from('members').delete().eq('id', id);
    } catch (e) {
      console.warn('Primary Supabase delete failed', e);
    }
  }

  if (isSecondaryConfigured && supabaseSecondary) {
    try {
      await supabaseSecondary.from('members').delete().eq('id', id);
    } catch (e) {
      console.warn('Secondary Supabase delete failed', e);
    }
  }

  removeMemberFromLocalBackup(id);
  return true;
}

// ----------------------------------------------------------------------
// TRANSACTIONS (PARALLEL DUAL WRITE TO BOTH SUPABASE CLOUDS + LOCAL BACKUP)
// ----------------------------------------------------------------------

export async function getTransactionsForMember(memberId: string): Promise<Transaction[]> {
  const mergedTxMap = new Map<string, Transaction>();

  // 1. Try Primary Supabase DB
  if (isPrimaryConfigured && supabasePrimary) {
    try {
      const { data, error } = await supabasePrimary
        .from('transactions')
        .select('*')
        .eq('member_id', memberId)
        .order('date', { ascending: true })
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        data.forEach((t: Transaction) => {
          if (t.id) mergedTxMap.set(t.id, t);
        });
      }
    } catch (e) {
      console.warn('Primary Supabase transactions fetch failed', e);
    }
  }

  // 2. Try Secondary Supabase DB
  if (isSecondaryConfigured && supabaseSecondary) {
    try {
      const { data, error } = await supabaseSecondary
        .from('transactions')
        .select('*')
        .eq('member_id', memberId)
        .order('date', { ascending: true })
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        data.forEach((t: Transaction) => {
          if (t.id && !mergedTxMap.has(t.id)) {
            mergedTxMap.set(t.id, t);
          }
        });
      }
    } catch (e) {
      console.warn('Secondary Supabase transactions fetch failed', e);
    }
  }

  // 3. Try Local Storage Backup
  initializeLocalStorage();
  const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY) : null;
  const all: Transaction[] = raw ? JSON.parse(raw) : SEED_TRANSACTIONS;
  all.filter(t => t.member_id === memberId).forEach((t: Transaction) => {
    if (t.id && !mergedTxMap.has(t.id)) {
      mergedTxMap.set(t.id, t);
    }
  });

  const mergedList = Array.from(mergedTxMap.values());
  return mergedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getCalculatedLedger(member: Member): Promise<{
  rows: LedgerRowCalculation[];
  summary: FinancialSummary;
}> {
  const transactions = await getTransactionsForMember(member.id);

  let currentSavings = Number(member.savings_initial || 0);
  let currentLoanBalance = Number(member.loan_amount || 0);
  let totalLoanPaid = 0;

  const rows: LedgerRowCalculation[] = transactions.map((t) => {
    const deposit = Number(t.savings_deposit || 0);
    const withdraw = Number(t.savings_withdraw || 0);
    const repayment = Number(t.loan_repayment || 0);

    currentSavings = currentSavings + deposit - withdraw;
    currentLoanBalance = Math.max(0, currentLoanBalance - repayment);
    totalLoanPaid += repayment;

    return {
      ...t,
      running_total_savings: currentSavings,
      running_loan_balance: currentLoanBalance
    };
  });

  const summary: FinancialSummary = {
    total_loan: Number(member.loan_amount || 0),
    total_repaid: totalLoanPaid,
    remaining_loan: currentLoanBalance,
    total_savings: currentSavings,
    repayment_progress: Number(member.loan_amount) > 0
      ? Math.min(100, Math.round((totalLoanPaid / Number(member.loan_amount)) * 100))
      : 100
  };

  return { rows, summary };
}

/**
 * ADD TRANSACTION: Parallel Write to Primary Supabase + Secondary Supabase + Local Storage Backup!
 */
export async function addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  let newTx: Transaction = {
    ...transaction,
    id: 't-' + Date.now(),
    created_at: new Date().toISOString()
  };

  const txPayload = {
    member_id: transaction.member_id,
    date: transaction.date,
    savings_deposit: Number(transaction.savings_deposit || 0),
    savings_withdraw: Number(transaction.savings_withdraw || 0),
    installment_no: transaction.installment_no ? Number(transaction.installment_no) : null,
    loan_repayment: Number(transaction.loan_repayment || 0),
    collector_signature: transaction.collector_signature || '',
    notes: transaction.notes || ''
  };

  // 1. Write to Primary Supabase DB
  if (isPrimaryConfigured && supabasePrimary) {
    try {
      const { data, error } = await supabasePrimary
        .from('transactions')
        .insert([txPayload])
        .select()
        .single();
      if (!error && data) {
        newTx = data as Transaction;
      }
    } catch (e) {
      console.warn('Primary Supabase transaction insert failed', e);
    }
  }

  // 2. Parallel Write to Secondary Supabase DB
  if (isSecondaryConfigured && supabaseSecondary) {
    try {
      await supabaseSecondary.from('transactions').insert([txPayload]);
    } catch (e) {
      console.warn('Secondary Supabase transaction insert failed', e);
    }
  }

  // 3. Parallel Write to Local Storage Backup
  saveTransactionToLocalBackup(newTx);

  return newTx;
}

/**
 * DELETE TRANSACTION: Parallel Delete from Primary Supabase + Secondary Supabase + Local Storage Backup!
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  if (isPrimaryConfigured && supabasePrimary) {
    try {
      await supabasePrimary.from('transactions').delete().eq('id', id);
    } catch (e) {
      console.warn('Primary Supabase transaction delete failed', e);
    }
  }

  if (isSecondaryConfigured && supabaseSecondary) {
    try {
      await supabaseSecondary.from('transactions').delete().eq('id', id);
    } catch (e) {
      console.warn('Secondary Supabase transaction delete failed', e);
    }
  }

  removeTransactionFromLocalBackup(id);
  return true;
}

export async function getDashboardStats(): Promise<{
  totalGranted: number;
  totalCollected: number;
  totalRemaining: number;
  totalSavings: number;
  activeCount: number;
}> {
  const members = await getMembers();
  let totalGranted = 0;
  let totalCollected = 0;
  let totalRemaining = 0;
  let totalSavings = 0;

  for (const member of members) {
    const { summary } = await getCalculatedLedger(member);
    totalGranted += summary.total_loan;
    totalCollected += summary.total_repaid;
    totalRemaining += summary.remaining_loan;
    totalSavings += summary.total_savings;
  }

  return {
    totalGranted,
    totalCollected,
    totalRemaining,
    totalSavings,
    activeCount: members.length
  };
}

/**
 * EXPORT FULL BACKUP JSON: Download complete database JSON backup file
 */
export async function exportFullBackupJSON() {
  const members = await getMembers();
  let allTransactions: Transaction[] = [];

  for (const m of members) {
    const txs = await getTransactionsForMember(m.id);
    allTransactions = [...allTransactions, ...txs];
  }

  const backupData = {
    app: 'Simple Loan Management System',
    timestamp: new Date().toISOString(),
    primary_db: 'https://ddhmleulfdspdgnbkhda.supabase.co',
    secondary_db: 'https://kpqpugbwkqdpbcgqwxdy.supabase.co',
    members_count: members.length,
    transactions_count: allTransactions.length,
    members,
    transactions: allTransactions
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `loan_management_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
