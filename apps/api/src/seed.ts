import { PrismaClient } from '@prisma/client'
import { cryptoWaitReady } from '@polkadot/util-crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')
  
  await cryptoWaitReady()
  
  // Create test users
  const alice = await prisma.user.upsert({
    where: { walletAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' },
    update: {},
    create: {
      walletAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      username: 'alice',
      name: 'Alice',
      email: 'alice@bazari.io',
      bio: 'First citizen of Bazari',
      role: 'ADMIN',
      verified: true,
      verifiedAt: new Date(),
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      termsVersion: '1.0.0'
    }
  })
  
  const bob = await prisma.user.upsert({
    where: { walletAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' },
    update: {},
    create: {
      walletAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      username: 'bob',
      name: 'Bob',
      email: 'bob@bazari.io',
      bio: 'Builder at Bazari',
      role: 'CITIZEN',
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      termsVersion: '1.0.0'
    }
  })
  
  console.log('✅ Created users:', { alice: alice.username, bob: bob.username })
  
  // Create a test DAO
  const testDao = await prisma.dao.upsert({
    where: { slug: 'bazari-market' },
    update: {},
    create: {
      name: 'Bazari Market',
      slug: 'bazari-market',
      description: 'Official Bazari marketplace',
      mission: 'To provide fair and transparent marketplace for all',
      vision: 'A world where everyone can trade freely',
      values: ['Transparency', 'Fairness', 'Community', 'Innovation'],
      category: 'marketplace',
      tags: ['official', 'marketplace', 'community'],
      treasuryAddress: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
      members: {
        create: [
          {
            userId: alice.id,
            role: 'FOUNDER',
            shares: '1000000'
          },
          {
            userId: bob.id,
            role: 'MEMBER',
            shares: '100000'
          }
        ]
      }
    }
  })
  
  console.log('✅ Created DAO:', testDao.name)
  
  // Create categories
  const categories = [
    {
      id: 'alimentos-bebidas',
      kind: 'product',
      level: 1,
      namePt: 'Alimentação e Bebidas',
      nameEn: 'Food & Drinks',
      nameEs: 'Alimentación y Bebidas',
      pathSlugs: ['alimentos-bebidas'],
      pathNamesPt: ['Alimentação e Bebidas'],
      pathNamesEn: ['Food & Drinks'],
      pathNamesEs: ['Alimentación y Bebidas']
    },
    {
      id: 'tecnologia',
      kind: 'product',
      level: 1,
      namePt: 'Tecnologia',
      nameEn: 'Technology',
      nameEs: 'Tecnología',
      pathSlugs: ['tecnologia'],
      pathNamesPt: ['Tecnologia'],
      pathNamesEn: ['Technology'],
      pathNamesEs: ['Tecnología']
    },
    {
      id: 'beleza-bem-estar',
      kind: 'service',
      level: 1,
      namePt: 'Beleza e Bem-estar',
      nameEn: 'Beauty & Wellness',
      nameEs: 'Belleza y Bienestar',
      pathSlugs: ['beleza-bem-estar'],
      pathNamesPt: ['Beleza e Bem-estar'],
      pathNamesEn: ['Beauty & Wellness'],
      pathNamesEs: ['Belleza y Bienestar']
    }
  ]
  
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category
    })
  }
  
  console.log('✅ Created categories:', categories.length)
  
  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      daoId: testDao.id,
      userId: alice.id,
      title: 'Café Orgânico Premium',
      description: 'Café 100% orgânico cultivado nas montanhas de Minas Gerais',
      priceBzr: '25.50',
      categoryId: 'alimentos-bebidas',
      categoryPath: ['alimentos-bebidas'],
      attributes: {
        weight: '500g',
        origin: 'Minas Gerais',
        roast: 'Medium'
      },
      attributesSpecVersion: '1.0.0',
      images: [],
      imagesCids: [],
      stockQuantity: 100,
      status: 'ACTIVE'
    }
  })
  
  const product2 = await prisma.product.create({
    data: {
      daoId: testDao.id,
      userId: bob.id,
      title: 'Smartphone Bazari Phone X',
      description: 'Smartphone com tecnologia blockchain integrada',
      priceBzr: '1500.00',
      categoryId: 'tecnologia',
      categoryPath: ['tecnologia'],
      attributes: {
        brand: 'Bazari',
        model: 'Phone X',
        storage: '128GB',
        ram: '8GB'
      },
      attributesSpecVersion: '1.0.0',
      images: [],
      imagesCids: [],
      stockQuantity: 50,
      status: 'ACTIVE'
    }
  })
  
  console.log('✅ Created products:', { product1: product1.title, product2: product2.title })
  
  // Create sample service
  const service1 = await prisma.serviceOffering.create({
    data: {
      daoId: testDao.id,
      userId: bob.id,
      title: 'Consultoria de Blockchain',
      description: 'Ajudo você a integrar blockchain no seu negócio',
      basePriceBzr: '100.00',
      priceType: 'hourly',
      categoryId: 'beleza-bem-estar',
      categoryPath: ['beleza-bem-estar'],
      attributes: {
        duration: '60',
        location: 'Remote',
        languages: ['pt', 'en']
      },
      attributesSpecVersion: '1.0.0',
      availability: {
        monday: ['09:00-12:00', '14:00-18:00'],
        tuesday: ['09:00-12:00', '14:00-18:00'],
        wednesday: ['09:00-12:00', '14:00-18:00'],
        thursday: ['09:00-12:00', '14:00-18:00'],
        friday: ['09:00-12:00', '14:00-18:00']
      },
      images: [],
      imagesCids: [],
      status: 'ACTIVE'
    }
  })
  
  console.log('✅ Created service:', service1.title)
  
  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })