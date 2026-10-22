'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, Printer, AlertTriangle } from 'lucide-react';
import styles from './member.module.css';
import { Navbar } from '@/components/Navbar';
import { PassbookHeader } from '@/components/PassbookHeader';
import { FinancialSummaryCard } from '@/components/FinancialSummaryCard';
import { LedgerTable } from '@/components/LedgerTable';
import { TransactionModal } from '@/components/TransactionModal';
import { MemberFormModal } from '@/components/MemberFormModal';
import { DeleteMemberModal } from '@/components/DeleteMemberModal';
import { SuccessModal } from '@/components/SuccessModal';
import { DeleteSuccessModal } from '@/components/DeleteSuccessModal';
import { Member, LedgerRowCalculation, FinancialSummary, Transaction } from '@/lib/types';
import { 
  getMemberById, 
  getCalculatedLedger, 
  addTransaction, 
  deleteTransaction, 
  updateMember, 
  deleteMember 
} from '@/lib/db';
import { Language, translations } from '@/lib/i18n';

interface MemberPageProps {
  params: Promise<{ id: string }>;
}

export default function MemberPassbookPage({ params }: MemberPageProps) {
  const resolvedParams = use(params);
  const memberId = resolvedParams.id;
  const router = useRouter();

  const [lang, setLang] = useState<Language>('bn');
  const t = translations[lang];

  const [member, setMember] = useState<Member | null>(null);
  const [ledgerRows, setLedgerRows] = useState<LedgerRowCalculation[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    total_loan: 0,
    total_repaid: 0,
    remaining_loan: 0,
    total_savings: 0,
    repayment_progress: 0
  });

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updatedSuccessMember, setUpdatedSuccessMember] = useState<Member | null>(null);
  const [deletedSuccessInfo, setDeletedSuccessInfo] = useState<{ name: string; memberNo?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMemberData = async () => {
    setLoading(true);
    const m = await getMemberById(memberId);
    if (m) {
      setMember(m);
      const { rows, summary } = await getCalculatedLedger(m);
      setLedgerRows(rows);
      setFinancialSummary(summary);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMemberData();
  }, [memberId]);

  const handleAddTx = async (txData: Omit<Transaction, 'id' | 'created_at'>) => {
    await addTransaction(txData);
    await loadMemberData();
  };

  const handleDeleteTx = async (txId: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই লেনদেনটি মুছে ফেলতে চান?')) {
      await deleteTransaction(txId);
      await loadMemberData();
    }
  };

  const handleUpdateMember = async (updatedData: Omit<Member, 'id' | 'created_at'>) => {
    if (!member) return;
    const updated = await updateMember(member.id, updatedData);
    await loadMemberData();
    if (updated) {
      setUpdatedSuccessMember(updated);
    }
  };

  const handleConfirmDeleteMember = async (id: string) => {
    const name = member?.name || '';
    const memberNo = member?.member_no || '';
    await deleteMember(id);
    setIsDeleteModalOpen(false);
    setDeletedSuccessInfo({ name, memberNo });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <>
        <Navbar lang={lang} onToggleLang={() => setLang((l) => (l === 'bn' ? 'en' : 'bn'))} />
        <main className="main-content">
          <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
            <p>লোড হচ্ছে...</p>
          </div>
        </main>
      </>
    );
  }

  if (!member) {
    return (
      <>
        <Navbar lang={lang} onToggleLang={() => setLang((l) => (l === 'bn' ? 'en' : 'bn'))} />
        <main className="main-content">
          <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
            <AlertTriangle size={48} className="textRose" style={{ margin: '0 auto 1rem' }} />
            <h2>সদস্য পাওয়া যায়নি!</h2>
            <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <ArrowLeft size={16} />
              <span>{t.backToDashboard}</span>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar lang={lang} onToggleLang={() => setLang((l) => (l === 'bn' ? 'en' : 'bn'))} />

      <main className="main-content">
        <div className="container">
          {/* Navigation & Action Top Bar */}
          <div className={`${styles.topBar} no-print`}>
            <Link href="/" className={styles.backBtn}>
              <ArrowLeft size={18} />
              <span>{t.backToDashboard}</span>
            </Link>

            <div className={styles.actionBtns}>
              <button
                onClick={() => setIsTxModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                <span>{t.addTransaction}</span>
              </button>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                <Edit size={16} />
                <span>{t.editMember}</span>
              </button>

              <button
                onClick={handlePrint}
                className="btn btn-secondary btn-sm"
              >
                <Printer size={16} />
                <span>{t.printPassbook}</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="btn btn-danger btn-sm"
                title={t.deleteMember}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Member Passbook Top Header (Matching Image Header) */}
          <PassbookHeader
            member={member}
            lang={lang}
            onEdit={() => setIsEditModalOpen(true)}
            onPrint={handlePrint}
          />

          {/* Financial Calculation Banner (Real-time Money Balances) */}
          <FinancialSummaryCard summary={financialSummary} lang={lang} />

          {/* 15-Row Paginated Ledger Table (Matching Image Columns) */}
          <LedgerTable
            rows={ledgerRows}
            lang={lang}
            onAddTransactionClick={() => setIsTxModalOpen(true)}
            onDeleteTransaction={handleDeleteTx}
          />
        </div>
      </main>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        memberId={member.id}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleAddTx}
        lang={lang}
      />

      {/* Edit Member Modal */}
      <MemberFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateMember}
        initialData={member}
        lang={lang}
      />

      {/* 2-Step Verification Delete Member Modal */}
      <DeleteMemberModal
        isOpen={isDeleteModalOpen}
        member={member}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDeleteMember}
        lang={lang}
      />

      {/* Member Update Success Confirmation Modal */}
      <SuccessModal
        isOpen={updatedSuccessMember !== null}
        member={updatedSuccessMember}
        onClose={() => setUpdatedSuccessMember(null)}
        lang={lang}
        mode="update"
      />

      {/* Member Delete Success Confirmation Modal */}
      <DeleteSuccessModal
        isOpen={deletedSuccessInfo !== null}
        memberName={deletedSuccessInfo?.name || ''}
        memberNo={deletedSuccessInfo?.memberNo}
        onClose={() => {
          setDeletedSuccessInfo(null);
          router.push('/');
        }}
        lang={lang}
      />
    </>
  );
}
