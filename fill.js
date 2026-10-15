(() => {
  if (window.resumeFillerFill) return;
  const tidy = s => String(s || '').replace(/\s+/g, ' ').trim();
  const norm = s => tidy(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const isVisible = el => !!(el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  const fieldLabel = el => {
    const values = [el.getAttribute('aria-label'), el.getAttribute('placeholder'), el.getAttribute('name'),el.getAttribute('id')];
    if (el.id) for (const label of document.querySelectorAll('label[for]')) if (label.htmlFor === el.id) values.unshift(label.textContent);
    const wrap = el.closest('label'); if (wrap) values.unshift(wrap.textContent);
    const aria = el.getAttribute('aria-labelledby'); if (aria) for (const id of aria.split(/\s+/)) values.unshift(document.getElementById(id)?.textContent);
    return norm(values.filter(Boolean).join(' '));
  };
  function profileKey(label, el) {
    const type=(el.type || '').toLowerCase();
    if (/password|otp|code|verification|captcha|signature|consent|attest|certif|privacy|terms|agree|disability|veteran|race|ethnic|gender|sexual|pronoun|salary|pay expectation|compensation|date of birth|birthdate|social security|ssn|passport|relocat|office|onsite|hybrid|gpa|address line|street/.test(label)) return null;
    if (type === 'email' || /\b(e mail|email address|email)\b/.test(label)) return 'email';
    if (type === 'tel' || /\b(phone|mobile|telephone|cell number)\b/.test(label)) return 'phone';
    if (/preferred first name/.test(label)) return 'first_name';
    if (/\b(first name|given name)\b/.test(label)) return 'first_name';
    if (/\b(last name|family name|surname)\b/.test(label)) return 'last_name';
    if (/\b(linkedin|linked in)\b/.test(label)) return 'linkedin';
    if (/\b(portfolio website|personal website|portfolio url)\b/.test(label)) return 'website';
    if (/\b(zip|postal code|postcode)\b/.test(label)) return 'zip_code';
    if (/\b(graduation month|grad month)\b/.test(label)) return 'graduation_month';
    if (/\b(graduation year|grad year)\b/.test(label)) return 'graduation_year';
    if (/\b(university|college|school name|school attended|institution)\b/.test(label) && !/high school/.test(label)) return 'school';
    if (/\b(degree|degree type)\b/.test(label)) return 'degree';
    if (/\b(major|field of study)\b/.test(label)) return 'major';
    if (/\b(city|current city)\b/.test(label)) return 'city';
    if (/\b(state|province|region)\b/.test(label) && !/united states|statement/.test(label)) return 'state';
    if (/\b(country|country of residence)\b/.test(label)) return 'country';
    if (/\b(sponsorship|require visa|need visa)\b/.test(label)) return 'sponsorship';
    if (/\b(authorized to work|legally authorized|eligible to work)\b/.test(label)) return 'authorized_us';
    if (/\b(relevant experience|marketing experience|describe your experience)\b/.test(label)) return 'experience';
    if (/\b(why marketing|interested in marketing)\b/.test(label)) return 'motivation';
    return null;
  }
  function choose(select, raw) {
    const value = norm(raw); if(!value) return false;
    const options = Array.from(select.options).filter(o=>!o.disabled);
    const match = options.find(o => norm(o.value) === value || norm(o.textContent) === value);
    if (!match) return false;
    select.value = match.value;select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));return true;
  }
  function setValue(el, raw) {
    if (el.tagName === 'SELECT') return choose(el,raw);
    if (!('value' in el)) return false;
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto,'value')?.set;
    if (setter) setter.call(el,raw); else el.value=raw;
    el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('blur',{bubbles:true}));return true;
  }
  function warningFor(text) {
    const t=tidy(text).toLowerCase();
    const notes=[];
    if (/\b(unpaid internship|internship is unpaid|unpaid position|unpaid role|without compensation|volunteer internship)\b/.test(t)) notes.push('UNPAID language detected — do not submit.');
    else if (!/(\$\s*\d[\d,.]*\s*(?:\/\s*(?:hr|hour|week|month|year)|per\s+(?:hour|week|month|year))|paid internship|hourly rate|compensation:)/.test(t)) notes.push('Compensation NOT VERIFIED on this page.');
    if (/\b(hybrid|onsite|on site|in person|in-person|office\s+\d+\s+days?|\d+\s+days?\s+(?:a|per)\s+week\s+(?:in|at)\s+(?:the\s+)?office)\b/.test(t)) notes.push('Possible in-person/hybrid requirement — verify remote status.');
    else if (!/\b(fully remote|100% remote|work from home|remote position|remote internship)\b/.test(t)) notes.push('Fully remote status NOT VERIFIED on this page.');
    return notes.join('\n') || 'Page text suggests pay/remote eligibility, but verify the exact posting before submission.';
  }

  function blockedQuestion(label, el) {
    const type=(el.type||'').toLowerCase();
    if (['file','hidden','password','submit','button','checkbox','reset','image','date','datetime-local'].includes(type)) return true;
    return /password|security question|one.time|otp|verification code|captcha|signature|attest|certif|consent|privacy|terms|agree|disability|veteran|race|ethnic|gender|sexual|pronoun|salary|expected compensation|pay expectation|social security|ssn|passport|date of birth|birthdate|street address|reference contact|criminal history|background check|work onsite|in.person|hybrid|relocat/i.test(label);
  }
  function detailedLabel(el) {
    let label=fieldLabel(el);
    let parent=el.parentElement;
    for(let depth=0; depth<4 && parent; depth++,parent=parent.parentElement){
      const text=tidy(parent.innerText||'');
      if(text && text.length>5 && text.length<420 && !/submit application|privacy policy|equal opportunity employer/i.test(text)){
        if(text.length>label.length && !label.includes(norm(text))) return tidy(text).slice(0,350);
      }
    }
    return label;
  }
  window.resumeFillerSnapshot=function(){
    const fields=[];
    const elems=Array.from(document.querySelectorAll('input,textarea,select'));
    elems.forEach((el,i)=>{
      if(!isVisible(el)||el.disabled||el.readOnly)return;
      const type=(el.type||el.tagName).toLowerCase();
      const label=detailedLabel(el);
      if(['submit','button','hidden','reset','image'].includes(type))return;
      const options=el.tagName==='SELECT' ? Array.from(el.options).filter(o=>!o.disabled).map(o=>tidy(o.textContent)) : [];
      fields.push({id:i,type:el.tagName==='SELECT'?'select':type, label,options,filled:!!tidy(el.value) && !(el.tagName==='SELECT'&&el.selectedIndex===0),blocked:blockedQuestion(label,el)});
    });
    return {url:location.href,title:document.title,context:(document.body?.innerText||'').slice(0,12000),fields};
  };
  window.resumeFillerApplyAI=function(answers){
    const elems=Array.from(document.querySelectorAll('input,textarea,select'));
    let filled=0,skipped=0;
    if(!Array.isArray(answers))return {filled,skipped};
    const used=new Set();
    for(const ans of answers.slice(0,80)){
      const id=Number(ans.id), value=tidy(ans.answer),confidence=Number(ans.confidence||0);
      const el=elems[id];
      if(!Number.isInteger(id)||used.has(id)||!el||!isVisible(el)||el.disabled||el.readOnly||!value||confidence<0.84){skipped++;continue;}
      used.add(id);
      const label=detailedLabel(el);
      if(blockedQuestion(label,el)||tidy(el.value)&&!(el.tagName==='SELECT'&&el.selectedIndex===0)){skipped++;continue;}
      const type=(el.type||'').toLowerCase();
      if(el.tagName==='SELECT'){
        if(choose(el,value))filled++;else skipped++;
      } else if (type==='radio'){
        // No AI radio selections: group semantics on custom ATS forms are easy to misread.
        skipped++;
      } else if(type==='text'||type==='email'||type==='tel'||type==='url'||el.tagName==='TEXTAREA'||type==='search'||type==='number'){
        // Do not use generated prose for numeric-only factual questions.
        if(type==='number'||type==='email'||type==='tel'||type==='url'){skipped++;continue;}
        if(setValue(el,value))filled++;else skipped++;
      } else skipped++;
    }
    return {filled,skipped};
  };

  window.resumeFillerFill=async function () {
    const {profile={}}=await chrome.storage.local.get('profile');
    let filled=0,skipped=0;const notes=[];
    const fields=Array.from(document.querySelectorAll('input, textarea, select'));
    const pageText=(document.body?.innerText||'').slice(0,45000);
    const hardBlock=/\b(unpaid internship|internship is unpaid|unpaid position|unpaid role|without compensation)\b/i.test(pageText.slice(0,12000)) || /\b(required to work (?:in|at) (?:our |the )?office|in.person (?:at least|attendance is required)|must (?:be|work) (?:onsite|on.site|in.person))\b/i.test(pageText.slice(0,12000));
    for(const el of fields){
      if (!isVisible(el) || el.disabled || el.readOnly) continue;
      const type=(el.type||'').toLowerCase();
      if (['hidden','submit','button','file','checkbox','radio','password','reset','image','date','datetime-local'].includes(type)) continue;
      if (tidy(el.value)) continue;
      const label=fieldLabel(el), key=profileKey(label,el);
      if (!key || !tidy(profile[key])) { skipped++; continue; }
      if (setValue(el, profile[key])) filled++; else {skipped++;notes.push(`Could not select ${key}; check dropdown options.`);}
    }
    notes.unshift('File uploads must be selected manually; browsers prevent silent access to local resume files.');
    return {filled,skipped,notes,warning:warningFor(pageText),hardBlock,snapshot:window.resumeFillerSnapshot()};
  };
})();
