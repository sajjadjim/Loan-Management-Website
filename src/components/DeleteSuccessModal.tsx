'use client';

import React from 'react';
import { Trash2, CheckCircle } from 'lucide-react';
import styles from './DeleteSuccessModal.module.css';
import { Language } from '@/lib/i18n';

interface DeleteSuccessModalProps {
  isOpen: boolean;
  memberName: string;
  memberNo?: string;
  onClose: () => void;
  lang: Language;
}

export const DeleteSuccessModal: React.FC<DeleteSuccessModalProps> = ({
  isOpen,
  memberName,
  memberNo,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  const isBn = lang === 'bn';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconRing}>
          <Trash2 size={36} />
        </div>

        <h3 className={styles.title}>
          {isBn ? 'সদস্য মুছে ফেলা সম্পন্ন হয়েছে!' : 'Member Deleted Successfully!'}
        </h3>
        
        <p className={styles.subtitle}>
          {isBn
            ? 'সদস্যের সকল তথ্য, এনআইডি ও লেনদেনের হিসেব স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলা হয়েছে।'
            : 'All member records, documents, and transaction histories have been permanently deleted.'}
        </p>

        {memberName && (
          <div className={styles.memberBadgeCard}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600, display: 'block' }}>
                {isBn ? 'মুছে ফেলা সদস্য:' : 'Deleted Member:'}
              </span>
              <span className={styles.memberName}>{memberName}</span>
            </div>
            {memberNo && (
              <span className={styles.memberNo}>
                {isBn ? 'নম্বর: ' : 'No: '}{memberNo}
              </span>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={onClose} className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#b91c1c' }}>
            <CheckCircle size={18} />
            <span>{isBn ? 'ঠিক আছে' : 'OK, Close'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
