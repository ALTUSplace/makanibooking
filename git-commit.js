import { execSync } from 'child_process';
const cwd = 'C:/Users/kml/Desktop/b2r';
try {
  console.log(execSync('git add -A', { cwd }).toString());
  console.log(execSync('git commit -m "feat: integrate supabase credentials and production configuration"', { cwd }).toString());
  console.log('COMMIT SUCCESS');
} catch (e) {
  console.log('COMMIT NOTE:', e.message);
}
