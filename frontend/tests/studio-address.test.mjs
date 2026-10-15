import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const contact = readFileSync(new URL('../src/components/Contact.tsx', import.meta.url), 'utf8')

test('studio copy uses the owner-confirmed floor, street number and city', () => {
  assert.ok(contact.includes('3rd Floor, Cappador Galaxy Mall,'))
  assert.ok(contact.includes('81 Aminu Kano Crescent,'))
  assert.ok(contact.includes('Wuse 2, Abuja, Nigeria.'))
  assert.ok(!contact.includes('Shop 28'))
})

test('studio map searches the same complete address instead of the old pin', () => {
  const href = contact.match(/href="(https:\/\/www\.google\.com\/maps\/search\/[^\"]+)"/)?.[1]
  assert.ok(href)
  const url = new URL(href)
  assert.equal(url.searchParams.get('api'), '1')
  assert.equal(url.searchParams.get('query'), '3rd Floor, Cappador Galaxy Mall, 81 Aminu Kano Crescent, Wuse 2, Abuja, Nigeria')
  assert.ok(!contact.includes('p8znThFBibsLGWa39'))
})
