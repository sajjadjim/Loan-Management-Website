'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, User, Folder, ShieldCheck } from 'lucide-react';
import styles from './SuccessModal.module.css';
import { Member } from '@/lib/types';
import { Language } from '@/lib/i18n';

interface SuccessModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  lang: Language;
  mode?: 'create' | 'update';
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  member,
  onClose,
  lang,
  mode = 'create'
}) => {
  if (!isOpen || !member) return null;

  const isBn = lang === 'bn';
  const isUpdate = mode === 'update';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconRing}>
          <CheckCircle2 size={38} />
        </div>

        <h3 className={styles.title}>
          {isUpdate
            ? (isBn ? 'সদস্যের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Member Updated Successfully!')
            : (isBn ? 'নতুন সদস্য সফলভাবে তৈরি হয়েছে!' : 'New Member Created Successfully!')}
        </h3>
        
        <p className={styles.subtitle}>
          {isUpdate
            ? (isBn ? 'সদস্যের সকল নতুন তথ্য ও ছবি ডাটাবেজে সংরক্ষণ করা হয়েছে।' : 'Updated details and images have been saved.')
            : (isBn ? 'নতুন সদস্যের সকল তথ্য ও ছবি সফলভাবে ডাটাবেজে ও গুগল ড্রাইভে সংরক্ষিত হয়েছে।' : 'New member details & documents have been saved.')}
        </p>

        <div className={styles.cardDetails}>
          {/* Top Avatar Photo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-sm)', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={24} style={{ color: '#64748b' }} />
              )}
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{member.name}</h4>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                {isBn ? 'মোবাইল: ' : 'Mobile: '}{member.mobile}
              </span>
            </div>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{isBn ? 'সদস্য নম্বর:' : 'Member No:'}</span>
            <span className={styles.badge}>{member.member_no}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{isBn ? 'বই নং / পৃষ্ঠা:' : 'Book No:'}</span>
            <span className={styles.detailVal}>{member.book_no || '১'}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{isBn ? 'ঋণের পরিমাণ:' : 'Loan Amount:'}</span>
            <span className={styles.detailVal} style={{ color: 'var(--primary)' }}>
              ৳ {Number(member.loan_amount || 0).toLocaleString()}
            </span>
          </div>

          {member.guarantor_name && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{isBn ? 'জামিনদারের নাম:' : 'Guarantor:'}</span>
              <span className={styles.detailVal} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                <span>{member.guarantor_name}</span>
              </span>
            </div>
          )}

          {member.drive_folder_url && (
            <div className={styles.detailRow} style={{ marginTop: '0.35rem' }}>
              <span className={styles.detailLabel}>{isBn ? 'ড্রাইভ ফোল্ডার:' : 'Drive Folder:'}</span>
              <a
                href={member.drive_folder_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'underline' }}
              >
                <Folder size={13} />
                <span>{isBn ? 'ফোল্ডার খুলুন' : 'Open Folder'}</span>
              </a>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className="btn btn-secondary">
            <span>{isBn ? 'সম্পন্ন' : 'Done'}</span>
          </button>

          <Link href={`/members/${member.id}`} className="btn btn-primary" onClick={onClose}>
            <span>{isBn ? 'পাসবই দেখুন' : 'View Passbook'}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
