const keys = ['first_name','last_name','email','phone','city','state','zip_code','country','school','degree','major','graduation_month','graduation_year','linkedin','website','authorized_us','sponsorship','experience','motivation','achievements','aspirations'];
chrome.storage.local.get(['profile','api_key']).then(({profile={},api_key=''}) => { document.getElementById('api_key').value = api_key; for (const key of keys) document.getElementById(key).value = profile[key] || ''; });
document.getElementById('form').addEventListener('submit', async event => {
  event.preventDefault();
  const profile={};for(const key of keys)profile[key]=document.getElementById(key).value.trim();
  await chrome.storage.local.set({profile,api_key:document.getElementById('api_key').value.trim()});
  document.getElementById('saved').textContent='Saved locally';
  setTimeout(()=>document.getElementById('saved').textContent='',3000);
});
