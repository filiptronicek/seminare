'use client';

import { useAuth } from 'src/components/AuthProvider';
import SignIn from './SignIn';

const Auth = ({ view: initialView }) => {
  let { view } = useAuth();

  if (initialView) {
    view = initialView;
  }

  return <SignIn />;
};

export default Auth;
