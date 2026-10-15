# Resume Filler — One-Click AI Autofill (v2.0)

This is an unpacked Chrome Manifest V3 extension. It works in **regular Google Chrome**.

## Install / upgrade
1. Extract the ZIP in Downloads. Open chrome://extensions and turn Developer mode on.
2. If the prior `Resume Filler — Application Autofill` extension is installed, click **Remove** on that old card (or keep it disabled to avoid duplicate popups).
3. Click **Load unpacked**, select the extracted `resume_filler_chrome_extension` folder (the folder containing `manifest.json`).
4. Pin the extension from the puzzle icon. Click its icon → **Edit saved profile**.
5. Enter accurate verified identity, schooling, work authorization, marketing experience and brand projects. Get an OpenAI API key from platform.openai.com and paste in the API-key field. Click **Save profile**.
6. Open a real job application in Chrome. Click extension → **Fill Entire Application with AI** once. Wait for the final status.

## One-click workflow
- First fills recognizable blank fields with saved facts.
- Sends the saved profile + visible application questions to the OpenAI API, using your own API key, to generate grounded answers for previously unknown open-ended questions.
- Applies high-confidence answers to ordinary text areas / inputs and exact-match native selects only.
- Does not overwrite existing answers, make up career accomplishments, bypass CAPTCHA, check consent, answer demographics, fill sensitive/unknown facts, upload documents, or **submit** applications.
- Screens page text for unpaid/mandatory-office warnings; risky pages do not run AI filling.
- The extension does NOT guarantee every custom ATS widget is supported. Any skipped required field must be completed by the user.

## Privacy / billing
- Your profile and OpenAI API key are stored in `chrome.storage.local` for this browser profile. Storage is **not encrypted by this extension**. Anyone with access to this browser profile may access it.
- When you click AI Fill, it transmits relevant form text and profile data to `https://api.openai.com/`. It doesn't transmit the whole browser history.
- OpenAI API use is billed separately from ChatGPT subscriptions. Never paste a key into untrusted sites or upload it to chats.
- Don't run on untrusted pages asking for private information, or forms for which the website explicitly prohibits automation.

## Troubleshooting
- `Missing OpenAI API key` means open **Edit saved profile**, enter your API key, then save.
- `401` from OpenAI means your key is invalid or revoked. `429` usually means quota/rate limit.
- The extension does not have access to file paths on your Mac, so select your resume manually.
- For dynamically rendered application steps, click the extension again on each new step/page.
- For undo: remove the extension on `chrome://extensions` and optionally delete the extracted folder.

No website has been used for live submission testing. Review all results before submitting.
