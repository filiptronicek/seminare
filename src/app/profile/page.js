import Link from 'next/link';
import { redirect } from 'next/navigation';

import SignOut from 'src/components/SignOut';
import createClient from 'src/lib/supabase-server';

export default async function Profile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="card">
      <h2>{user.user_metadata.full_name}</h2>
      <img src={user.user_metadata.picture} />
      <code className="highlight">{user.email}</code>
      <Link className="button" href="/">
        Go Home
      </Link>
      <SignOut />
    </div>
  );
}
