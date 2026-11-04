import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const signature = 'Signature Straight 22"'
const straight = 'SDD Luxury Bone Straight 18" 5 by 5'
const saleLabel = (name: string) => `Include ${name} in Christmas Sales`

async function unlock(page: Page) {
  await page.goto('/?admin=products')
  await page.getByLabel('Password', { exact: true }).fill('local-qa-only')
  await page.getByRole('button', { name: 'Unlock inventory', exact: true }).click()
  await expect(page.getByLabel('Search inventory', { exact: true })).toBeVisible()
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
}

test.beforeEach(async ({ request }) => {
  await request.post('/__qa/inventory', { data: { reset: true } })
})

test('delayed collection never paints seeds or stale local uploads, and keeps its deep link', async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/products', async route => { await gate; await route.continue() })
  await page.addInitScript(() => {
    localStorage.setItem('glamoursphair_admin_products', JSON.stringify([{ id: 999, name: 'Old local upload', price: 1, description: 'Stale product', gradient: '' }]))
    const seen = new Set<string>()
    Object.assign(window, { inventoryPaintedIds: seen })
    new MutationObserver(() => document.querySelectorAll('[data-product-id]').forEach(node => seen.add(node.getAttribute('data-product-id')!))).observe(document, { subtree: true, childList: true })
  })
  await page.goto('/products?collection=Thank+you+sales', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Loading the current collection...')).toBeVisible()
  await expect(page.locator('[data-product-id]')).toHaveCount(0)
  release()
  await expect(page.locator('[data-product-id="112"]')).toBeVisible()
  await expect(page.locator('[data-product-id]')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Thank you sales 1', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => [...(window as unknown as { inventoryPaintedIds: Set<string> }).inventoryPaintedIds])).toEqual(['112'])
  await noOverflow(page)
})

test('deleting a seed product stays deleted after a full catalogue reload', async ({ page }) => {
  await unlock(page)
  await page.getByRole('button', { name: `Delete ${signature}`, exact: true }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete product', exact: true }).click()
  await expect(page.locator('[data-admin-product-id="11"]')).toHaveCount(0)
  await page.goto('/products')
  await expect(page.locator('[data-product-id="112"]')).toBeVisible()
  await expect(page.locator('[data-product-id]')).toHaveCount(1)
  await page.reload()
  await expect(page.locator('[data-product-id="112"]')).toBeVisible()
  await expect(page.locator('[data-product-id="11"]')).toHaveCount(0)
})

test('database failure shows retry without legacy fallback, then recovers', async ({ page, request }) => {
  await request.post('/__qa/inventory', { data: { failures: 10 } })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Collection unavailable' })).toBeVisible()
  await expect(page.locator('[data-product-id]')).toHaveCount(0)
  await request.post('/__qa/inventory', { data: { failures: 0 } })
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(page.locator('[data-product-id="11"]')).toBeVisible()
  await expect(page.locator('[data-product-id]')).toHaveCount(1)
})

test('admin selects sale membership, retains collection and price, and can undo it', async ({ page, request }, info) => {
  await unlock(page)
  const checkbox = page.getByRole('checkbox', { name: saleLabel(straight), exact: true })
  await checkbox.click()
  await expect(checkbox).toBeChecked()
  await expect(page.getByText('Placement saved to shared inventory.', { exact: true })).toBeVisible()
  await page.getByLabel('Inventory collection', { exact: true }).selectOption('christmas-sale')
  await expect(page.locator('[data-admin-product-id]')).toHaveCount(2)
  const snapshot = await (await request.get('/api/products')).json()
  const product = snapshot.products.find((item: { id: number }) => item.id === 112)
  expect(product).toMatchObject({ inChristmasSale: true, price: 345000, group: 'Thank you sales', showOnHomepage: false, showInCatalog: true })
  await noOverflow(page)
  await page.screenshot({ path: info.outputPath('admin-christmas-sales.png') })
  await checkbox.click()
  await expect(page.locator('[data-admin-product-id]')).toHaveCount(1)
  const sale = await (await request.get('/api/sales')).json()
  expect(sale.products.map((item: { id: number }) => item.id)).toEqual([11])
})

test('editor saves membership without changing other fields, and sorting retains it', async ({ page, request }) => {
  await unlock(page)
  await page.getByRole('button', { name: `Edit ${straight}`, exact: true }).click()
  await expect(page.getByLabel('Product name', { exact: true })).toHaveValue(straight)
  await page.getByRole('checkbox', { name: 'Include in Christmas Sales 20% off', exact: false }).check()
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: saleLabel(straight), exact: true })).toBeChecked()
  await page.getByRole('button', { name: `Move ${straight} up`, exact: true }).click()
  await expect(page.getByText('Product order saved to shared inventory.', { exact: true })).toBeVisible()
  const sale = await (await request.get('/api/sales')).json()
  expect(sale.products.map((item: { id: number }) => item.id)).toEqual([112, 11])
  expect(sale.products[0].price).toBe(276000)
  expect(sale.products[0].group).toBe('Thank you sales')
})

