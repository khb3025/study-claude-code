"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface GoogleLoginButtonProps {
  onError: (message: string | null) => void;
}

export function GoogleLoginButton({ onError }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setIsLoading(true);
    onError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      onError(error.message);
      setIsLoading(false);
    }
    // 성공 시 브라우저가 구글로 리다이렉트되므로 isLoading 해제 불필요
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.56-5.17 3.56-8.84z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.96-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.96H1.24v3.12C3.23 21.3 7.3 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.25 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.61H1.24A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.24 5.39l4.01-3.12z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.3 0 3.23 2.7 1.24 6.61l4.01 3.12c.95-2.84 3.61-4.98 6.75-4.98z"
        />
      </svg>
      Continue with Google
    </Button>
  );
}
