import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Your daily health overview' },
  '/habits': { title: 'Habit Tracker', subtitle: 'Log your daily habits' },
  '/recommendations': {
    title: 'AI Recommendation',
    subtitle: 'Personalized plan for today',
  },
  '/progress': { title: 'My Progress', subtitle: 'Track your health journey' },
  '/profile': { title: 'My Profile', subtitle: 'Account & settings' },
};

export const TopBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useApp();

  const match = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || (k !== '/' && pathname.startsWith(k)));
  const { title, subtitle } = PAGE_TITLES[match] || PAGE_TITLES['/'];

  const initials = userProfile?.fullName
    ? userProfile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header
      style={{
        height: 60,
        background: '#FFFFFF',
        borderBottom: '1px solid #F0F0F0',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left — page title */}
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1A1A1A',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
          {subtitle} — {today}
        </div>
      </div>

      {/* Right — search + notif + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: '#F9FAFB',
            border: '1px solid #F0F0F0',
            borderRadius: 8,
            cursor: 'text',
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Search…</span>
        </div>

        {/* Notification bell */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: '1px solid #F0F0F0',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7280"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {/* Unread dot */}
          <div
            style={{
              width: 7,
              height: 7,
              background: '#F97316',
              borderRadius: '50%',
              position: 'absolute',
              top: 7,
              right: 8,
              border: '1.5px solid #fff',
            }}
          />
        </div>

        {/* Avatar */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#F97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
};
