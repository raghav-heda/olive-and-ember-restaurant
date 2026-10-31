import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Olive & Ember Kitchen database seed...");

  // Clean existing demo data idempotently
  await prisma.activityLog.deleteMany({});
  await prisma.orderItemOption.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.menuItemOptionValue.deleteMany({});
  await prisma.menuItemOption.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.menuCategory.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.restaurantSettings.deleteMany({});
  await prisma.restaurant.deleteMany({});

  // 1. Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Olive & Ember Kitchen",
      slug: "olive-and-ember",
      tagline: "Artisanal Wood-Fired Gastronomy & Hearthside Dining",
      description:
        "Olive & Ember Kitchen celebrates slow-fermented sourdough, wood-fired hearth cooking, and sun-drenched coastal produce. An intimate dining destination rooted in artisanal craft and modern culinary refinement.",
      address: "14/2 Hearthstone Avenue, 100ft Road, Indiranagar (Demo Location)",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      phone: "+91 98765 43210",
      email: "hello@oliveandember.demo",
      website: "https://oliveandember.demo",
      currency: "INR",
      timezone: "Asia/Kolkata",
      taxNumber: "29AABCU9603R1Z7",
      logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
      isActive: true,
    },
  });

  // 2. Restaurant Settings
  await prisma.restaurantSettings.create({
    data: {
      restaurantId: restaurant.id,
      openingHoursJson: JSON.stringify({
        monday: { open: "12:00", close: "23:00", closed: false },
        tuesday: { open: "12:00", close: "23:00", closed: false },
        wednesday: { open: "12:00", close: "23:00", closed: false },
        thursday: { open: "12:00", close: "23:00", closed: false },
        friday: { open: "12:00", close: "23:45", closed: false },
        saturday: { open: "12:00", close: "23:45", closed: false },
        sunday: { open: "12:00", close: "22:30", closed: false },
      }),
      slotDurationMinutes: 90,
      maxPartySize: 12,
      advanceBookingDays: 30,
      autoConfirmBookings: false,
      dineInEnabled: true,
      pickupEnabled: true,
      deliveryEnabled: true,
      deliveryRadiusKm: 8.5,
      baseDeliveryFee: 50.0,
      freeDeliveryThreshold: 800.0,
      estimatedDeliveryMin: 40,
      estimatedPickupMin: 20,
      taxPercentage: 5.0,
      taxName: "GST",
      serviceChargePercent: 0.0,
      razorpayEnabled: false,
      codEnabled: true,
    },
  });

  // 3. Admin & Staff Users
  const adminPasswordHash = await bcrypt.hash("AdminPass@2026", 10);
  const staffPasswordHash = await bcrypt.hash("StaffPass@2026", 10);

  const adminUser = await prisma.user.create({
    data: {
      restaurantId: restaurant.id,
      name: "Chef Raghav Heda",
      email: "admin@oliveandember.demo",
      passwordHash: adminPasswordHash,
      role: "OWNER",
      phone: "+91 98765 00001",
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      restaurantId: restaurant.id,
      name: "Front of House Staff",
      email: "staff@oliveandember.demo",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      phone: "+91 98765 00002",
      isActive: true,
    },
  });

  // 4. Menu Categories
  const catPizzas = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: "Wood-Fired Hearth Pizzas",
      slug: "wood-fired-pizzas",
      description: "Naturally leavened 48-hour fermented sourdough baked in our 450°C stone hearth oven.",
      displayOrder: 1,
    },
  });

  const catSmallPlates = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: "Small Plates & Antipasti",
      slug: "small-plates",
      description: "Charred appetizers, whipped cheeses, and seasonal garden harvests.",
      displayOrder: 2,
    },
  });

  const catPastas = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: "Handmade Pastas & Risottos",
      slug: "handmade-pastas",
      description: "Extruded in-house bronze-die pastas paired with rich emulsions and braised aromatics.",
      displayOrder: 3,
    },
  });

  const catMains = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: "Charred Hearth Mains",
      slug: "hearth-mains",
      description: "Slow-roasted cuts, charred seasonal squash, and coastal grilled fish.",
      displayOrder: 4,
    },
  });

  const catDesserts = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: "Artisanal Desserts",
      slug: "desserts",
      description: "Smoked sea salt tarts, mascarpone pots, and burnt Basque cheesecakes.",
      displayOrder: 5,
    },
  });

  const catBeverages = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: "Botanical Elixirs & Brews",
      slug: "beverages",
      description: "Cold-pressed citrus, rosemary infusions, ginger shrubs, and roasted single-estate coffees.",
      displayOrder: 6,
    },
  });

  // 5. Menu Items & Customization Options
  // Item 1: Truffled Burrata & Charred Peaches
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catSmallPlates.id,
      name: "Truffled Burrata & Hearth Peaches",
      slug: "truffled-burrata-hearth-peaches",
      description: "Artisanal burrata, wood-charred peaches, wild clover honey, toasted pine nuts, and sourdough crisps.",
      basePrice: 560,
      imageUrl: "/images/menu/burrata-peaches.jpg",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      spiceLevel: 0,
      allergens: JSON.stringify(["Dairy", "Nuts", "Gluten"]),
      preparationTimeMinutes: 15,
      isAvailable: true,
      isFeatured: true,
      displayOrder: 1,
    },
  });

  // Item 2: Roasted Garlic & Rosemary Focaccia
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catSmallPlates.id,
      name: "Hearth Focaccia & Confit Garlic Dip",
      slug: "hearth-focaccia-confit-garlic",
      description: "Warm olive oil-drenched sourdough focaccia with sea salt flakes, charred rosemary, and whipped confit garlic butter.",
      basePrice: 340,
      imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      spiceLevel: 0,
      allergens: JSON.stringify(["Gluten", "Dairy"]),
      preparationTimeMinutes: 12,
      isAvailable: true,
      isFeatured: false,
      displayOrder: 2,
    },
  });

  // Item 3: Smoked Ember Margherita Pizza
  const pizzaMargherita = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catPizzas.id,
      name: "Smoked Ember Margherita",
      slug: "smoked-ember-margherita",
      description: "San Marzano DOP tomato passata, fresh buffalo mozzarella, hand-torn sweet basil, cold-pressed olive oil, and smoked Maldon sea salt.",
      basePrice: 620,
      imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      spiceLevel: 1,
      allergens: JSON.stringify(["Dairy", "Gluten"]),
      preparationTimeMinutes: 18,
      isAvailable: true,
      isFeatured: true,
      displayOrder: 1,
    },
  });

  const crustOption = await prisma.menuItemOption.create({
    data: {
      menuItemId: pizzaMargherita.id,
      name: "Crust Style",
      isRequired: true,
      minSelect: 1,
      maxSelect: 1,
    },
  });

  await prisma.menuItemOptionValue.createMany({
    data: [
      { optionId: crustOption.id, name: "Classic Neapolitan 48hr Ferment", priceModifier: 0 },
      { optionId: crustOption.id, name: "Charred Multi-Grain Sourdough", priceModifier: 60 },
      { optionId: crustOption.id, name: "Gluten-Friendly Almond Crust", priceModifier: 120 },
    ],
  });

  const cheeseOption = await prisma.menuItemOption.create({
    data: {
      menuItemId: pizzaMargherita.id,
      name: "Artisan Additions",
      isRequired: false,
      minSelect: 0,
      maxSelect: 2,
    },
  });

  await prisma.menuItemOptionValue.createMany({
    data: [
      { optionId: cheeseOption.id, name: "Double Smoked Fior Di Latte", priceModifier: 90 },
      { optionId: cheeseOption.id, name: "Calabrian Chili Oil Drizzle", priceModifier: 40 },
    ],
  });

  // Item 4: Wild Forest Mushroom & Truffle Pizza
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catPizzas.id,
      name: "Wild Mushroom & Black Truffle",
      slug: "wild-mushroom-black-truffle-pizza",
      description: "Roasted shiitake and porcini cream, fontina, charred thyme, shaved black summer truffle, and aged pecorino romano.",
      basePrice: 780,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      spiceLevel: 0,
      allergens: JSON.stringify(["Dairy", "Gluten"]),
      preparationTimeMinutes: 20,
      isAvailable: true,
      isFeatured: true,
      displayOrder: 2,
    },
  });

  // Item 5: Spicy Charred Pepperoni & Hot Honey
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catPizzas.id,
      name: "Charred Pepperoni & Hot Honey",
      slug: "charred-pepperoni-hot-honey-pizza",
      description: "Crispy-edged artisanal pepperoni, whole-milk mozzarella, fiery chili flakes, and slow-infused habanero honey.",
      basePrice: 740,
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      spiceLevel: 2,
      allergens: JSON.stringify(["Dairy", "Gluten"]),
      preparationTimeMinutes: 20,
      isAvailable: true,
      isFeatured: true,
      displayOrder: 3,
    },
  });

  // Item 6: Bronze-Die Cacio e Pepe
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catPastas.id,
      name: "Artisanal Cacio e Pepe Tagliolini",
      slug: "cacio-e-pepe-tagliolini",
      description: "House-extruded fresh tagliolini tossed with 24-month aged Pecorino Romano and toasted Tellicherry peppercorn emulsion.",
      basePrice: 590,
      imageUrl: "/images/menu/cacio-e-pepe.jpg",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      spiceLevel: 1,
      allergens: JSON.stringify(["Dairy", "Gluten", "Egg"]),
      preparationTimeMinutes: 18,
      isAvailable: true,
      isFeatured: false,
      displayOrder: 1,
    },
  });

  // Item 7: Slow-Braised Lamb Ragu Pappardelle
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catPastas.id,
      name: "Braised Lamb Shank Pappardelle",
      slug: "braised-lamb-shank-pappardelle",
      description: "6-hour slow-cooked tender pulled lamb shank, rich rosemary tomato jus, wide bronze-cut ribbons, and grated Parmigiano Reggiano.",
      basePrice: 760,
      imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      spiceLevel: 1,
      allergens: JSON.stringify(["Dairy", "Gluten"]),
      preparationTimeMinutes: 22,
      isAvailable: true,
      isFeatured: true,
      displayOrder: 2,
    },
  });

  // Item 8: Charred Wood-Roasted Seabass
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catMains.id,
      name: "Wood-Fired Coastal Seabass",
      slug: "wood-fired-coastal-seabass",
      description: "Pan-crisped whole sea bass fillet baked over olive wood coals, fennel citrus salad, caperberry vinaigrette, and crushed baby potatoes.",
      basePrice: 890,
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      spiceLevel: 1,
      allergens: JSON.stringify(["Fish"]),
      preparationTimeMinutes: 25,
      isAvailable: true,
      isFeatured: true,
      displayOrder: 1,
    },
  });

  // Item 9: Ember-Charred Butternut Squash (Vegan)
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catMains.id,
      name: "Ember-Charred Butternut Squash",
      slug: "ember-charred-butternut-squash",
      description: "Spiced roasted butternut squash steaks, whipped cashew garlic crème, pomegranate molasses reduction, toasted pumpkin seeds, and mint.",
      basePrice: 520,
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      spiceLevel: 1,
      allergens: JSON.stringify(["Nuts"]),
      preparationTimeMinutes: 20,
      isAvailable: true,
      isFeatured: false,
      displayOrder: 2,
    },
  });

  // Item 10: Burnt Basque Olive Oil Cheesecake
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catDesserts.id,
      name: "Burnt Basque Olive Oil Cheesecake",
      slug: "burnt-basque-cheesecake",
      description: "Caramelized crust with a molten creamy center, finished with extra virgin olive oil and Maldon smoked sea salt flakes.",
      basePrice: 420,
      imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      spiceLevel: 0,
      allergens: JSON.stringify(["Dairy", "Egg"]),
      preparationTimeMinutes: 10,
      isAvailable: true,
      isFeatured: true,
      displayOrder: 1,
    },
  });

  // Item 11: Smoked Rosemary Paloma (Mocktail)
  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catBeverages.id,
      name: "Smoked Rosemary & Pink Grapefruit Elixir",
      slug: "smoked-rosemary-pink-grapefruit",
      description: "Freshly pressed ruby grapefruit juice, torched garden rosemary sprig, lime cordial, sparkling pink tonic, and volcanic black salt rim.",
      basePrice: 280,
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      spiceLevel: 0,
      allergens: "[]",
      preparationTimeMinutes: 5,
      isAvailable: true,
      isFeatured: true,
      displayOrder: 1,
    },
  });

  // 6. Coupons
  await prisma.coupon.create({
    data: {
      restaurantId: restaurant.id,
      code: "EMBER10",
      description: "10% off your entire meal on orders above ₹500",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 500,
      maxDiscountAmount: 150,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2027-12-31"),
      maxUses: 500,
      currentUses: 14,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      restaurantId: restaurant.id,
      code: "WELCOME100",
      description: "Flat ₹100 instant discount on orders above ₹600",
      discountType: "FIXED",
      discountValue: 100,
      minOrderValue: 600,
      maxDiscountAmount: 100,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2027-12-31"),
      maxUses: 200,
      currentUses: 8,
      isActive: true,
    },
  });

  // 7. Sample Realistic Reservations
  await prisma.reservation.create({
    data: {
      bookingRef: "RES-4019",
      restaurantId: restaurant.id,
      customerName: "Aarav Sharma",
      customerPhone: "+91 98201 12345",
      customerEmail: "aarav.sharma@example.com",
      guestCount: 2,
      reservationDate: "2026-11-02",
      timeSlot: "19:30",
      tableAssignment: "Hearth Booth 4",
      specialRequests: "Anniversary dinner, quiet corner booth requested",
      status: "CONFIRMED",
      staffNotes: "Complimentary chef's welcome prosecco glass arranged",
    },
  });

  await prisma.reservation.create({
    data: {
      bookingRef: "RES-5820",
      restaurantId: restaurant.id,
      customerName: "Priya Nair",
      customerPhone: "+91 98450 67890",
      customerEmail: "priya.nair@example.com",
      guestCount: 4,
      reservationDate: "2026-11-03",
      timeSlot: "20:00",
      tableAssignment: null,
      specialRequests: "One guest has a severe peanut allergy",
      status: "PENDING",
      staffNotes: "Awaiting staff table re-allocation",
    },
  });

  // 8. Sample Realistic Orders
  const sampleOrder = await prisma.order.create({
    data: {
      publicCode: "OE-892401",
      restaurantId: restaurant.id,
      customerName: "Rohan Varma",
      customerPhone: "+91 99001 54321",
      customerEmail: "rohan.v@example.com",
      fulfilmentType: "DELIVERY",
      deliveryAddress: "Apartment 4B, Emerald Heights, Indiranagar, Bengaluru",
      deliveryInstructions: "Ring bell and leave at door.",
      subtotal: 1400.0,
      discountTotal: 140.0,
      taxTotal: 63.0,
      deliveryFee: 0.0,
      finalTotal: 1323.0,
      couponCode: "EMBER10",
      status: "PREPARING",
      paymentStatus: "PAID",
      paymentMethod: "CASH_ON_DELIVERY",
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: sampleOrder.id,
      itemNameSnapshot: "Smoked Ember Margherita",
      unitPriceSnapshot: 620.0,
      quantity: 1,
      itemTotalSnapshot: 620.0,
      specialInstructions: "Extra crispy crust please",
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: sampleOrder.id,
      itemNameSnapshot: "Wild Mushroom & Black Truffle",
      unitPriceSnapshot: 780.0,
      quantity: 1,
      itemTotalSnapshot: 780.0,
    },
  });

  // 9. Initial Activity Logs
  await prisma.activityLog.create({
    data: {
      restaurantId: restaurant.id,
      userId: adminUser.id,
      userName: adminUser.name,
      action: "RESTAURANT_INITIALIZED",
      entityType: "RESTAURANT",
      entityId: restaurant.id,
      detailsJson: JSON.stringify({ message: "Initial menu, categories, and settings seeded." }),
    },
  });

  console.log("✅ Seed completed successfully! Sample restaurant 'Olive & Ember Kitchen' created.");
  console.log("🔑 Admin credentials: admin@oliveandember.demo / AdminPass@2026");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
