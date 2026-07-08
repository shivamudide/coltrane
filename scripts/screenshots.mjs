#!/usr/bin/env node
/**
 * Regenerate README preview screenshots.
 * Requires the dev server: npm run dev
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../docs/screenshots')
const BASE = 'http://localhost:5173'

fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

async function shot(name, url) {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const file = path.join(outDir, `${name}.png`)
  await page.screenshot({ path: file })
  const kb = Math.round(fs.statSync(file).size / 1024)
  console.log(`wrote ${file} (${kb} KB)`)
}

await shot('home', `${BASE}/`)
await shot('release', `${BASE}/release/c1097861387`)
await shot('profile', `${BASE}/profile`)

await browser.close()
console.log('Done — commit docs/screenshots/ and the images will show on GitHub.')
