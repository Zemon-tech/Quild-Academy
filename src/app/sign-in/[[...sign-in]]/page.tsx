import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        routing="hash"
        afterSignInUrl="/api/users/ensure?redirect=/dashboard"
        afterSignUpUrl="/api/users/ensure?redirect=/dashboard"
      />
      <p className="sr-only">
        <Link href="/api/users/ensure?redirect=/dashboard">Continue</Link>
      </p>
    </div>
  );
}
