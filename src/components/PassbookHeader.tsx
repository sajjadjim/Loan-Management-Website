'use client';

import React, { useState } from 'react';
import { User, Edit, Printer, Phone, Calendar, Target, Hash, ShieldCheck, CreditCard, X, FileText, MapPin, Folder } from 'lucide-react';
import styles from './PassbookHeader.module.css';
import { Member } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface PassbookHeaderProps {
  member: Member;
  lang: Language;
  onEdit?: () => void;
  onPrint?: () => void;
}

export const PassbookHeader: React.FC<PassbookHeaderProps> = ({
  member,
  lang,
  onEdit,
  onPrint
}) => {
  const t = translations[lang];
  
  // NID Modal View state: 'member' | 'guarantor' | null
  const [nidViewType, setNidViewType] = useState<'member' | 'guarantor' | null>(null);

  const hasMemberNid = !!(member.nid_front_url || member.nid_back_url || member.nid_image_url);
  const hasGuarantorNid = !!(member.guarantor_nid_front_url || member.guarantor_nid_back_url || member.guarantor_photo_url);

  return (
    <>
      <div className={styles.passbookCard}>
        {/* Top Title & Profile Avatar */}
        <div className={styles.topRow}>
          <div className={styles.profileArea}>
            <div className={styles.avatarBox}>
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name} className={styles.avatarImg} />
              ) : (
                <User size={30} />
              )}
            </div>

            <div className={styles.titleArea}>
              <div className={styles.nameRow}>
                <span className={styles.bookBadge}>
                  {t.bookNo}: {member.book_no || '১'}
                </span>
                <h1 className={styles.memberName}>{member.name}</h1>
                <span className={styles.memberNoTag}>
                  <Hash size={12} style={{ display: 'inline', marginRight: 2 }} />
                  {t.memberNo}: {member.member_no}
                </span>
              </div>
            </div>
          </div>

          <div className={`${styles.actionsGroup} no-print`}>
            {/* Google Drive Folder Link */}
            {member.drive_folder_url && (
              <a
                href={member.drive_folder_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                title="গুগল ড্রাইভে সদস্যের সকল মূল ছবি ও ডকুমেন্টের ফোল্ডার খুলুন"
                style={{ borderColor: 'rgba(66, 133, 244, 0.4)', color: 'var(--text-main)' }}
              >
                <Folder size={15} style={{ color: '#4285F4' }} />
                <span>ড্রাইভ ফোল্ডার</span>
              </a>
            )}

            {/* View Member NID */}
            {hasMemberNid && (
              <button
                onClick={() => setNidViewType('member')}
                className="btn btn-secondary btn-sm"
                title="সদস্যের NID কার্ড দেখুন (Front & Back)"
              >
                <CreditCard size={15} />
                <span>সদস্য NID</span>
              </button>
            )}

            {/* View Guarantor NID */}
            {hasGuarantorNid && (
              <button
                onClick={() => setNidViewType('guarantor')}
                className="btn btn-secondary btn-sm"
                title="জামিনদারের NID কার্ড দেখুন (Front & Back)"
              >
                <ShieldCheck size={15} style={{ color: 'var(--primary)' }} />
                <span>জামিনদার NID</span>
              </button>
            )}

            {onEdit && (
              <button onClick={onEdit} className="btn btn-secondary btn-sm" title={t.editMember}>
                <Edit size={15} />
                <span>{t.editMember}</span>
              </button>
            )}

            {onPrint && (
              <button onClick={onPrint} className="btn btn-primary btn-sm" title={t.printPassbook}>
                <Printer size={15} />
                <span>{t.printPassbook}</span>
              </button>
            )}
          </div>
        </div>

        {/* Grid of Passbook Header Details */}
        <div className={styles.gridInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>{t.loanAmount}</span>
            <span className={styles.valueHighlight}>
              ৳ {Number(member.loan_amount || 0).toLocaleString()}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>{t.savingsInitial}</span>
            <span className={styles.value}>
              ৳ {Number(member.savings_initial || 0).toLocaleString()}
            </span>
          </div>

          {/* Member Father / Mother / Spouse Details */}
          {member.father_mother_spouse && (
            <div className={styles.infoItem}>
              <span className={styles.label}>{t.fatherMotherSpouse}</span>
              <span className={styles.value}>{member.father_mother_spouse}</span>
            </div>
          )}

          {/* Member Mobile */}
          <div className={styles.infoItem}>
            <span className={styles.label}>{t.mobile}</span>
            <span className={styles.value}>
              <Phone size={14} style={{ display: 'inline', marginRight: 4 }} />
              {member.mobile || '-'}
            </span>
          </div>

          {/* Member NID Card Number */}
          <div className={styles.infoItem}>
            <span className={styles.label}>{t.nidNumber}</span>
            <span className={styles.value}>
              <FileText size={14} style={{ display: 'inline', marginRight: 4 }} />
              {member.nid_number || '-'}
            </span>
          </div>

          {/* Member Address */}
          <div className={styles.infoItem}>
            <span className={styles.label}>{t.memberAddress}</span>
            <span className={styles.value}>
              <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
              {member.address || '-'}
            </span>
          </div>

          {/* Jamindar Name */}
          <div className={styles.infoItem}>
            <span className={styles.label}>{t.guarantorName}</span>
            <span className={styles.value} style={{ color: 'var(--primary)', fontWeight: 700 }}>
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
              {member.guarantor_name || '-'}
            </span>
          </div>

          {/* Jamindar Father / Mother / Spouse */}
          {member.guarantor_father_mother_spouse && (
            <div className={styles.infoItem}>
              <span className={styles.label}>{t.guarantorFatherMotherSpouse}</span>
              <span className={styles.value}>{member.guarantor_father_mother_spouse}</span>
            </div>
          )}

          {/* Jamindar Mobile */}
          <div className={styles.infoItem}>
            <span className={styles.label}>{t.guarantorMobile}</span>
            <span className={styles.value}>
              <Phone size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--primary)' }} />
              {member.guarantor_mobile || '-'}
            </span>
          </div>

          {/* Jamindar Address / NID */}
          <div className={styles.infoItem}>
            <span className={styles.label}>{t.guarantorAddress}</span>
            <span className={styles.value}>
              <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
              {member.guarantor_address || '-'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>{t.loanPurpose}</span>
            <span className={styles.value}>
              <Target size={14} style={{ display: 'inline', marginRight: 4 }} />
              {member.loan_purpose || '-'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>{t.totalInstallments}</span>
            <span className={styles.value}>{member.total_installments || 44}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>{t.admissionDate}</span>
            <span className={styles.value}>
              <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />
              {member.admission_date || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* NID Viewer Modal (Member or Guarantor NID Cards - Front & Rear) */}
      {nidViewType !== null && (
        <div className={styles.nidModalOverlay} onClick={() => setNidViewType(null)}>
          <div className={styles.nidModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                <span>
                  {nidViewType === 'member'
                    ? `সদস্যের NID কার্ড - ${member.name} (${member.nid_number || ''})`
                    : `জামিনদারের NID কার্ড - ${member.guarantor_name} (${member.guarantor_nid || ''})`}
                </span>
              </h3>
              <button onClick={() => setNidViewType(null)} className="btn btn-secondary btn-sm">
                <X size={18} />
              </button>
            </div>

            {/* Display Front & Rear Part Cards & Guarantor Photo */}
            <div className={styles.nidGrid}>
              {/* Guarantor Photo if present */}
              {nidViewType === 'guarantor' && member.guarantor_photo_url && (
                <div className={styles.nidCardBox} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.nidCardLabel}>
                    <User size={14} />
                    <span>জামিনদারের ছবি (Guarantor Photo)</span>
                  </span>
                  <img src={member.guarantor_photo_url} alt="Guarantor Photo" className={styles.nidImageFull} style={{ maxHeight: '220px', objectFit: 'contain' }} />
                </div>
              )}

              {/* Front Part Image */}
              <div className={styles.nidCardBox}>
                <span className={styles.nidCardLabel}>
                  <CreditCard size={14} />
                  <span>সামনের অংশ (Front Part)</span>
                </span>
                {nidViewType === 'member' ? (
                  (member.nid_front_url || member.nid_image_url) ? (
                    <img src={member.nid_front_url || member.nid_image_url} alt="NID Front" className={styles.nidImageFull} />
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      সামনের অংশের ছবি যুক্ত করা হয়নি
                    </div>
                  )
                ) : (
                  member.guarantor_nid_front_url ? (
                    <img src={member.guarantor_nid_front_url} alt="Guarantor NID Front" className={styles.nidImageFull} />
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      সামনের অংশের ছবি যুক্ত করা হয়নি
                    </div>
                  )
                )}
              </div>

              {/* Rear / Back Part Image */}
              <div className={styles.nidCardBox}>
                <span className={styles.nidCardLabel}>
                  <CreditCard size={14} />
                  <span>পেছনের অংশ (Rear/Back Part)</span>
                </span>
                {nidViewType === 'member' ? (
                  member.nid_back_url ? (
                    <img src={member.nid_back_url} alt="NID Back" className={styles.nidImageFull} />
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      পেছনের অংশের ছবি যুক্ত করা হয়নি
                    </div>
                  )
                ) : (
                  member.guarantor_nid_back_url ? (
                    <img src={member.guarantor_nid_back_url} alt="Guarantor NID Back" className={styles.nidImageFull} />
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      পেছনের অংশের ছবি যুক্ত করা হয়নি
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
