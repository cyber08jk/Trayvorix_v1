import { useState } from 'react';
import { supabase } from '@services/supabase';
import { Button } from '@components/common/Button';
import { Card } from '@components/common/Card';

export function TestConnection() {
  const [status, setStatus] = useState<string>('Not tested');
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    
    try {
      // Test 1: Check if Supabase client is configured
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        setStatus('❌ Environment variables not configured');
        setDetails({ url, keyLength: key?.length });
        setLoading(false);
        return;
      }

      // Test 2: Try to query a table
      const { data, error } = await supabase
        .from('products')
        .select('count')
        .limit(1);

      if (error) {
        setStatus('❌ Database Error');
        setDetails({
          error: error.message,
          hint: error.hint,
          details: error.details,
          suggestion: 'Have you run the database migrations?'
        });
      } else {
        setStatus('✅ Connection Successful!');
        setDetails({
          message: 'Database is accessible',
          tablesWork: true,
          data
        });
      }
    } catch (err: any) {
      setStatus('❌ Connection Failed');
      setDetails({
        error: err.message,
        type: err.name
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card title="Supabase Connection Test" subtitle="Diagnose connection issues">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Click the button below to test your Supabase connection and database setup.
              </p>
              <Button 
                onClick={testConnection} 
                isLoading={loading}
                variant="primary"
              >
                Test Connection
              </Button>
            </div>

            {status !== 'Not tested' && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                  Status: {status}
                </h3>
                {details && (
                  <pre className="text-xs overflow-auto p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                    {JSON.stringify(details, null, 2)}
                  </pre>
                )}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Environment Variables:
              </h4>
              <div className="text-sm space-y-1 text-blue-800 dark:text-blue-400">
                <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL || '❌ Not set'}</p>
                <p><strong>Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                Common Issues:
              </h4>
              <ul className="text-sm space-y-2 text-yellow-800 dark:text-yellow-400 list-disc list-inside">
                <li><strong>"relation does not exist"</strong> → Run database migrations in Supabase SQL Editor</li>
                <li><strong>"Failed to fetch"</strong> → Check if Supabase project is active (not paused)</li>
                <li><strong>"Invalid JWT"</strong> → Wrong anon key in .env.local</li>
                <li><strong>"permission denied"</strong> → RLS policies not applied (run migration 4)</li>
              </ul>
            </div>

            <div className="mt-6">
              <a 
                href="/login" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                ← Back to Login
              </a>
            </div>
          </div>
        </Card>

        <Card title="Setup Instructions">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ol className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>Open <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">SUPABASE_SETUP.md</code> in your project</li>
              <li>Follow the step-by-step instructions to run migrations</li>
              <li>Create your first user in Supabase Authentication</li>
              <li>Restart the dev server</li>
              <li>Try logging in again</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
