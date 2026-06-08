import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

async function go(path, name) {
  await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.screenshot({ path: `C:/Users/Matheus/AppData/Local/Temp/ss_${name}.png`, fullPage: true });
  console.log(`DONE: ${name} -> ${page.url()}`);
}

try {
  // Landing page full
  await go('/', 'landing_full');

  // Pricing / precos
  await go('/pricing', 'pricing');

  // Register
  await go('/register', 'register');

  // Contact
  await go('/contact', 'contact');

} catch(e) {
  console.error('ERROR:', e.message);
} finally {
  await browser.close();
}
