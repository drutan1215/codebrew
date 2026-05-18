// CodeBrew Member Auth
// Each program maps to a published Google Sheet CSV URL.
// To add a new program: publish its tab and add the URL here.
const PROGRAM_SHEETS = {
  foundations: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSyJ9IoQBMX2f4F6oVceR_YUihrrRgyufwzNAahAJsNudf3ORPMKKlO6JuGBGSqdrZEOoHvhIuKRnus/pub?output=csv',
  // build:  'PASTE_BUILD_TAB_CSV_URL_HERE',
  // level3: 'PASTE_LEVEL3_TAB_CSV_URL_HERE',
};

export async function checkAccess(program) {
  const params = new URLSearchParams(window.location.search);
  const urlKey  = params.get('key');
  const stored  = localStorage.getItem(`cb_key_${program}`);
  const key     = urlKey || stored;

  if (!key) return false;

  const sheetUrl = PROGRAM_SHEETS[program];
  if (!sheetUrl) return false;

  try {
    const res  = await fetch(sheetUrl);
    if (!res.ok) return false;
    const text = await res.text();

    // Skip header row; subscriber_id is first column
    const validKeys = text
      .split('\n')
      .slice(1)
      .map(row => row.split(',')[0].replace(/"/g, '').trim())
      .filter(Boolean);

    if (validKeys.includes(key)) {
      localStorage.setItem(`cb_key_${program}`, key);
      // Clean the key out of the URL bar
      if (urlKey && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      return true;
    }
  } catch (err) {
    console.error('CodeBrew auth error:', err);
  }

  return false;
}

export function logout(program) {
  localStorage.removeItem(`cb_key_${program}`);
  window.location.href = window.location.pathname;
}