test('failed sale membership save retains the previous checkbox state', async ({ page, request }) => {
  await unlock(page)
  await request.post('/__qa/inventory', { data: { failWrite: true } })
  const checkbox = page.getByRole('checkbox', { name: saleLabel(straight), exact: true })
  await checkbox.click()
  await expect(page.getByRole('alert').filter({ hasText: 'The previous placement is unchanged.' })).toBeVisible()
  await expect(checkbox).not.toBeChecked()
})

test('unmigrated schema disables only sale controls', async ({ page, request }) => {
  await request.post('/__qa/inventory', { data: { migrated: false } })
  await unlock(page)
  await expect(page.getByRole('checkbox', { name: saleLabel(straight), exact: true })).toBeDisabled()
  await expect(page.getByRole('checkbox', { name: `Show ${straight} on full products page`, exact: true })).toBeEnabled()
  await expect(page.getByText(/run supabase-christmas-sales.sql/)).toBeVisible()
})

test('sales collection link opens the renamed campaign with November dates and current offers', async ({ page }, info) => {
  await page.goto('/products')
  await page.locator('.catalog-collections').getByRole('link', { name: 'Christmas Sales' }).click()
  await expect(page.getByRole('heading', { name: 'Christmas Sales', exact: true })).toBeVisible()
  await expect(page.getByText('9-15 NOVEMBER 2026', { exact: false })).toBeVisible()
  await expect(page.locator('[data-sale-product-id]')).toHaveCount(1)
  await expect(page.getByText('Opens 9 November', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: `View ${signature}`, exact: true }).click()
  await expect(page.getByRole('dialog', { name: signature })).toBeVisible()
  await expect(page.getByText('Sale checkout opens 9 November, Nigeria time.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Close sale product', exact: true }).press('Escape')
  await expect(page.getByRole('dialog', { name: signature })).not.toBeVisible()
  await noOverflow(page)
  await page.screenshot({ path: info.outputPath('christmas-sales.png') })
})

test('regular catalogue search, product gallery and add to cart still work', async ({ page }) => {
  await page.goto('/products')
  await expect(page.locator('[data-product-id]')).toHaveCount(2)
  await page.getByRole('searchbox', { name: 'Search products', exact: true }).fill('no such unit')
  await expect(page.getByRole('heading', { name: 'No matching pieces' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear search and filters', exact: true }).click()
  await page.getByRole('heading', { name: signature, exact: true }).getByRole('link').click()
  await expect(page.getByRole('dialog', { name: signature })).toBeVisible()
  await page.getByRole('button', { name: 'Close product preview', exact: true }).press('Escape')
  await page.getByRole('button', { name: `Add ${signature} to cart`, exact: true }).click()
  await expect(page.getByRole('dialog').filter({ hasText: 'Your Cart' })).toBeVisible()
  await expect(page.getByRole('dialog').filter({ hasText: 'Your Cart' })).toContainText(signature)
})

test('shop and admin fit compact and wide responsive layouts', async ({ page }) => {
  for (const width of [360, 430, 768, 1024, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/products')
    await expect(page.locator('[data-product-id]')).toHaveCount(2)
    await noOverflow(page)
    await unlock(page)
    await expect(page.getByRole('checkbox', { name: saleLabel(straight), exact: true })).toBeVisible()
    await noOverflow(page)
  }
})
