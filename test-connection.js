// Quick Supabase connection test
// Run with: node test-connection.js

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('   Please check your .env.local file');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Check if tables exist
console.log('\n📊 Testing database tables...');

try {
  const { data: valentines, error: valentinesError } = await supabase
    .from('valentines')
    .select('count')
    .limit(1);
  
  if (valentinesError) throw valentinesError;
  console.log('✅ valentines table accessible');

  const { data: tokens, error: tokensError } = await supabase
    .from('result_tokens')
    .select('count')
    .limit(1);
  
  if (tokensError) throw tokensError;
  console.log('✅ result_tokens table accessible');

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('count')
    .limit(1);
  
  if (eventsError) throw eventsError;
  console.log('✅ events table accessible');

  console.log('\n🎉 SUCCESS! Your Supabase connection is working!');
  console.log('   You can now run: npm run dev');
  
} catch (error) {
  console.error('\n❌ Connection test failed:');
  console.error('   ', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Check that you ran the migration SQL in Supabase dashboard');
  console.error('   2. Verify your API credentials in .env.local');
  console.error('   3. Make sure RLS policies are applied');
  process.exit(1);
}
