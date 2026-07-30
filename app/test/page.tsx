'use client';

import { useUser } from '@clerk/nextjs';

export default function TestPage() {
  const user = useUser();

  console.log('CURRENT USER:', user);

  return <div>{user ? `Hello ${user.user}` : 'Not signed in'}</div>;
}
