export interface Member {
  id: string;
  member_no: string;         // সদস্য নম্বর (e.g. "125" or "১২৫")
  name: string;              // নাম (e.g. "আনোয়ার হোসেন")
  father_mother_spouse?: string; // পিতার নাম / মাতার নাম / স্ত্রী / স্বামীর নাম
  loan_amount: number;       // ঋণের পরিমাণ (e.g. 100000)
  savings_initial: number;   // সঞ্চয় জমা সহ (e.g. 20000)
  loan_purpose: string;      // ঋণের উদ্দেশ্য (e.g. "ব্যবসা")
  admission_date: string;    // ভর্তির তারিখ (e.g. "2024-06-20")
  total_installments: number;// কিস্তির সংখ্যা (e.g. 44)
  mobile: string;            // সদস্যের মোবাইল
  address: string;           // সদস্যের ঠিকানা (Member Address)
  book_no: string;           // বই নং / পৃষ্ঠা (e.g. "১")
  guarantor_name: string;    // জামিনদারের নাম (Guarantor Name)
  guarantor_father_mother_spouse?: string; // জামিনদারের পিতা / মাতা / স্ত্রী / স্বামীর নাম
  guarantor_mobile: string;  // জামিনদারের মোবাইল (Guarantor Mobile)
  guarantor_address: string; // জামিনদারের ঠিকানা (Guarantor Address)
  guarantor_nid: string;     // জামিনদারের NID নম্বর (Guarantor NID Number)
  nid_number: string;        // সদস্যের NID কার্ড নম্বর (Member NID Number)
  photo_url?: string;        // সদস্যের ছবি (Person Image)
  nid_front_url?: string;    // সদস্যের NID কার্ডের সামনের অংশ (NID Card Front Image)
  nid_back_url?: string;     // সদস্যের NID কার্ডের পেছনের অংশ (NID Card Back Image)
  nid_image_url?: string;    // Legacy fallback NID image
  guarantor_nid_front_url?: string; // জামিনদারের NID কার্ডের সামনের অংশ (Guarantor NID Front)
  guarantor_nid_back_url?: string;  // জামিনদারের NID কার্ডের পেছনের অংশ (Guarantor NID Back)
  guarantor_photo_url?: string;     // জামিনদারের ছবি (Guarantor Photo)
  drive_folder_url?: string;        // Google Drive ফোল্ডার লিঙ্ক (Google Drive Folder URL)
  status?: 'active' | 'closed';
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  member_id: string;
  date: string;              // তারিখ (YYYY-MM-DD or readable date)
  savings_deposit: number;   // জমা
  savings_withdraw: number;  // উত্তোলন
  installment_no?: number | null; // কিস্তি নং
  loan_repayment: number;    // আদায়
  collector_signature: string; // আদায়কারীর স্বাক্ষর / নাম
  notes?: string;            // মন্তব্য
  created_at?: string;
}

export interface LedgerRowCalculation extends Transaction {
  running_total_savings: number; // মোট সঞ্চয়
  running_loan_balance: number;   // স্থিতি (ঋণের বাকি পরিমাণ)
}

export interface FinancialSummary {
  total_loan: number;
  total_repaid: number;
  remaining_loan: number;
  total_savings: number;
  repayment_progress: number;
}
