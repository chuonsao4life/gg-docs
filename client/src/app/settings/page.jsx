'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, FileText, Save, Shield, User, Sparkles } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ChatPanel } from '@/components/chat-panel';
import { FeaturesSection } from '@/components/features-section';
import {
  changeCurrentUserPassword,
  getCurrentUser,
  readStoredSession,
  updateCurrentUser,
} from '@/services/auth.service';

const TABS = [
  { id: 'profile', label: 'Hồ sơ', icon: User },
  { id: 'features', label: 'Tính năng', icon: Sparkles },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    avatar: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const session = readStoredSession();
    if (!session?.token) {
      router.push('/login');
      return;
    }

    let active = true;
    getCurrentUser()
      .then((user) => {
        if (!active) return;
        setProfile({
          firstname: user.firstname || '',
          lastname: user.lastname || '',
          username: user.username || '',
          email: user.email || '',
          avatar: user.avatar || '',
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Không thể tải thông tin tài khoản.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleProfileChange = (event) => {
    setProfile((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handlePasswordChange = (event) => {
    setPasswords((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setNotice('');
    setError('');
    setSavingProfile(true);

    try {
      const user = await updateCurrentUser({
        firstname: profile.firstname,
        lastname: profile.lastname,
        username: profile.username,
        avatar: profile.avatar,
      });
      setProfile((prev) => ({ ...prev, ...user, avatar: user.avatar || '' }));
      setNotice('Đã cập nhật thông tin tài khoản.');
    } catch (err) {
      setError(err.message || 'Không thể cập nhật tài khoản.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setNotice('');
    setError('');
    setSavingPassword(true);

    try {
      await changeCurrentUserPassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setNotice('Đã đổi mật khẩu.');
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu.');
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = `${profile.firstname?.[0] || ''}${profile.lastname?.[0] || ''}`.toUpperCase()
    || profile.username?.slice(0, 2).toUpperCase()
    || 'U';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cài đặt tài khoản</h1>
              <p className="text-sm text-muted-foreground">Quản lý tên, avatar và mật khẩu của bạn.</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <FileText className="h-4 w-4" />
              Dashboard tài liệu
            </Link>
          </div>

          {/* Tab navigation */}
          <div className="mb-6 flex gap-1 rounded-lg border bg-secondary/40 p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab: Hồ sơ */}
          {activeTab === 'profile' && (
            <>
              {notice && <div className="mb-4 rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">{notice}</div>}
              {error && <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

              {loading ? (
                <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">Đang tải tài khoản...</div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <form onSubmit={saveProfile} className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-4">
                      <div
                        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary bg-cover bg-center text-xl font-semibold text-primary-foreground"
                        style={profile.avatar ? { backgroundImage: `url(${profile.avatar})` } : undefined}
                        aria-label="Avatar"
                      >
                        {!profile.avatar && initials}
                      </div>
                      <div>
                        <h2 className="font-semibold text-card-foreground">Hồ sơ người dùng</h2>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Tên" name="firstname" value={profile.firstname} onChange={handleProfileChange} required />
                      <Field label="Họ" name="lastname" value={profile.lastname} onChange={handleProfileChange} required />
                    </div>
                    <Field label="Username" name="username" value={profile.username} onChange={handleProfileChange} required />
                    <Field label="Avatar URL" name="avatar" value={profile.avatar} onChange={handleProfileChange} icon={<Camera className="h-4 w-4" />} />

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {savingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                  </form>

                  <form onSubmit={savePassword} className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-foreground">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-card-foreground">Đổi mật khẩu</h2>
                        <p className="text-sm text-muted-foreground">Mật khẩu mới tối thiểu 6 ký tự.</p>
                      </div>
                    </div>

                    <Field label="Mật khẩu hiện tại" name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} required />
                    <Field label="Mật khẩu mới" name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} minLength={6} required />

                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      <Shield className="h-4 w-4" />
                      {savingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          {/* Tab: Tính năng */}
          {activeTab === 'features' && (
            <FeaturesSection />
          )}
        </div>
      </main>
      <Footer />
      <ChatPanel />
    </div>
  );
}

function Field({ label, icon, ...props }) {
  return (
    <label className="mt-4 block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      <span className="flex h-10 items-center gap-2 rounded-md border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {icon}
        <input {...props} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </span>
    </label>
  );
}
