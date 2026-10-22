'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Search, Globe, Database, Download, ShieldCheck, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';
import { Language, translations } from '@/lib/i18n';
import { isPrimaryConfigured, isSecondaryConfigured } from '@/lib/supabaseClient';
import { exportFullBackupJSON } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenAddMemberModal?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onOpenAddMemberModal,
  searchQuery = '',
  onSearchChange
}) => {
  const t = translations[lang];
  const { user, requestLogoutConfirmation } = useAuth();

  let dbBadgeText = 'লোকাল মোড';
  let dbBadgeTooltip = 'লোকাল স্টোরেজ (ডেমো) মোড সক্রিয় - ডাটা ব্রাউজারে সংরক্ষিত';
  let isCloudActive = false;

  if (isPrimaryConfigured && isSecondaryConfigured) {
    dbBadgeText = 'ডাবল ক্লাউড';
    dbBadgeTooltip = 'প্রাইমারি ও ব্যাকআপ Supabase ক্লাউড ডাটাবেজ সক্রিয়';
    isCloudActive = true;
  } else if (isPrimaryConfigured) {
    dbBadgeText = 'ক্লাউড সিঙ্ক';
    dbBadgeTooltip = 'Supabase ক্লাউড ডাটাবেজ সক্রিয়';
    isCloudActive = true;
  }

  // User display name or email initials
  const userInitials = user?.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'ইউ';

  return (
    <header className={`${styles.navbar} ${onSearchChange !== undefined ? styles.hasSearch : ''}`}>
      <div className="container">
        <div className={styles.inner}>
          {/* Left Brand */}
          <Link href="/" className={styles.brand} title="হোমপেজে যান">
            <div className={styles.logoIcon}>
              <BookOpen size={20} strokeWidth={2.2} />
            </div>
            <div className={styles.titleGroup}>
              <div className={styles.titleRow}>
                <span className={styles.brandTitle}>{t.appTitle}</span>
                <span className={styles.versionBadge}>v2.0</span>
              </div>
              <span className={styles.brandSubtitle}>{t.appSubtitle}</span>
            </div>
          </Link>

          {/* Right Controls */}
          <div className={styles.rightGroup}>
            {/* Status Indicator Pill */}
            <div 
              className={`${styles.dbBadge} ${isCloudActive ? styles.dbBadgeCloud : styles.dbBadgeLocal}`}
              title={dbBadgeTooltip}
            >
              <span className={`${styles.dbDot} ${isCloudActive ? styles.dotCloud : styles.dotLocal}`}></span>
              <ShieldCheck size={13} className={styles.badgeShield} />
              <span className={styles.dbBadgeLabel}>{dbBadgeText}</span>
            </div>

            {/* Desktop Search Input */}
            {onSearchChange !== undefined && (
              <div className={`${styles.searchBox} ${styles.desktopSearch}`}>
                <Search size={15} className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                <span className={styles.searchShortcut} title="খুঁজুন">⌘K</span>
              </div>
            )}

            {/* Export Backup JSON Button */}
            <button
              onClick={exportFullBackupJSON}
              className={`${styles.navBtn} ${styles.backupBtn}`}
              title="ডাটাবেজ ব্যাকআপ ফাইল ডাউনলোড করুন (JSON Backup)"
            >
              <Download size={15} />
              <span className={styles.btnLabel}>ব্যাকআপ</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              className={`${styles.navBtn} ${styles.langBtn}`}
              title="Switch Language / ভাষা পরিবর্তন"
            >
              <Globe size={15} />
              <span className={styles.langText}>{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Add Member CTA */}
            {onOpenAddMemberModal && (
              <button
                onClick={onOpenAddMemberModal}
                className={styles.addMemberBtn}
                title="নতুন সদস্য নিবন্ধন করুন"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>{t.addMember}</span>
              </button>
            )}

            {/* User Profile & Logout */}
            <div className={styles.userSection}>
              {user && (
                <div 
                  className={styles.userAvatar} 
                  title={user.email || user.displayName || 'অ্যাডমিন'}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className={styles.avatarImg} />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>
              )}
              <button
                onClick={requestLogoutConfirmation}
                className={styles.logoutBtn}
                title="লগআউট করুন"
              >
                <LogOut size={15} />
                <span className={styles.logoutLabel}>লগআউট</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Row (Row 2 on mobile view when search is enabled) */}
        {onSearchChange !== undefined && (
          <div className={styles.mobileSearchRow}>
            <div className={styles.searchBoxMobile}>
              <Search size={16} className={styles.searchIconMobile} />
              <input
                type="text"
                className={styles.searchInputMobile}
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
