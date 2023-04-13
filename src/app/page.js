'use client';

import Link from 'next/link';

import Auth from 'src/components/Auth';
import { useAuth, VIEWS } from 'src/components/AuthProvider';
import SeminarsList from 'src/components/views/Seminars';

export default function Home() {
  const { initial, user, view, signOut } = useAuth();

  if (initial) {
    return <div className="card h-72">Loading...</div>;
  }

  if (view === VIEWS.UPDATE_PASSWORD) {
    return <Auth view={view} />;
  }

  if (user) {
    return (
      <div className="card">
        <h2>Vítej u seminářů!</h2>
        <code className="highlight">{user.role}</code>
        <Link className="button" href="/profile">
          Můj profil
        </Link>
        <SeminarsList />
        <button type="button" className="button-inverse" onClick={signOut}>
          Odhlásit se
        </button>
      </div>
    );
  }

  return <Auth view={view} />;
}
