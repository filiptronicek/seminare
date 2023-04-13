'use client';

import { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react'
import supabase from 'src/lib/supabase-browser';


const SignIn = () => {
  const [errorMsg, setErrorMsg] = useState(null);

  return (
    <div className="card">
      <h2 className="w-full text-center">Přihlášení</h2>
      <Auth
        supabaseClient={supabase}
        providers={['google']}
        onlyThirdPartyProviders={true}
        socialLayout="horizontal"
        socialButtonSize="xlarge"
      />
      {errorMsg && <div className="text-red-600">{errorMsg}</div>}
    </div>
  );
};

export default SignIn;
