'use client';

import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react'
import {useSearchParams} from 'next/navigation';
import supabase from 'src/lib/supabase-browser';


const SignIn = () => {
  const [errorMsg, setErrorMsg] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.has("error")) {
      const errorMessage = searchParams.get("error_description");
      switch (errorMessage) {
        case "Error creating identity":
          setErrorMsg("Pro přihlášení musíte použít školní e-mail")
          break;
        default:
          setErrorMsg(errorMessage);
      }

    }
  }, [searchParams]);

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
