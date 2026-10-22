'use client';

import React from 'react';
import { CheckCircle2, LogOut, User, ShieldCheck } from 'lucide-react';
import styles from './AuthNotificationModal.module.css';
import { Language } from '@/lib/i18n';

interface AuthNotificationModalProps {
  isOpen: boolean;
  type: 'login_success' | 'register_success' | 'logout_confirm';
  userEmail?: string | null;
  userPhoto?: string | null;
  userName?: string | null;
  onClose: () => void;
  onConfirmLogout?: () => void;
  lang?: Language;
}

export const AuthNotificationModal: React.FC<AuthNotificationModalProps> = ({
  isOpen,
  type,
  userEmail,
  userPhoto,
  userName,
  onClose,
  onConfirmLogout,
  lang = 'bn'
}) => {
  if (!isOpen) return null;

  const isBn = lang === 'bn';

  if (type === 'logout_confirm') {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.iconRingRose}>
            <LogOut size={36} />
          </div>

          <h3 className={styles.title} style={{ color: '#991b1b' }}>
            {isBn ? 'লগআউট নিশ্চিতকরণ' : 'Confirm Logout'}
          </h3>

          <p className={styles.subtitle}>
            {isBn
              ? 'আপনি কি নিশ্চিত যে আপনি অ্যাকাউন্ট থেকে লগআউট করতে চান?'
              : 'Are you sure you want to log out of your account?'}
          </p>

          {userEmail && (
            <div className={styles.userCard} style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
              <div className={styles.userAvatar} style={{ background: '#dc2626' }}>
                {userPhoto ? (
                  <img src={userPhoto} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (userName || userEmail).charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600, display: 'block' }}>
                  {userName || (isBn ? 'বর্তমান একাউন্ট' : 'Current Account')}
                </span>
                <span className={styles.userEmail}>{userEmail}</span>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button onClick={onClose} className="btn btn-secondary">
              <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                if (onConfirmLogout) onConfirmLogout();
              }}
              className="btn btn-danger"
              style={{ background: '#dc2626', borderColor: '#b91c1c' }}
            >
              <LogOut size={16} />
              <span>{isBn ? 'হ্যাঁ, লগআউট করুন' : 'Yes, Log Out'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRegister = type === 'register_success';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconRingGreen}>
          <CheckCircle2 size={38} />
        </div>

        <h3 className={styles.title}>
          {isRegister
            ? (isBn ? 'একাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account Created Successfully!')
            : (isBn ? 'লগইন সফল হয়েছে!' : 'Login Successful!')}
        </h3>

        <p className={styles.subtitle}>
          {isRegister
            ? (isBn ? 'আপনার নতুন একাউন্ট সফলভাবে নিবন্ধিত হয়েছে। এখন আপনি ড্যাশবোর্ড ব্যবহার করতে পারবেন।' : 'Your account has been registered. You can now access the dashboard.')
            : (isBn ? 'সফলভাবে আপনার একাউন্টে প্রবেশ করা হয়েছে। স্বাগত জানাচ্ছি!' : 'You have successfully logged in. Welcome back!')}
        </p>

        {(userEmail || userName) && (
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {userPhoto ? (
                <img src={userPhoto} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (userName || userEmail || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                <ShieldCheck size={12} style={{ display: 'inline', marginRight: 3 }} />
                {isBn ? 'নিরাপদ একাউন্ট' : 'Authenticated User'}
              </span>
              <span className={styles.userEmail}>{userName || userEmail}</span>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={onClose} className="btn btn-primary" style={{ background: '#059669', borderColor: '#047857' }}>
            <span>{isBn ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Proceed to Dashboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
