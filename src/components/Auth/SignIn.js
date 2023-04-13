'use client';

import { useState } from 'react';
import * as Yup from 'yup';
import { Auth } from '@supabase/auth-ui-react'

import { useAuth, VIEWS } from 'src/components/AuthProvider';
import supabase from 'src/lib/supabase-browser';


const SignIn = () => {
  const { setView } = useAuth();
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
      <h2 className="w-full text-center">Sign In</h2>
      <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      {errorMsg && <div className="text-red-600">{errorMsg}</div>}
      <button
        className="link w-full"
        type="button"
        onClick={() => setView(VIEWS.SIGN_UP)}
      >
        Don&apos;t have an account? Sign Up.
      </button>
    </div>
  );
};

export default SignIn;
