'use client';

import React, { useState } from 'react';
import { Shield, Lock, Mail, KeyRound, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import styles from './LoginPage.module.css';

interface LoginPageProps {
  onGoogleLogin: () => Promise<void>;
  onEmailLogin: (email: string, pass: string) => Promise<void>;
  onEmailRegister: (email: string, pass: string) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onGoogleLogin, 
  onEmailLogin, 
  onEmailRegister 
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const getBengaliErrorMessage = (errCode: string, defaultMessage: string): string => {
    if (errCode.includes('auth/invalid-email')) return 'সঠিক ইমেইল এড্রেস টাইপ করুন।';
    if (errCode.includes('auth/user-not-found') || errCode.includes('auth/invalid-credential')) return 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।';
    if (errCode.includes('auth/wrong-password')) return 'ভুল পাসওয়ার্ড দেওয়া হয়েছে।';
    if (errCode.includes('auth/email-already-in-use')) return 'এই ইমেইল দিয়ে আগেই একাউন্ট তৈরি করা আছে। লগইন করুন।';
    if (errCode.includes('auth/weak-password')) return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
    return defaultMessage || 'অনুরোধটি ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (activeTab === 'login') {
        await onEmailLogin(email, password);
      } else {
        await onEmailRegister(email, password);
        setSuccessMsg('একাউন্ট সফলভাবে তৈরি হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      const code = err?.code || '';
      setErrorMsg(getBengaliErrorMessage(code, err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      await onGoogleLogin();
    } catch (err: any) {
      console.error('Google login failed:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('গুগল দিয়ে লগইন সফল হয়নি। আবার চেষ্টা করুন।');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoBadge}>
          <Shield size={34} />
        </div>

        <h1 className={styles.appName}>ঋণ ও সঞ্চয় হিসাব ব্যবস্থাপনা</h1>
        <p className={styles.appSub}>
          সিস্টেমে প্রবেশ করতে ইমেইল-পাসওয়ার্ড অথবা গুগল একাউন্ট দিয়ে সাইন ইন করুন।
        </p>

        {/* Tab switcher: Login / Register */}
        <div className={styles.tabRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'login' ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            লগইন করুন
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'register' ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            একাউন্ট তৈরি করুন
          </button>
        </div>

        {/* Banner Feedback Messages */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.825rem',
            marginBottom: '1rem',
            width: '100%',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.825rem',
            marginBottom: '1rem',
            width: '100%',
            textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              <Mail size={13} />
              <span>ইমেইল এড্রেস</span>
            </label>
            <div className={styles.inputGroup}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <KeyRound size={13} />
              <span>পাসওয়ার্ড</span>
            </label>
            <div className={styles.inputGroup}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="******"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className={styles.submitBtn}
          >
            {loading ? (
              <span>প্রসেসিং হচ্ছে...</span>
            ) : activeTab === 'login' ? (
              <>
                <LogIn size={16} />
                <span>লগইন করুন</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>একাউন্ট তৈরি করুন</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.dividerRow}>
          <span className={styles.dividerLine}></span>
          <span>অথবা</span>
          <span className={styles.dividerLine}></span>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading || googleLoading}
          className={styles.googleBtn}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'গুগলে সাইন ইন হচ্ছে...' : 'Google দিয়ে সাইন ইন করুন'}</span>
        </button>

        <div className={styles.securityNote}>
          <Lock size={12} />
          <span>গুগল ফায়ারবেস অথেন্টিকেশন দিয়ে নিরাপদ</span>
        </div>
      </div>
    </div>
  );
};
