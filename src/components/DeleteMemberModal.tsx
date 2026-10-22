'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import styles from './DeleteMemberModal.module.css';
import { Member } from '@/lib/types';
import { Language } from '@/lib/i18n';

interface DeleteMemberModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onConfirmDelete: (memberId: string) => Promise<void>;
  lang: Language;
}

export const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen,
  member,
  onClose,
  onConfirmDelete,
  lang
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [inputVal, setInputVal] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setInputVal('');
      setDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const isBn = lang === 'bn';
  const isCodeValid = inputVal.trim().toUpperCase() === 'DELETE';

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCodeValid || deleting) return;

    setDeleting(true);
    try {
      await onConfirmDelete(member.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete member', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>
            <AlertTriangle size={20} />
            <span>{isBn ? 'সদস্য মুছে ফেলার ২-ধাপ যাচাইকরণ' : '2-Step Delete Verification'}</span>
          </h3>
          <button onClick={onClose} className={styles.closeBtn} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.body}>
          {/* Step Progress Dots */}
          <div className={styles.stepIndicator}>
            <span className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}>1</span>
            <span>{isBn ? 'প্রথম যাচাই' : 'Step 1'}</span>
            <span style={{ color: '#cbd5e1' }}>—</span>
            <span className={`${styles.stepDot} ${step === 2 ? styles.stepActive : ''}`}>2</span>
            <span>{isBn ? 'DELETE লিখে নিশ্চিতকরণ' : 'Type DELETE'}</span>
          </div>

          {/* Member Card Summary */}
          <div className={styles.memberBadgeCard}>
            <div>
              <span className={styles.memberName}>{member.name}</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isBn ? 'মোবাইল: ' : 'Mobile: '}{member.mobile || '-'}
              </div>
            </div>
            <span className={styles.memberNo}>
              {isBn ? 'সদস্য নম্বর: ' : 'No: '}{member.member_no}
            </span>
          </div>

          {/* STEP 1 VIEW */}
          {step === 1 && (
            <>
              <div className={styles.warningBox}>
                <h4 className={styles.warningTitle}>
                  {isBn ? 'আপনি কি নিশ্চিত যে এই সদস্যকে মুছে ফেলতে চান?' : 'Are you sure you want to delete this member?'}
                </h4>
                <p className={styles.warningText}>
                  {isBn
                    ? 'এই সদস্যকে মুছে ফেললে তার নাম, এনআইডি, ছবি, জামিনদারের তথ্য এবং পাসবই লেজারের সমস্ত লেনদেনের রেকর্ড Primary Supabase DB, Secondary Cloud DB এবং LocalStorage থেকে চিরতরে মুছে যাবে।'
                    : 'Deleting this member will permanently erase their profile, NID images, guarantor info, and all passbook ledger transaction history from both Cloud Databases & local storage.'}
                </p>
              </div>

              <div className={styles.footer} style={{ padding: 0, background: 'none', border: 'none' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-danger btn-sm"
                >
                  <span>{isBn ? 'হ্যাঁ, ২য় ধাপে যান' : 'Proceed to Step 2'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* STEP 2 VIEW (Requires Typing "DELETE") */}
          {step === 2 && (
            <form onSubmit={handleDeleteSubmit}>
              <div className={styles.warningBox} style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b91c1c', fontWeight: 700, fontSize: '0.9rem' }}>
                  <ShieldAlert size={18} />
                  <span>{isBn ? 'চূড়ান্ত সুরক্ষা যাচাইকরণ (Final Security Check)' : 'Final Security Verification'}</span>
                </div>
                <p className={styles.warningText}>
                  {isBn
                    ? 'ডাটাবেজ ও লেনদেন টেবিল থেকে স্থায়ীভাবে মুছে ফেলতে নিচে \'DELETE\' শব্দটি লিখুন:'
                    : 'To permanently purge this user & transactions from all tables, type \'DELETE\' below:'}
                </p>
              </div>

              <div className={styles.verificationField} style={{ marginTop: '0.75rem' }}>
                <label className={styles.verificationLabel}>
                  {isBn ? 'টাইপ করুন: DELETE' : 'Type exact word: DELETE'}
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="DELETE"
                  className={styles.verificationInput}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                />
              </div>

              <div className={styles.footer} style={{ padding: 0, marginTop: '1.25rem', background: 'none', border: 'none' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary btn-sm"
                  disabled={deleting}
                >
                  {isBn ? 'পেছনে যান' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="btn btn-danger btn-sm"
                  disabled={!isCodeValid || deleting}
                  style={{ opacity: isCodeValid ? 1 : 0.5, cursor: isCodeValid ? 'pointer' : 'not-allowed' }}
                >
                  <Trash2 size={16} />
                  <span>{deleting ? 'মুছে ফেলা হচ্ছে...' : (isBn ? 'স্থায়ীভাবে ডিলিট করুন' : 'Permanently Delete')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
