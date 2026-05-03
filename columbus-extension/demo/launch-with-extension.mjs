// Launches Chromium with the Columbus extension loaded + opens the demo job form.
// Run: node demo/launch-with-extension.mjs
//
// Uses Playwright's chromium with --load-extension. Persistent context required
// because Chrome MV3 service workers need a profile to register against.

import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const extensionPath = path.resolve(__dirname, '..', 'dist')
const userDataDir = path.resolve(__dirname, '.user-data-dir')
const demoFile = `file://${path.resolve(__dirname, 'job-form.html')}`

console.log('🧭 Launching Chromium with Columbus extension')
console.log('  extension:', extensionPath)
console.log('  user data:', userDataDir)
console.log('  demo page:', demoFile)
console.log()

const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
  viewport: { width: 1280, height: 900 },
})

// Wait for extension service worker to register so popup/messaging works
let serviceWorker = context.serviceWorkers()[0]
if (!serviceWorker) {
  serviceWorker = await context.waitForEvent('serviceworker', { timeout: 15000 })
}
const extensionId = serviceWorker.url().split('/')[2]
console.log(`✓ extension registered (id: ${extensionId})`)
console.log()

const page = context.pages()[0] ?? await context.newPage()
await page.goto(demoFile)
console.log('✓ demo job form opened')
console.log()
console.log('Try:')
console.log('  • Click the Columbus icon in the toolbar (puzzle piece menu if not pinned)')
console.log('  • Look for the "!" badge on the icon (PR #185 — fires on JOB_DETECTED)')
console.log('  • Press Cmd+Shift+F to auto-fill the form (needs auth — connect via popup)')
console.log('  • Press Cmd+Shift+I to import the job listing to your opportunity bank')
console.log()
console.log('Open chrome://extensions to inspect / reload the extension')
console.log('Open chrome://extensions/?id=' + extensionId + ' for direct details')
console.log()
console.log('Press Ctrl+C in this terminal to close the browser')

// Keep the process alive — user closes browser manually
await new Promise(() => {})
