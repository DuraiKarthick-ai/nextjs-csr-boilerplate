// src/app/auth/callback/page.tsx
import dynamic from 'next/dynamic';

// Dynamically import the client-side callback handler to avoid using client hooks during prerender
const CallbackClient = dynamic(() => import('./CallbackClient'), { ssr: false });

export default function CallbackPage() {
  return <CallbackClient />;
}
