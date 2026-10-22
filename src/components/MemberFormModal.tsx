'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Upload, 
  User, 
  CreditCard, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  ShieldCheck, 
  Camera, 
  FileText,
  DollarSign,
  Folder,
  CloudUpload
} from 'lucide-react';
import styles from './MemberFormModal.module.css';
import { Member } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { getNextAutoMemberAndBookNo } from '@/lib/db';
import { compressImage, compressDataUrl, getBase64SizeKB } from '@/lib/imageCompressor';
import { CameraCaptureModal } from './CameraCaptureModal';
import { uploadMemberImagesToDrive, ImageUploadItem } from '@/lib/googleDrive';

type DocFieldKey = 
  | 'photo_url' 
  | 'nid_front_url' 
  | 'nid_back_url' 
  | 'guarantor_photo_url'
  | 'guarantor_nid_front_url' 
  | 'guarantor_nid_back_url';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Omit<Member, 'id' | 'created_at'>) => Promise<void>;
  initialData?: Member | null;
  lang: Language;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  lang
}) => {
  const t = translations[lang];

  const [formData, setFormData] = useState({
    member_no: '',
    name: '',
    father_mother_spouse: '',
    loan_amount: '',
    savings_initial: '',
    loan_purpose: '',
    admission_date: new Date().toISOString().split('T')[0],
    total_installments: '44',
    mobile: '',
    address: '',
    book_no: '',
    guarantor_name: '',
    guarantor_father_mother_spouse: '',
    guarantor_mobile: '',
    guarantor_address: '',
    guarantor_nid: '',
    nid_number: '',
    photo_url: '',
    nid_front_url: '',
    nid_back_url: '',
    nid_image_url: '',
    guarantor_photo_url: '',
    guarantor_nid_front_url: '',
    guarantor_nid_back_url: '',
    drive_folder_url: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [compressingField, setCompressingField] = useState<string | null>(null);
  const [isAutoAssigned, setIsAutoAssigned] = useState(false);

  // WebCam Camera Modal State
  const [cameraModalConfig, setCameraModalConfig] = useState<{
    isOpen: boolean;
    fieldKey: DocFieldKey | null;
    title: string;
  }>({
    isOpen: false,
    fieldKey: null,
    title: ''
  });

  useEffect(() => {
    async function initForm() {
      if (initialData) {
        setIsAutoAssigned(false);
        setFormData({
          member_no: initialData.member_no || '',
          name: initialData.name || '',
          father_mother_spouse: initialData.father_mother_spouse || '',
          loan_amount: String(initialData.loan_amount || ''),
          savings_initial: String(initialData.savings_initial || ''),
          loan_purpose: initialData.loan_purpose || '',
          admission_date: initialData.admission_date || new Date().toISOString().split('T')[0],
          total_installments: String(initialData.total_installments || 44),
          mobile: initialData.mobile || '',
          address: initialData.address || '',
          book_no: initialData.book_no || '১',
          guarantor_name: initialData.guarantor_name || '',
          guarantor_father_mother_spouse: initialData.guarantor_father_mother_spouse || '',
          guarantor_mobile: initialData.guarantor_mobile || '',
          guarantor_address: initialData.guarantor_address || '',
          guarantor_nid: initialData.guarantor_nid || '',
          nid_number: initialData.nid_number || '',
          photo_url: initialData.photo_url || '',
          nid_front_url: initialData.nid_front_url || initialData.nid_image_url || '',
          nid_back_url: initialData.nid_back_url || '',
          nid_image_url: initialData.nid_image_url || initialData.nid_front_url || '',
          guarantor_photo_url: initialData.guarantor_photo_url || '',
          guarantor_nid_front_url: initialData.guarantor_nid_front_url || '',
          guarantor_nid_back_url: initialData.guarantor_nid_back_url || '',
          drive_folder_url: initialData.drive_folder_url || ''
        });
      } else {
        setIsAutoAssigned(true);
        const auto = await getNextAutoMemberAndBookNo();
        setFormData({
          member_no: auto.nextMemberNo,
          name: '',
          father_mother_spouse: '',
          loan_amount: '',
          savings_initial: '0',
          loan_purpose: '',
          admission_date: new Date().toISOString().split('T')[0],
          total_installments: '44',
          mobile: '',
          address: '',
          book_no: auto.nextBookNo,
          guarantor_name: '',
          guarantor_father_mother_spouse: '',
          guarantor_mobile: '',
          guarantor_address: '',
          guarantor_nid: '',
          nid_number: '',
          photo_url: '',
          nid_front_url: '',
          nid_back_url: '',
          nid_image_url: '',
          guarantor_photo_url: '',
          guarantor_nid_front_url: '',
          guarantor_nid_back_url: '',
          drive_folder_url: ''
        });
      }
    }

    if (isOpen) {
      initForm();
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // File upload from device file picker
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: DocFieldKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressingField(fieldKey);
    try {
      // Member photo is compressed to 100-180KB (150KB target max, 800px) for direct database storage
      const isMemberPhoto = fieldKey === 'photo_url';
      const maxKB = isMemberPhoto ? 150 : 2000;
      const maxDimension = isMemberPhoto ? 800 : 2400;

      const compressedDataUrl = await compressImage(file, maxKB, maxDimension);
      setFormData((prev) => ({
        ...prev,
        [fieldKey]: compressedDataUrl,
        ...(fieldKey === 'nid_front_url' ? { nid_image_url: compressedDataUrl } : {})
      }));
    } catch (err) {
      console.error('Image compression failed', err);
    } finally {
      setCompressingField(null);
    }
  };

  // Instant Camera capture complete
  const handleCameraCapture = async (compressedDataUrl: string) => {
    if (!cameraModalConfig.fieldKey) return;
    const fieldKey = cameraModalConfig.fieldKey;

    let finalDataUrl = compressedDataUrl;
    if (fieldKey === 'photo_url') {
      finalDataUrl = await compressDataUrl(compressedDataUrl, 150, 800);
    }

    setFormData((prev) => ({
      ...prev,
      [fieldKey]: finalDataUrl,
      ...(fieldKey === 'nid_front_url' ? { nid_image_url: finalDataUrl } : {})
    }));
  };

  const openCamera = (fieldKey: DocFieldKey, title: string) => {
    setCameraModalConfig({
      isOpen: true,
      fieldKey,
      title
    });
  };

  const removeImage = (fieldKey: DocFieldKey) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: '',
      ...(fieldKey === 'nid_front_url' ? { nid_image_url: '' } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.guarantor_name) return;

    setSubmitting(true);
    setUploadStatusMsg('গুগল ড্রাইভে ফোল্ডার তৈরি ও ছবি আপলোড হচ্ছে...');

    try {
      // 1. Gather all base64 data URLs to upload to Google Drive
      const imageItems: ImageUploadItem[] = [
        { key: 'photo_url', base64: formData.photo_url },
        { key: 'nid_front_url', base64: formData.nid_front_url || formData.nid_image_url },
        { key: 'nid_back_url', base64: formData.nid_back_url },
        { key: 'guarantor_photo_url', base64: formData.guarantor_photo_url },
        { key: 'guarantor_nid_front_url', base64: formData.guarantor_nid_front_url },
        { key: 'guarantor_nid_back_url', base64: formData.guarantor_nid_back_url }
      ];

      // Upload base64 images to Google Drive
      const driveResult = await uploadMemberImagesToDrive(
        formData.member_no,
        formData.name,
        imageItems
      );

      // Member photo is kept as compressed Base64 data URL (100-180 KB) directly in database for instant web display
      const finalPhotoUrl = formData.photo_url;
      const finalNidFrontUrl = driveResult.urls.nid_front_url || formData.nid_front_url || formData.nid_image_url;
      const finalNidBackUrl = driveResult.urls.nid_back_url || formData.nid_back_url;
      const finalGuarantorPhotoUrl = driveResult.urls.guarantor_photo_url || formData.guarantor_photo_url;
      const finalGuarantorNidFrontUrl = driveResult.urls.guarantor_nid_front_url || formData.guarantor_nid_front_url;
      const finalGuarantorNidBackUrl = driveResult.urls.guarantor_nid_back_url || formData.guarantor_nid_back_url;
      const finalDriveFolderUrl = driveResult.folder_url || formData.drive_folder_url;

      setUploadStatusMsg('সদস্যের তথ্য সংরক্ষণ করা হচ্ছে...');

      await onSave({
        member_no: formData.member_no,
        name: formData.name,
        father_mother_spouse: formData.father_mother_spouse,
        loan_amount: Number(formData.loan_amount || 0),
        savings_initial: Number(formData.savings_initial || 0),
        loan_purpose: formData.loan_purpose,
        admission_date: formData.admission_date,
        total_installments: Number(formData.total_installments || 44),
        mobile: formData.mobile,
        address: formData.address,
        book_no: formData.book_no,
        guarantor_name: formData.guarantor_name,
        guarantor_father_mother_spouse: formData.guarantor_father_mother_spouse,
        guarantor_mobile: formData.guarantor_mobile,
        guarantor_address: formData.guarantor_address,
        guarantor_nid: formData.guarantor_nid,
        nid_number: formData.nid_number,
        photo_url: finalPhotoUrl,
        nid_front_url: finalNidFrontUrl,
        nid_back_url: finalNidBackUrl,
        nid_image_url: finalNidFrontUrl,
        guarantor_photo_url: finalGuarantorPhotoUrl,
        guarantor_nid_front_url: finalGuarantorNidFrontUrl,
        guarantor_nid_back_url: finalGuarantorNidBackUrl,
        drive_folder_url: finalDriveFolderUrl,
        status: 'active'
      });
      onClose();
    } catch (err) {
      console.error('Failed saving member', err);
    } finally {
      setSubmitting(false);
      setUploadStatusMsg('');
    }
  };

  const renderUploadBox = (
    label: string,
    fieldKey: DocFieldKey,
    value: string,
    iconType: 'user' | 'card'
  ) => {
    const isCompressing = compressingField === fieldKey;

    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        <div className={styles.uploadSection}>
          {value ? (
            <img src={value} alt={label} className={styles.previewThumb} />
          ) : (
            <div className={styles.avatarFallback}>
              {iconType === 'user' ? <User size={24} /> : <CreditCard size={24} />}
            </div>
          )}

          <div className={styles.uploadActions}>
            <div className={styles.btnGroupRow}>
              {/* Option 1: File / Gallery Upload */}
              <label className={styles.fileInputLabel} title="ডিভাইসের গ্যালারি বা ফাইল থেকে সিলেক্ট করুন">
                <Upload size={13} />
                <span>{isCompressing ? 'কমপ্রেস...' : '📁 ফাইল'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isCompressing}
                  className={styles.hiddenFileInput}
                  onChange={(e) => handleFileUpload(e, fieldKey)}
                />
              </label>

              {/* Option 2: Live Web Camera Capture */}
              <button
                type="button"
                onClick={() => openCamera(fieldKey, label)}
                className={styles.cameraBtn}
                title="সরাসরি ক্যামেরা চালু করে ছবি তুলুন"
              >
                <Camera size={13} />
                <span>📷 ক্যামেরা</span>
              </button>

              {/* Remove Photo */}
              {value && (
                <button
                  type="button"
                  onClick={() => removeImage(fieldKey)}
                  className="btn btn-danger btn-sm"
                  title="ছবি মুছে ফেলুন"
                  style={{ padding: '0.35rem 0.5rem' }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {value && (
              <span style={{ fontSize: '0.675rem', color: '#059669', fontWeight: 600 }}>
                <CheckCircle size={10} style={{ display: 'inline', marginRight: 2 }} />
                সাইজ: {getBase64SizeKB(value)} KB
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {initialData ? t.editMember : t.addMember}
            </h2>
            <button onClick={onClose} className={styles.closeBtn}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <div className={styles.grid}>
                {/* SECTION 1: MEMBER BASIC INFO */}
                {/* Member No (Auto Generated) */}
                <div className={styles.field}>
                  <label className={styles.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{t.memberNo} *</span>
                    {isAutoAssigned && (
                      <span className="badge badge-success" style={{ fontSize: '0.675rem', padding: '0.1rem 0.4rem' }}>
                        <Sparkles size={10} /> অটো জেনারেট
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="e.g. ১২৬"
                    value={formData.member_no}
                    onChange={(e) => setFormData({ ...formData, member_no: e.target.value })}
                  />
                </div>

                {/* Book No (Auto Generated) */}
                <div className={styles.field}>
                  <label className={styles.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{t.bookNo}</span>
                    {isAutoAssigned && (
                      <span className="badge badge-info" style={{ fontSize: '0.675rem', padding: '0.1rem 0.4rem' }}>
                        <Sparkles size={10} /> অটো জেনারেট
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. ১"
                    value={formData.book_no}
                    onChange={(e) => setFormData({ ...formData, book_no: e.target.value })}
                  />
                </div>

                {/* Full Name */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>{t.memberName} *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="e.g. আনোয়ার হোসেন"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Borrower Father / Mother / Spouse Name */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>{t.fatherMotherSpouse}</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. পিতা/মাতা/স্ত্রী/স্বামীর নাম"
                    value={formData.father_mother_spouse}
                    onChange={(e) => setFormData({ ...formData, father_mother_spouse: e.target.value })}
                  />
                </div>

                {/* Member Mobile Number */}
                <div className={styles.field}>
                  <label className={styles.label}>{t.mobile} *</label>
                  <input
                    type="tel"
                    required
                    className={styles.input}
                    placeholder="01712345678"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                {/* Member NID Card Number */}
                <div className={styles.field}>
                  <label className={styles.label}>{t.nidNumber} *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="e.g. 19922694152000125"
                    value={formData.nid_number}
                    onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
                  />
                </div>

                {/* Member Address */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>{t.memberAddress}</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. গ্রাম: রামপুর, ডাকঘর: বাজার রোড"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                {/* SECTION 2: MEMBER DOCUMENTS (PHOTO, NID FRONT, NID REAR) */}
                <div className={styles.sectionDivider}>
                  <h4 className={styles.sectionTitle}>
                    <User size={18} />
                    <span>সদস্যের ছবি ও NID ডকুমেন্টস (Member Photo & NID Front/Rear)</span>
                  </h4>
                </div>

                {/* 1. Member Photo */}
                {renderUploadBox('সদস্যের ছবি (Photo)', 'photo_url', formData.photo_url, 'user')}

                {/* 2. Member NID Card (Front Part) */}
                {renderUploadBox('সদস্যের NID কার্ড (সামনের অংশ)', 'nid_front_url', formData.nid_front_url, 'card')}

                {/* 3. Member NID Card (Rear/Back Part) */}
                <div className={styles.fullWidth}>
                  {renderUploadBox('সদস্যের NID কার্ড (পেছনের অংশ)', 'nid_back_url', formData.nid_back_url, 'card')}
                </div>

                {/* SECTION 3: GUARANTOR (JAMINDAR) DETAILS & DOCUMENTS */}
                <div className={styles.sectionDivider}>
                  <h4 className={styles.sectionTitle}>
                    <ShieldCheck size={18} />
                    <span>{t.guarantorSection}</span>
                  </h4>
                </div>

                {/* Jamindar Name */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>{t.guarantorName} *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="e.g. জামিনদারের নাম (মোঃ রফিকুল ইসলাম)"
                    value={formData.guarantor_name}
                    onChange={(e) => setFormData({ ...formData, guarantor_name: e.target.value })}
                  />
                </div>

                {/* Jamindar Father / Mother / Spouse */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>{t.guarantorFatherMotherSpouse}</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. জামিনদারের পিতা/মাতা/স্ত্রী/স্বামীর নাম"
                    value={formData.guarantor_father_mother_spouse}
                    onChange={(e) => setFormData({ ...formData, guarantor_father_mother_spouse: e.target.value })}
                  />
                </div>

                {/* Jamindar Mobile */}
                <div className={styles.field}>
                  <label className={styles.label}>{t.guarantorMobile} *</label>
                  <input
                    type="tel"
                    required
                    className={styles.input}
                    placeholder="01799887766"
                    value={formData.guarantor_mobile}
                    onChange={(e) => setFormData({ ...formData, guarantor_mobile: e.target.value })}
                  />
                </div>

                {/* Jamindar NID Number */}
                <div className={styles.field}>
                  <label className={styles.label}>{t.guarantorNid}</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. 19852694152000999"
                    value={formData.guarantor_nid}
                    onChange={(e) => setFormData({ ...formData, guarantor_nid: e.target.value })}
                  />
                </div>

                {/* Jamindar Address */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>{t.guarantorAddress}</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. জামিনদারের ঠিকানা"
                    value={formData.guarantor_address}
                    onChange={(e) => setFormData({ ...formData, guarantor_address: e.target.value })}
                  />
                </div>

                {/* 4. Guarantor Photo */}
                <div className={styles.fullWidth}>
                  {renderUploadBox('জামিনদারের ছবি', 'guarantor_photo_url', formData.guarantor_photo_url, 'user')}
                </div>

                {/* 5. Guarantor NID Front */}
                {renderUploadBox('জামিনদারের NID কার্ড (সামনের অংশ)', 'guarantor_nid_front_url', formData.guarantor_nid_front_url, 'card')}

                {/* 6. Guarantor NID Rear/Back */}
                {renderUploadBox('জামিনদারের NID কার্ড (পেছনের অংশ)', 'guarantor_nid_back_url', formData.guarantor_nid_back_url, 'card')}

                {/* SECTION 4: LOAN & SAVINGS INFO */}
                <div className={styles.sectionDivider}>
                  <h4 className={styles.sectionTitle}>
                    <DollarSign size={18} />
                    <span>ঋণ ও সঞ্চয়ের হিসাব (Loan & Savings Information)</span>
                  </h4>
                </div>

                {/* Loan Amount */}
                <div className={styles.field}>
                  <label className={styles.label}>{t.loanAmount} (৳) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className={styles.input}
                    placeholder="e.g. 100000"
                    value={formData.loan_amount}
                    onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
                  />
                </div>

                {/* Initial Savings */}
                <div className={styles.field}>
                  <label className={styles.label}>{t.savingsInitial} (৳)</label>
                  <input
                    type="number"
                    min="0"
                    className={styles.input}
                    placeholder="e.g. 10000"
                    value={formData.savings_initial}
                    onChange={(e) => setFormData({ ...formData, savings_initial: e.target.value })}
                  />
                </div>

                {/* Loan Purpose */}
                <div className={styles.field}>
                  <label className={styles.label}>{t.loanPurpose}</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. ব্যবসা"
                    value={formData.loan_purpose}
                    onChange={(e) => setFormData({ ...formData, loan_purpose: e.target.value })}
                  />
                </div>

                {/* Installments count */}
                <div className={styles.field}>
                  <label className={styles.label}>{t.totalInstallments}</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="44"
                    value={formData.total_installments}
                    onChange={(e) => setFormData({ ...formData, total_installments: e.target.value })}
                  />
                </div>

                {/* Admission Date */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>{t.admissionDate}</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={formData.admission_date}
                    onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              {submitting && uploadStatusMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginRight: 'auto' }}>
                  <CloudUpload size={16} className="animate-spin" />
                  <span>{uploadStatusMsg}</span>
                </div>
              )}
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
                disabled={submitting || compressingField !== null}
              >
                <Save size={16} />
                <span>{submitting ? 'সংরক্ষণ করা হচ্ছে...' : t.save}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Instant Web Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraModalConfig.isOpen}
        title={cameraModalConfig.title}
        onClose={() => setCameraModalConfig({ ...cameraModalConfig, isOpen: false })}
        onCapture={handleCameraCapture}
      />
    </>
  );
};
