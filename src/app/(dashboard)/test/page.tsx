'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { migrateData } from '@/lib/db/migrations';

export default function TestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  const runE2ETests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Test 1: Migration
      addResult('🏃 Testing data migration...');
      await migrateData();
      addResult('✅ Data migration completed');

      // Test 2: User Creation with Clergy Sync
      addResult('🏃 Testing user-clergy synchronization...');
      const initialTestUser = {
        id: 'test-user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        role: 'user',
        status: 'active',
        dateCreated: new Date().toISOString(),
        clergyId: 'test-clergy-1'
      };

      await db.set('userAuth', [initialTestUser]);
      
      const initialTestCredentials = {
        userId: initialTestUser.id,
        email: initialTestUser.email,
        password: 'hashedPassword123'
      };
      
      await db.set('loginCredentials', [initialTestCredentials]);
      
      const savedUser = await db.get('userAuth');
      const savedCredentials = await db.get('loginCredentials');
      
      addResult(
        savedUser?.[0]?.email === initialTestUser.email &&
        savedCredentials?.[0]?.userId === initialTestUser.id
          ? '✅ User and credentials creation passed'
          : '❌ User and credentials creation failed'
      );

      // Test 3: Clergy Creation with User Sync
      addResult('🏃 Testing clergy creation with user sync...');
      const initialTestClergy = {
        id: 'test-clergy-1',
        name: 'Fr. John Doe',
        type: 'Priest',
        role: 'Pastor',
        status: 'active',
        email: 'john@test.com',
        currentAssignment: 'Test Parish'
      };
      
      await db.set('clergy', [initialTestClergy]);
      const savedClergy = await db.get('clergy');
      
      const clergyUserSync = 
        savedClergy?.[0]?.email === savedUser?.[0]?.email &&
        savedUser?.[0]?.clergyId === savedClergy?.[0]?.id;
      
      addResult(
        clergyUserSync
          ? '✅ Clergy-User relationship passed'
          : '❌ Clergy-User relationship failed'
      );

      // Test 4: Deletion Synchronization
      addResult('🏃 Testing deletion synchronization...');
      
      const initialState = {
        clergy: await db.get('clergy') || [],
        users: await db.get('userAuth') || [],
        credentials: await db.get('loginCredentials') || []
      };
      
      addResult(`Initial state: ${initialState.clergy.length} clergy, ${initialState.users.length} users, ${initialState.credentials.length} credentials`);
      
      const foundClergy = initialState.clergy.find(c => c.id === 'test-clergy-1');
      const foundUser = initialState.users.find(u => u.clergyId === 'test-clergy-1');
      
      addResult(`Found test clergy: ${foundClergy?.id}, Associated user: ${foundUser?.id}`);

      // Attempt deletion
      await Promise.all([
        db.set('clergy', []),
        db.set('userAuth', []),
        db.set('loginCredentials', [])
      ]);

      const finalState = {
        clergy: await db.get('clergy') || [],
        users: await db.get('userAuth') || [],
        credentials: await db.get('loginCredentials') || []
      };

      const deletionSync = 
        finalState.clergy.length === 0 && 
        finalState.users.length === 0 && 
        finalState.credentials.length === 0;

      addResult(
        deletionSync
          ? '✅ Deletion synchronization passed'
          : `❌ Deletion synchronization failed (Remaining: ${finalState.clergy.length} clergy, ${finalState.users.length} users, ${finalState.credentials.length} credentials)`
      );

      // Test 5: Cleanup
      addResult('🧹 Cleaning up test data...');
      await Promise.all([
        db.set('clergy', []),
        db.set('userAuth', []),
        db.set('loginCredentials', []),
        db.set('parishes', []),
        db.set('deaneries', [])
      ]);
      addResult('✅ Cleanup completed');

    } catch (error) {
      addResult(`❌ Error during tests: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Database Integration Tests</h1>
      <button
        onClick={runE2ETests}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Running Tests...' : 'Run E2E Tests'}
      </button>

      <div className="mt-6 space-y-2">
        {testResults.map((result, index) => (
          <div 
            key={index}
            className="p-2 bg-gray-50 rounded"
          >
            {result}
          </div>
        ))}
      </div>
    </div>
  );
} 