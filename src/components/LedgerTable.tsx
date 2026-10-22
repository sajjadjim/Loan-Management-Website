'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, BookOpen } from 'lucide-react';
import styles from './LedgerTable.module.css';
import { LedgerRowCalculation } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface LedgerTableProps {
  rows: LedgerRowCalculation[];
  lang: Language;
  onAddTransactionClick?: () => void;
  onDeleteTransaction?: (id: string) => void;
}

const ROWS_PER_PAGE = 15;

export const LedgerTable: React.FC<LedgerTableProps> = ({
  rows,
  lang,
  onAddTransactionClick,
  onDeleteTransaction
}) => {
  const t = translations[lang];
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  // Slice rows for current 15-row page
  const startIndex = (validPage - 1) * ROWS_PER_PAGE;
  const currentRows = rows.slice(startIndex, startIndex + ROWS_PER_PAGE);

  // Pad remaining rows up to 15 to preserve paper ledger page height
  const emptyRowsCount = Math.max(0, ROWS_PER_PAGE - currentRows.length);

  return (
    <div className={styles.ledgerContainer}>
      {/* Top Header Bar */}
      <div className={`${styles.tableHeaderBar} no-print`}>
        <div className={styles.tableTitle}>
          <BookOpen size={18} className="textGreen" />
          <span>{t.savingsDetails} & {t.loanAccount}</span>
          <span className={styles.pageInfoBadge}>
            {t.page} {validPage} {t.of} {totalPages}
          </span>
        </div>

        {onAddTransactionClick && (
          <button onClick={onAddTransactionClick} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>{t.addTransaction}</span>
          </button>
        )}
      </div>

      {/* Table Wrapper */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {/* Header Row 1 - Groupings matching Bengali passbook image */}
            <tr>
              <th rowSpan={2} style={{ width: '100px' }}>{t.date}</th>
              <th colSpan={3} className={`${styles.groupHeader} ${styles.savingsHeader}`}>
                {t.savingsDetails} (সঞ্চয়ের বিবরণ)
              </th>
              <th rowSpan={2} style={{ width: '75px' }}>{t.installmentNo}</th>
              <th colSpan={2} className={`${styles.groupHeader} ${styles.loanHeader}`}>
                {t.loanAccount} (ঋণের হিসাব)
              </th>
              <th rowSpan={2} style={{ width: '150px' }}>{t.collectorSignature}</th>
              <th rowSpan={2} className="no-print actionCol" style={{ width: '60px' }}>
                {t.actions}
              </th>
            </tr>
            {/* Header Row 2 - Columns */}
            <tr>
              <th style={{ width: '90px' }}>{t.deposit}</th>
              <th style={{ width: '90px' }}>{t.withdraw}</th>
              <th style={{ width: '110px' }}>{t.totalSavings}</th>
              <th style={{ width: '100px' }}>{t.collection}</th>
              <th style={{ width: '110px' }}>{t.balance}</th>
            </tr>
          </thead>
          <tbody>
            {/* Render actual transaction rows */}
            {currentRows.map((row, index) => (
              <tr key={row.id || index}>
                {/* Date */}
                <td>{row.date}</td>

                {/* Savings Deposit (জমা) */}
                <td className={row.savings_deposit > 0 ? styles.textGreen : ''}>
                  {row.savings_deposit > 0 ? `৳ ${row.savings_deposit.toLocaleString()}` : '-'}
                </td>

                {/* Savings Withdraw (উত্তোলন) */}
                <td className={row.savings_withdraw > 0 ? styles.textRose : ''}>
                  {row.savings_withdraw > 0 ? `৳ ${row.savings_withdraw.toLocaleString()}` : '-'}
                </td>

                {/* Total Savings Balance (মোট সঞ্চয়) */}
                <td className={`${styles.textBold} ${styles.textGreen}`}>
                  ৳ {row.running_total_savings.toLocaleString()}
                </td>

                {/* Installment No (কিস্তি নং) */}
                <td>
                  {row.installment_no ? (
                    <span className="badge badge-info">{row.installment_no}</span>
                  ) : '-'}
                </td>

                {/* Loan Repayment / Collection (আদায়) */}
                <td className={row.loan_repayment > 0 ? styles.textBold : ''}>
                  {row.loan_repayment > 0 ? `৳ ${row.loan_repayment.toLocaleString()}` : '-'}
                </td>

                {/* Remaining Loan Balance (স্থিতি) */}
                <td className={styles.textBold}>
                  ৳ {row.running_loan_balance.toLocaleString()}
                </td>

                {/* Collector Signature */}
                <td className={styles.signatureCell}>
                  {row.collector_signature || '-'}
                </td>

                {/* Action Delete */}
                <td className="no-print actionCol">
                  {onDeleteTransaction && (
                    <button
                      onClick={() => onDeleteTransaction(row.id)}
                      className={styles.deleteBtn}
                      title="Delete entry"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {/* Empty filler rows up to 15 per page to match physical ledger book layout */}
            {Array.from({ length: emptyRowsCount }).map((_, i) => (
              <tr key={`empty-${i}`} className={styles.emptyRow}>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td className="no-print actionCol"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls (15 Rows Per Page) */}
      <div className={`${styles.paginationBar} no-print`}>
        <div className={styles.paginationNote}>
          {t.rowsPerPageNote} • ({rows.length} total entries)
        </div>

        <div className={styles.paginationControls}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage === 1}
            className={styles.pageBtn}
          >
            <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
            <span>Prev</span>
          </button>

          <span>
            {t.page} {validPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage >= totalPages}
            className={styles.pageBtn}
          >
            <span>Next</span>
            <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
