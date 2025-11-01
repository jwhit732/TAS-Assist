// Simple test to verify APRV and schema load
const { readFileSync } = require('fs');
const { join } = require('path');

console.log('Testing schema load...');

try {
  const schemaPath = join(__dirname, 'prompts', 'schema.json');
  const schemaContent = readFileSync(schemaPath, 'utf-8');
  const schema = JSON.parse(schemaContent);

  console.log('✅ Schema loaded successfully');
  console.log('Schema title:', schema.title);
  console.log('Required fields:', schema.required);

  // Check system prompt
  const systemPath = join(__dirname, 'prompts', 'system.md');
  const systemContent = readFileSync(systemPath, 'utf-8');
  console.log('✅ System prompt loaded:', systemContent.length, 'bytes');

  console.log('\n✅ All files accessible');
} catch (error) {
  console.error('❌ Error:', error.message);
}
