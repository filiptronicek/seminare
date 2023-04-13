'use client';

import { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react'

import { useAuth } from 'src/components/AuthProvider';
import supabase from 'src/lib/supabase-browser';


const SignIn = () => {
  const [errorMsg, setErrorMsg] = useState(null);

  async function signIn(formData) {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMsg(error.message);
    }
  }

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
