import { test, expect } from '@playwright/test'

test.describe('route smoke', () => {
  test('public pages load', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible()

    await page.goto('/about')
    await expect(page.getByRole('heading', { name: 'About ResearchHub' })).toBeVisible()

    await page.goto('/projects')
    await expect(page.getByRole('heading', { name: 'Research Projects' })).toBeVisible()

    await page.goto('/projects/proj-1')
    await expect(page.getByRole('button', { name: 'Projects' })).toBeVisible()

    await page.goto('/rankings')
    await expect(page.getByRole('heading', { name: 'Rankings' })).toBeVisible()

    await page.goto('/login')
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

    await page.goto('/register')
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible()
  })

  test('dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login\?from=%2Fdashboard/)
  })
})

