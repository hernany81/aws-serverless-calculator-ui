import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDependencies from "../../components/hooks/useDependencies";
import { useAuthStore } from "../../components/hooks/useAuthStore";
import { SignIn } from "../../components/login/SignIn";

export function LoginPage() {
  const { authClient } = useDependencies();
  const { authToken, setCredentials } = useAuthStore((state) => ({
    authToken: state.authToken,
    setCredentials: state.setCredentials,
  }));
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const handleSignIn = async (username: string, password: string): Promise<boolean> => {
    setErrorMsg("");
    try {
      const resp = await authClient.signIn(username, password);
      setCredentials(username, resp.token);
      return true;
    } catch (err) {
      setErrorMsg("Cannot authenticate user");
    }
    return false;
  };

  useEffect(() => {
    if (authToken) {
      // User already signed in
      navigate("/");
    }
  }, []);

  return (
    <div>
      <SignIn onSubmit={handleSignIn} errorMsg={errorMsg} />
    </div>
  );
}
