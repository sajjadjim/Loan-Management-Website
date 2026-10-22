'use client';

import React from 'react';
import { Wallet, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';
import styles from './FinancialSummaryCard.module.css';
import { FinancialSummary } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface FinancialSummaryCardProps {
  summary: FinancialSummary;
  lang: Language;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  summary,
  lang
}) => {
  const t = translations[lang];

  return (
    <div className={styles.summaryGrid}>
      {/* Total Savings Balance */}
      <div className={styles.summaryCard}>
        <div className={styles.labelRow}>
          <span>{t.totalSavingsBalance}</span>
          <Wallet size={18} className={styles.greenText} />
        </div>
        <div className={`${styles.amount} ${styles.greenText}`}>
          ৳ {summary.total_savings.toLocaleString()}
        </div>
      </div>

      {/* Total Collected / Paid Loan */}
      <div className={styles.summaryCard}>
        <div className={styles.labelRow}>
          <span>{t.totalCollectedLoan}</span>
          <ArrowUpRight size={18} className={styles.blueText} />
        </div>
        <div className={`${styles.amount} ${styles.blueText}`}>
          ৳ {summary.total_repaid.toLocaleString()}
        </div>
      </div>

      {/* Remaining Loan Balance (স্থিতি) */}
      <div className={styles.summaryCard}>
        <div className={styles.labelRow}>
          <span>{t.remainingLoanBalance}</span>
          <DollarSign size={18} className={styles.roseText} />
        </div>
        <div className={`${styles.amount} ${styles.roseText}`}>
          ৳ {summary.remaining_loan.toLocaleString()}
        </div>
      </div>

      {/* Repayment Progress */}
      <div className={styles.summaryCard}>
        <div className={styles.labelRow}>
          <span>{t.repaymentProgress}</span>
          <TrendingUp size={18} className={styles.amberText} />
        </div>
        <div className={`${styles.amount} ${styles.amberText}`}>
          {summary.repayment_progress}%
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${summary.repayment_progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
