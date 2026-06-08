import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function screenshot(name) {
  const path = `C:/Users/Matheus/AppData/Local/Temp/ss_${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`SCREENSHOT:${path}`);
}

try {
  // Home page
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('HOME URL:', page.url());
  console.log('HOME TITLE:', await page.title());
  await screenshot('home');

  // Get nav links
  const links = await page.$$eval('a[href]', els =>
    [...new Set(els.map(e => e.getAttribute('href')))].filter(h => h && h.startsWith('/')).slice(0, 20)
  );
  console.log('NAV LINKS:', JSON.stringify(links));

  // Try login page if exists
  if (links.some(l => l.includes('login') || l.includes('auth') || l.includes('signin'))) {
    const loginLink = links.find(l => l.includes('login') || l.includes('auth') || l.includes('signin'));
    await page.goto(`http://localhost:3000${loginLink}`, { waitUntil: 'networkidle', timeout: 20000 });
    console.log('LOGIN URL:', page.url());
    await screenshot('login');
  }

} catch(e) {
  console.error('ERROR:', e.message);
  await screenshot('error').catch(() => {});
} finally {
  await browser.close();
}
