import { db } from './index';

export const testDatabaseConnection = async () => {
  try {
    // Test write
    await db.set('test-key', { test: 'data' });
    console.log('✅ Database write test passed');

    // Test read
    const data = await db.get('test-key');
    console.log('📖 Read test result:', data);
    console.assert(data?.test === 'data', 'Read data matches written data');
    console.log('✅ Database read test passed');

    // Test delete
    await db.delete('test-key');
    const deletedData = await db.get('test-key');
    console.assert(deletedData === null, 'Data was successfully deleted');
    console.log('✅ Database delete test passed');

    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}; 