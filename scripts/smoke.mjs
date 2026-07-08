/* Interactive smoke test: exercises log/rate/review, queue, lists and profile. */
import { chromium } from 'playwright-core'

const BASE = 'http://localhost:5173'
const shots = '/tmp/waxd-shots'
let failures = 0

function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) failures++
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })

// 1. Log a listen via the + Log quick flow
await page.goto(BASE)
await page.getByRole('button', { name: /log/i }).first().click()
await page.getByPlaceholder('Search music to log…').fill('ok computer radiohead')
await page.getByRole('button', { name: /OK Computer/ }).first().click()
const dialog = page.getByRole('dialog', { name: 'I listened…' })
await dialog.getByRole('button', { name: 'Rate 4.5 stars' }).click()
await dialog.getByLabel('Like', { exact: true }).click()
await dialog.getByPlaceholder('Add a review…').fill('Still the blueprint. Airbag into Paranoid Android is an all-timer opening.')
await dialog.getByRole('button', { name: 'Save' }).click()
await page.waitForTimeout(400)

// 2. Verify it shows up in the diary
await page.goto(`${BASE}/profile/diary`)
await page.waitForTimeout(400)
const diaryText = await page.textContent('body')
check('diary shows OK Computer', diaryText.includes('OK Computer'))
check('diary shows review chip', diaryText.includes('Review'))

// 3. Verify reviews tab
await page.goto(`${BASE}/profile/reviews`)
await page.waitForTimeout(400)
check('review text present', (await page.textContent('body')).includes('Still the blueprint'))

// 4. Queue something from browse (hover quick action)
await page.goto(`${BASE}/browse`)
await page.waitForSelector('img[alt]', { timeout: 15000 })
const card = page.locator('.group\\/card').first()
await card.hover()
await card.getByRole('button', { name: 'Listen later' }).click()
await page.goto(`${BASE}/queue`)
await page.waitForTimeout(400)
const queueImgs = await page.locator('main img').count()
check('queue has one release', queueImgs >= 1)

// 5. Create a list and add from release page
await page.goto(`${BASE}/release/c1097861387`)
await page.getByRole('button', { name: 'Add to list' }).click()
await page.getByRole('button', { name: 'New list' }).click()
await page.getByPlaceholder('List name…').fill('Albums that raised me')
await page.getByRole('button', { name: 'Create' }).click()
await page.getByRole('button', { name: 'Done' }).click()
await page.goto(`${BASE}/lists`)
await page.waitForTimeout(400)
check('list created with 1 release', (await page.textContent('body')).includes('1 release'))

// 6. Star rating shows on release page + profile stats
await page.goto(`${BASE}/release/c1097861387`)
await page.waitForTimeout(600)
check('release page shows your rating', (await page.textContent('body')).includes('You rated this 4.5'))

await page.goto(`${BASE}/profile`)
await page.waitForTimeout(600)
const profileText = await page.textContent('body')
check('profile shows logged release', profileText.includes('OK Computer'))
await page.screenshot({ path: `${shots}/profile.png` })

// 7. Home page with activity
await page.goto(BASE)
await page.waitForTimeout(800)
await page.screenshot({ path: `${shots}/home-active.png` })
check('home shows welcome-back state', (await page.textContent('body')).includes('Welcome back'))

// 8. Log modal screenshot for the record
await page.goto(`${BASE}/release/c1440935467`) // Blonde
await page.waitForTimeout(700)
await page.getByRole('button', { name: 'Log, rate or review' }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: `${shots}/log-modal.png` })

await browser.close()
console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
