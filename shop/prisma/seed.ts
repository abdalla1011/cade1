import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Categories
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics" },
  });
  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: { name: "Clothing", slug: "clothing" },
  });
  const home = await prisma.category.upsert({
    where: { slug: "home" },
    update: {},
    create: { name: "Home & Living", slug: "home" },
  });

  // Products
  const products = [
    {
      sku: "ELEC-001",
      name: "Wireless Noise-Cancelling Headphones",
      description: "Premium over-ear headphones with 30hr battery life, adaptive noise cancellation, and studio-quality sound. Foldable design with carrying case included.",
      price: 299.99,
      compareAt: 399.99,
      stockQty: 48,
      categoryId: electronics.id,
      images: [
        { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", isPrimary: true, displayOrder: 0 },
        { url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800", isPrimary: false, displayOrder: 1 },
      ],
    },
    {
      sku: "ELEC-002",
      name: "Mechanical Keyboard TKL",
      description: "Tenkeyless mechanical keyboard with Cherry MX switches, per-key RGB backlighting, and aircraft-grade aluminum body. USB-C detachable cable.",
      price: 149.99,
      compareAt: null,
      stockQty: 22,
      categoryId: electronics.id,
      images: [
        { url: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800", isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      sku: "ELEC-003",
      name: "4K Webcam Pro",
      description: "Ultra HD 4K webcam with Sony sensor, dual omnidirectional mics, auto light correction, and privacy shutter. Works plug-and-play on all platforms.",
      price: 199.99,
      compareAt: 249.99,
      stockQty: 15,
      categoryId: electronics.id,
      images: [
        { url: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800", isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      sku: "CLTH-001",
      name: "Merino Wool Crew Sweater",
      description: "100% extra-fine merino wool. Naturally temperature-regulating, odour-resistant, and incredibly soft. Available in 8 colours. Ethically sourced.",
      price: 129.99,
      compareAt: null,
      stockQty: 60,
      categoryId: clothing.id,
      images: [
        { url: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800", isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      sku: "CLTH-002",
      name: "Technical Chino Pants",
      description: "Water-repellent, wrinkle-resistant chinos with 4-way stretch. Hidden zip pocket, gusseted crotch, tapered fit. Perfect for office to trail.",
      price: 98.00,
      compareAt: null,
      stockQty: 80,
      categoryId: clothing.id,
      images: [
        { url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800", isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      sku: "HOME-001",
      name: "Cast Iron Dutch Oven 5.5qt",
      description: "Enamelled cast iron Dutch oven with tight-fitting lid. Even heat distribution, oven-safe to 500°F. Ideal for braises, soups, and sourdough.",
      price: 179.99,
      compareAt: 220.00,
      stockQty: 30,
      categoryId: home.id,
      images: [
        { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      sku: "HOME-002",
      name: "Bamboo Cutting Board Set",
      description: "3-piece bamboo cutting board set with juice grooves and non-slip feet. Naturally antimicrobial. Dishwasher-safe. Includes hanging loops.",
      price: 54.99,
      compareAt: null,
      stockQty: 45,
      categoryId: home.id,
      images: [
        { url: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800", isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      sku: "ELEC-004",
      name: "Smart LED Desk Lamp",
      description: "Touch-dimming LED desk lamp with 5 colour temperatures, USB-A charging port, and memory function. Eye-care certified, flicker-free light.",
      price: 69.99,
      compareAt: 89.99,
      stockQty: 55,
      categoryId: electronics.id,
      images: [
        { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", isPrimary: true, displayOrder: 0 },
      ],
    },
  ];

  for (const p of products) {
    const { images, ...data } = p;
    await prisma.product.upsert({
      where: { sku: data.sku },
      update: {},
      create: {
        ...data,
        images: { create: images },
      },
    });
  }

  // Demo user
  const hash = await bcrypt.hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "demo@shop.com" },
    update: {},
    create: {
      email: "demo@shop.com",
      passwordHash: hash,
      name: "Demo User",
      addresses: {
        create: {
          name: "Demo User",
          line1: "123 Market Street",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "US",
          isDefault: true,
        },
      },
    },
  });

  console.log("✅ Seed complete. Demo login: demo@shop.com / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
