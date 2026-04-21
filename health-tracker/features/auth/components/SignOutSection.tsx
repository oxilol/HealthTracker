"use client";

import { useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useRouter } from 'next/navigation';

/**
 * Sing out component
 * Uses modal to confirm.
 */
export function SignOutSection() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <>
      <div className="mt-8 mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 backdrop-blur-md transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Sign Out
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-[320px] shadow-2xl animate-scale-up text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-2">Sign Out</h3>
            <p className="text-sm text-neutral-400 mb-6">Are you sure you want to sign out of your account?</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSignOut}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
