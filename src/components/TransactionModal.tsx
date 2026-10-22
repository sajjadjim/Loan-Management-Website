'use client';

import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import styles from './TransactionModal.module.css';
import { Transaction } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface TransactionModalProps {
  isOpen: boolean;
  memberId: string;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  lang: Language;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  memberId,
  onClose,
  onSave,
  lang
}) => {
  const t = translations[lang];

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [savingsDeposit, setSavingsDeposit] = useState('');
  const [savingsWithdraw, setSavingsWithdraw] = useState('');
  const [installmentNo, setInstallmentNo] = useState('');
  const [loanRepayment, setLoanRepayment] = useState('');
  const [collectorSignature, setCollectorSignature] = useState('জসিম');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({
        member_id: memberId,
        date,
        savings_deposit: Number(savingsDeposit || 0),
        savings_withdraw: Number(savingsWithdraw || 0),
        installment_no: installmentNo ? Number(installmentNo) : null,
        loan_repayment: Number(loanRepayment || 0),
        collector_signature: collectorSignature,
        notes
      });
      onClose();
    } catch (err) {
      console.error('Failed adding transaction', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.addTransaction}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.form}>
            {/* Date */}
            <div className={styles.field}>
              <label className={styles.label}>{t.date} *</label>
              <input
                type="date"
                required
                className={styles.input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Savings Deposit & Withdraw */}
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>{t.deposit} (৳)</label>
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  placeholder="e.g. 500"
                  value={savingsDeposit}
                  onChange={(e) => setSavingsDeposit(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t.withdraw} (৳)</label>
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  placeholder="e.g. 1000"
                  value={savingsWithdraw}
                  onChange={(e) => setSavingsWithdraw(e.target.value)}
                />
              </div>
            </div>

            {/* Installment No & Loan Repayment */}
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>{t.installmentNo}</label>
                <input
                  type="number"
                  min="1"
                  className={styles.input}
                  placeholder="e.g. 1"
                  value={installmentNo}
                  onChange={(e) => setInstallmentNo(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t.collection} (৳)</label>
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  placeholder="e.g. 3000"
                  value={loanRepayment}
                  onChange={(e) => setLoanRepayment(e.target.value)}
                />
              </div>
            </div>

            {/* Collector Signature */}
            <div className={styles.field}>
              <label className={styles.label}>{t.collectorName}</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. জসিম / Collector Name"
                value={collectorSignature}
                onChange={(e) => setCollectorSignature(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className={styles.field}>
              <label className={styles.label}>{t.notes}</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. কিস্তি জমা..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              disabled={submitting}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting}
            >
              <PlusCircle size={16} />
              <span>{submitting ? '...' : t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
