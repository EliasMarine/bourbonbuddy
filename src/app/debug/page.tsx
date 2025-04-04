'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { signOut } from 'next-auth/react';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});
  const [supabaseTest, setSupabaseTest] = useState<string>('Testing Supabase...');
  const [cookieCleared, setCookieCleared] = useState(false);

  useEffect(() => {
    // Collect environment variables
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    });

    // Test Supabase connection
    async function testSupabase() {
      try {
        console.log('Testing Supabase connection...');
        const supabase = createSupabaseBrowserClient();
        console.log('Supabase client created');
        
        const { data, error } = await supabase.auth.getSession();
        console.log('Got session response:', { data, error });
        
        if (error) {
          setSupabaseTest(`Supabase error: ${error.message}`);
        } else {
          setSupabaseTest(`Supabase connection successful! ${data.session ? 'Session exists' : 'No session'}`);
        }
      } catch (error) {
        console.error('Error testing Supabase:', error);
        setSupabaseTest(`Supabase test failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    testSupabase();
  }, []);

  const clearCookies = () => {
    // Clear NextAuth cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Also sign out from NextAuth
    signOut({ redirect: false }).then(() => {
      setCookieCleared(true);
      // Also clear local storage
      localStorage.clear();
      sessionStorage.clear();
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <pre className="bg-gray-800 p-4 rounded overflow-auto max-w-full">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Supabase Test</h2>
        <div className="bg-gray-800 p-4 rounded">
          {supabaseTest}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Auth Debug Tools</h2>
        <button 
          onClick={clearCookies}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          {cookieCleared ? 'Cookies Cleared!' : 'Clear Auth Cookies & Session'}
        </button>
        {cookieCleared && (
          <p className="mt-2 text-green-400">
            Cookies cleared successfully. Please try logging in again.
          </p>
        )}
      </div>

      <div className="mt-8">
        <p className="text-lg">
          Please check your browser console for more detailed debugging information.
        </p>
      </div>
    </div>
  );
} 