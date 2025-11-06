'use client';

import { useState } from 'react';

export default function DebugSignInPage() {
  const [email, setEmail] = useState('cc@gmail.com');
  const [digitalCode, setDigitalCode] = useState('123456');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testSignin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing signin with:', { email, digitalCode });
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          digitalCode: digitalCode,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}\nResponse: ${responseText}`);
      }

      try {
        const jsonResult = JSON.parse(responseText);
        setResult(jsonResult);
        console.log('Parsed JSON result:', jsonResult);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error(`JSON Parse Error: ${jsonError.message}\nResponse: ${responseText}`);
      }

    } catch (err: any) {
      console.error('Signin test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Debug Sign In</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Digital Code:</label>
          <input
            type="text"
            value={digitalCode}
            onChange={(e) => setDigitalCode(e.target.value)}
            className="w-full p-2 border rounded"
            maxLength={6}
          />
        </div>
        
        <button
          onClick={testSignin}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Sign In'}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">Success:</h3>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
