'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Wallet, 
  Plus, 
  ArrowRight, 
  Phone, 
  Search,
  CheckCircle2,
  User,
  ShieldCheck,
  FileText,
  Trash2
} from 'lucide-react';
import styles from './page.module.css';
import { Navbar } from '@/components/Navbar';
import { MemberFormModal } from '@/components/MemberFormModal';
import { SuccessModal } from '@/components/SuccessModal';
import { DeleteMemberModal } from '@/components/DeleteMemberModal';
import { DeleteSuccessModal } from '@/components/DeleteSuccessModal';
import { Member } from '@/lib/types';
import { getMembers, createMember, deleteMember, getCalculatedLedger, getDashboardStats } from '@/lib/db';
import { Language, translations } from '@/lib/i18n';

export default function DashboardPage() {
  const [lang, setLang] = useState<Language>('bn');
  const t = translations[lang];

  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createdSuccessMember, setCreatedSuccessMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [deletedSuccessInfo, setDeletedSuccessInfo] = useState<{ name: string; memberNo?: string } | null>(null);

  const [stats, setStats] = useState({
    totalGranted: 0,
    totalCollected: 0,
    totalRemaining: 0,
    totalSavings: 0,
    activeCount: 0
  });

  const [memberSummaries, setMemberSummaries] = useState<{
    [id: string]: { remaining: number; savings: number };
  }>({});

  const loadData = async () => {
    const list = await getMembers();
    setMembers(list);

    const dbStats = await getDashboardStats();
    setStats(dbStats);

    const summariesMap: { [id: string]: { remaining: number; savings: number } } = {};
    for (const m of list) {
      const { summary } = await getCalculatedLedger(m);
      summariesMap[m.id] = {
        remaining: summary.remaining_loan,
        savings: summary.total_savings
      };
    }
    setMemberSummaries(summariesMap);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMember = async (data: Omit<Member, 'id' | 'created_at'>) => {
    const newM = await createMember(data);
    await loadData();
    setCreatedSuccessMember(newM);
  };

  const handleConfirmDeleteDashboardMember = async (id: string) => {
    const targetMember = members.find((m) => m.id === id);
    const name = targetMember?.name || '';
    const memberNo = targetMember?.member_no || '';
    await deleteMember(id);
    await loadData();
    setDeletingMember(null);
    setDeletedSuccessInfo({ name, memberNo });
  };

  // Filter members by member_no, name, mobile, nid_number, relative name, or guarantor details
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.member_no.toLowerCase().includes(q) ||
      m.mobile.toLowerCase().includes(q) ||
      (m.nid_number && m.nid_number.toLowerCase().includes(q)) ||
      (m.father_mother_spouse && m.father_mother_spouse.toLowerCase().includes(q)) ||
      (m.guarantor_name && m.guarantor_name.toLowerCase().includes(q)) ||
      (m.guarantor_father_mother_spouse && m.guarantor_father_mother_spouse.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <Navbar
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'bn' ? 'en' : 'bn'))}
        onOpenAddMemberModal={() => setIsAddModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="main-content hasSearch">
        <div className="container">
          {/* Hero Header */}
          <div className={styles.dashboardHeader}>
            <div className={styles.heroTextGroup}>
              <div className={styles.heroBadgeRow}>
                <span className={styles.liveIndicator}>
                  <span className={styles.livePulse}></span>
                  সিস্টেম সক্রিয়
                </span>
                <span className={styles.dateBadge}>
                  {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <h1 className={styles.heroTitle}>{t.dashboard}</h1>
              <p className={styles.heroSub}>{t.appSubtitle}</p>
            </div>

            <div className={styles.heroActions}>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary"
                title="নতুন সদস্য নিবন্ধন করুন"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>{t.addMember}</span>
              </button>
            </div>
          </div>

          {/* Top 5 Metrics Overview */}
          <div className={styles.statsGrid}>
            {/* Active Members */}
            <div className={`${styles.statCard} ${styles.statCardBlue}`}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{t.activeMembers}</span>
                <div className={`${styles.statIconBox} ${styles.iconBoxBlue}`}>
                  <Users size={18} />
                </div>
              </div>
              <div className={styles.statVal}>{stats.activeCount} <span className={styles.statUnit}>জন</span></div>
              <div className={styles.statFootnote}>নিবন্ধিত সক্রিয় সদস্য</div>
              <div className={`${styles.statAccentLine} ${styles.accentBlue}`}></div>
            </div>

            {/* Total Granted Loan */}
            <div className={`${styles.statCard} ${styles.statCardAmber}`}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{t.totalGrantedLoan}</span>
                <div className={`${styles.statIconBox} ${styles.iconBoxAmber}`}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div className={styles.statVal}>
                <span className={styles.currencySymbol}>৳</span>{stats.totalGranted.toLocaleString()}
              </div>
              <div className={styles.statFootnote}>বিতরণকৃত মোট ঋণ</div>
              <div className={`${styles.statAccentLine} ${styles.accentAmber}`}></div>
            </div>

            {/* Total Collected */}
            <div className={`${styles.statCard} ${styles.statCardGreen}`}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{t.totalCollectedLoan}</span>
                <div className={`${styles.statIconBox} ${styles.iconBoxGreen}`}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className={`${styles.statVal} ${styles.textEmerald}`}>
                <span className={styles.currencySymbol}>৳</span>{stats.totalCollected.toLocaleString()}
              </div>
              <div className={styles.statFootnote}>পরিশোধিত মোট কিস্তি</div>
              <div className={`${styles.statAccentLine} ${styles.accentGreen}`}></div>
            </div>

            {/* Remaining Loan */}
            <div className={`${styles.statCard} ${styles.statCardRose}`}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{t.remainingLoanBalance}</span>
                <div className={`${styles.statIconBox} ${styles.iconBoxRose}`}>
                  <Wallet size={18} />
                </div>
              </div>
              <div className={`${styles.statVal} ${styles.textRose}`}>
                <span className={styles.currencySymbol}>৳</span>{stats.totalRemaining.toLocaleString()}
              </div>
              <div className={styles.statFootnote}>বাকি দেনার পরিমাণ</div>
              <div className={`${styles.statAccentLine} ${styles.accentRose}`}></div>
            </div>

            {/* Total Savings */}
            <div className={`${styles.statCard} ${styles.statCardPurple}`}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{t.totalSavingsBalance}</span>
                <div className={`${styles.statIconBox} ${styles.iconBoxPurple}`}>
                  <BookOpen size={18} />
                </div>
              </div>
              <div className={`${styles.statVal} ${styles.textPurple}`}>
                <span className={styles.currencySymbol}>৳</span>{stats.totalSavings.toLocaleString()}
              </div>
              <div className={styles.statFootnote}>মোট রক্ষিত সঞ্চয় ফান্ড</div>
              <div className={`${styles.statAccentLine} ${styles.accentPurple}`}></div>
            </div>
          </div>

          {/* Member Grid Title */}
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle}>
                <Users size={22} className={styles.sectionTitleIcon} />
                <span>{t.memberList}</span>
              </h2>
              <span className={styles.memberCountPill}>
                {filteredMembers.length} {t.activeMembers}
              </span>
            </div>

            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={styles.clearSearchBtn}
              >
                ফিল্টার মুছুন
              </button>
            )}
          </div>

          {/* Member Cards Grid */}
          {filteredMembers.length > 0 ? (
            <div className={styles.membersGrid}>
              {filteredMembers.map((m) => {
                const summary = memberSummaries[m.id] || { remaining: m.loan_amount, savings: m.savings_initial };
                const loanTotal = m.loan_amount || 0;
                const repaid = Math.max(0, loanTotal - summary.remaining);
                const progressPct = loanTotal > 0 ? Math.min(100, Math.round((repaid / loanTotal) * 100)) : 100;
                const initialChar = m.name ? m.name.trim().charAt(0) : 'স';

                return (
                  <div key={m.id} className={styles.memberCard}>
                    <div className={styles.memberTop}>
                      {/* Avatar Photo (or Initial Fallback) */}
                      <div className={styles.cardAvatar}>
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.name} className={styles.cardAvatarImg} />
                        ) : (
                          <div className={styles.avatarFallback}>
                            <span>{initialChar}</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.memberMeta}>
                        <div className={styles.badgeRow}>
                          <span className={styles.memberNoPill}>#{m.member_no}</span>
                          <span className={styles.bookBadgePill}>{t.bookNo}: {m.book_no || '১'}</span>
                        </div>
                        <h3 className={styles.memberName}>{m.name}</h3>

                        {m.guarantor_name && (
                          <div className={styles.metaRow}>
                            <ShieldCheck size={13} className={styles.metaIconPrimary} />
                            <span>জামিনদার: {m.guarantor_name}</span>
                          </div>
                        )}

                        {m.nid_number && (
                          <div className={styles.metaRow}>
                            <FileText size={12} className={styles.metaIconMuted} />
                            <span>NID: {m.nid_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Loan Repayment */}
                    {loanTotal > 0 && (
                      <div className={styles.progressContainer}>
                        <div className={styles.progressHeader}>
                          <span className={styles.progressLabel}>ঋণ পরিশোধ অগ্রগতি</span>
                          <span className={styles.progressVal}>{progressPct}%</span>
                        </div>
                        <div className={styles.progressBarTrack}>
                          <div 
                            className={styles.progressBarFill} 
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className={styles.financialRow}>
                      <div className={`${styles.finBox} ${styles.finBoxRose}`}>
                        <span className={styles.finLabel}>{t.remainingLoanBalance}</span>
                        <span className={`${styles.finVal} ${styles.textRose}`}>
                          ৳ {summary.remaining.toLocaleString()}
                        </span>
                      </div>
                      <div className={`${styles.finBox} ${styles.finBoxEmerald}`}>
                        <span className={styles.finLabel}>{t.totalSavings}</span>
                        <span className={`${styles.finVal} ${styles.textEmerald}`}>
                          ৳ {summary.savings.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <a 
                        href={m.mobile ? `tel:${m.mobile}` : undefined} 
                        className={styles.mobileLink}
                        title="সদস্যকে কল করুন"
                      >
                        <Phone size={13} />
                        <span>{m.mobile || '-'}</span>
                      </a>

                      <div className={styles.cardBtnGroup}>
                        <button
                          onClick={() => setDeletingMember(m)}
                          className={styles.deleteMemberBtn}
                          title="সদস্য স্থায়ীভাবে মুছে ফেলুন"
                        >
                          <Trash2 size={14} />
                        </button>
                        <Link href={`/members/${m.id}`} className={styles.viewPassbookBtn}>
                          <span>পাসবই</span>
                          <ArrowRight size={14} className={styles.arrowIcon} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconBox}>
                <Search size={32} />
              </div>
              <h3 className={styles.emptyTitle}>কোনো সদস্য পাওয়া যায়নি</h3>
              <p className={styles.emptySubtitle}>
                {searchQuery 
                  ? `"${searchQuery}" এর সাথে মিলে এমন কোনো সদস্য পাওয়া যায়নি।`
                  : 'এখনও কোনো সদস্য যোগ করা হয়নি। প্রথম সদস্য যোগ করতে নিচের বাটনে চাপুন।'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-secondary btn-sm"
                >
                  ফিল্টার মুছুন
                </button>
              ) : (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>{t.addMember}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Member Creation Modal */}
      <MemberFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateMember}
        lang={lang}
      />

      {/* New Member Creation Success Confirmation Modal */}
      <SuccessModal
        isOpen={createdSuccessMember !== null}
        member={createdSuccessMember}
        onClose={() => setCreatedSuccessMember(null)}
        lang={lang}
      />

      {/* 2-Step Verification Delete Member Modal */}
      <DeleteMemberModal
        isOpen={deletingMember !== null}
        member={deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirmDelete={handleConfirmDeleteDashboardMember}
        lang={lang}
      />

      {/* Member Delete Success Confirmation Modal */}
      <DeleteSuccessModal
        isOpen={deletedSuccessInfo !== null}
        memberName={deletedSuccessInfo?.name || ''}
        memberNo={deletedSuccessInfo?.memberNo}
        onClose={() => setDeletedSuccessInfo(null)}
        lang={lang}
      />
    </>
  );
}
