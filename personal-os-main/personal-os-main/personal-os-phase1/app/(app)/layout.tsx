import type { ReactNode } from 'react';
import Link from 'next/link';
import { signOut } from './actions';

export default function AppLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 32,
          paddingBottom: 12,
          borderBottom: '1px solid #d7dadd'
        }}
      >
        <Link href="/debug/new">PERSONAL OS</Link>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <Link href="/debug/new">Debug</Link>
          <Link href="/history">History</Link>
          <Link href="/system/components">System</Link>
          <Link href="/experiments">Experiments</Link>
          <Link href="/reviews">Weekly Reviews</Link>
          <Link href="/releases">Releases</Link>
          <a href="/export">Export</a>
          <Link href="/diagnostics">Diagnostics</Link>

          <form action={signOut} style={{ margin: 0 }}>
            <button type="submit">Sign out</button>
          </form>
        </nav>
      </header>

      {children}
    </>
  );
}
