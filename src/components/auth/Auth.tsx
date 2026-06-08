import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/profile`,
        });
        if (error) throw error;
        alert('Check your email for the password reset link!');
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-10 sm:p-12 bg-card rounded-2xl border border-border text-foreground shadow-2xl animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center overflow-hidden bg-card border border-border shadow-xl">
            {loading ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : (
              <img
                src="/logo.png"
                alt="Project Riko"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tight mb-2 italic">PROJECT RIKO</h2>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em]">
            {isForgotPassword ? 'Reset Password' : 'Gamified Fitness & Rewards'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-background transition-all font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
              required
            />
          </div>
          
          {!isForgotPassword && (
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-background transition-all font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest mt-4 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isForgotPassword ? (
              'Send Reset Link'
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          {!isForgotPassword && !isSignUp && (
            <button
              onClick={() => setIsForgotPassword(true)}
              className="text-[10px] text-muted-foreground font-black uppercase tracking-widest hover:text-primary transition-colors block mx-auto"
            >
              Forgot Password?
            </button>
          )}

          {isForgotPassword ? (
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-xs text-muted-foreground font-black uppercase tracking-widest hover:text-primary transition-colors"
            >
              Back to Sign In
            </button>
          ) : (
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted-foreground font-black uppercase tracking-widest hover:text-primary transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
