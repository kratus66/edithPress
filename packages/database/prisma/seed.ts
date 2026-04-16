import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ==================== PLANES ====================
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { slug: 'starter' },
      update: {},
      create: {
        id: 'starter',
        name: 'Starter',
        slug: 'starter',
        priceMonthly: 9.99,
        priceYearly: 99.99,
        maxSites: 1,
        maxPages: 10,
        maxStorageGB: 1,
        hasCustomDomain: false,
        hasEcommerce: false,
        hasAnalytics: false,
        hasWhiteLabel: false,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        id: 'business',
        name: 'Business',
        slug: 'business',
        priceMonthly: 29.99,
        priceYearly: 299.99,
        maxSites: 5,
        maxPages: 100,
        maxStorageGB: 10,
        hasCustomDomain: true,
        hasEcommerce: false,
        hasAnalytics: true,
        hasWhiteLabel: false,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'pro' },
      update: {},
      create: {
        id: 'pro',
        name: 'Pro',
        slug: 'pro',
        priceMonthly: 79.99,
        priceYearly: 799.99,
        maxSites: 20,
        maxPages: -1,
        maxStorageGB: 50,
        hasCustomDomain: true,
        hasEcommerce: true,
        hasAnalytics: true,
        hasWhiteLabel: false,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'enterprise' },
      update: {},
      create: {
        id: 'enterprise',
        name: 'Enterprise',
        slug: 'enterprise',
        priceMonthly: 0,
        priceYearly: 0,
        maxSites: -1,
        maxPages: -1,
        maxStorageGB: 500,
        hasCustomDomain: true,
        hasEcommerce: true,
        hasAnalytics: true,
        hasWhiteLabel: true,
      },
    }),
  ])

  console.log(`✅ Plans seeded: ${plans.map((p) => p.name).join(', ')}`)

  // ==================== SUPER ADMIN ====================
  const passwordHash = await bcrypt.hash('Admin123!', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@edithpress.com' },
    update: {},
    create: {
      email: 'admin@edithpress.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      emailVerified: true,
      isActive: true,
    },
  })

  console.log(`✅ Super admin seeded: ${admin.email}`)
  console.log('🌱 Seeding complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
