import Link from 'next/link';

export default function DebugSessionNotFound() {
  return (
    <main>
      <p>PERSONAL OS</p>
      <h1>Record unavailable</h1>
      <p>
        This record does not exist or is not available in this Personal OS.
      </p>
      <p>
        <Link href="/debug/new">Return to Personal OS</Link>
      </p>
    </main>
  );
}
