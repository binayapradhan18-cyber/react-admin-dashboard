import type { Role } from '@/features/auth/types';
import {
  type Customer,
  type Order,
  type OrderEvent,
  type OrderItem,
  type OrderStatus,
  type ProductCategory,
} from '@/features/orders/types';
import { DEPARTMENTS, type User, type UserStatus } from '@/features/users/types';
import { createRandom, type Random } from './random';

const FIRST_NAMES = [
  'Olivia',
  'Liam',
  'Emma',
  'Noah',
  'Ava',
  'Elijah',
  'Sophia',
  'James',
  'Isabella',
  'Lucas',
  'Mia',
  'Mateo',
  'Amelia',
  'Ethan',
  'Harper',
  'Arjun',
  'Priya',
  'Kenji',
  'Yuki',
  'Chloe',
  'Daniel',
  'Zara',
  'Omar',
  'Layla',
  'Hugo',
  'Ines',
  'Rohan',
  'Ananya',
  'Leo',
  'Nora',
  'Samuel',
  'Aisha',
  'Felix',
  'Clara',
  'Diego',
  'Lucia',
  'Mason',
  'Grace',
  'Ivan',
  'Elena',
] as const;

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Lopez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Moore',
  'Martin',
  'Lee',
  'Patel',
  'Sharma',
  'Tanaka',
  'Kim',
  'Nguyen',
  'Chen',
  'Silva',
  'Rossi',
  'Muller',
  'Novak',
  'Dubois',
  'Khan',
  'Iyer',
  'Okafor',
  'Fischer',
  'Costa',
  'Larsen',
  'Haddad',
  'Reyes',
  'Walker',
  'Young',
  'Hall',
  'Allen',
  'Wright',
] as const;

const CITIES = [
  ['Seattle', 'United States'],
  ['Austin', 'United States'],
  ['Toronto', 'Canada'],
  ['London', 'United Kingdom'],
  ['Berlin', 'Germany'],
  ['Lisbon', 'Portugal'],
  ['Bengaluru', 'India'],
  ['Singapore', 'Singapore'],
  ['Sydney', 'Australia'],
  ['Tokyo', 'Japan'],
] as const;

const STREETS = ['Maple Ave', 'Harbor St', 'Oak Lane', 'Station Rd', 'Park Blvd', 'Hill St'];

interface Product {
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
}

const PRODUCTS: Product[] = [
  { sku: 'EL-100', name: 'Noise-cancelling headphones', category: 'Electronics', price: 249 },
  { sku: 'EL-101', name: 'Mechanical keyboard', category: 'Electronics', price: 139 },
  { sku: 'EL-102', name: '4K monitor', category: 'Electronics', price: 429 },
  { sku: 'EL-103', name: 'USB-C dock', category: 'Electronics', price: 89 },
  { sku: 'AP-200', name: 'Merino crew sweater', category: 'Apparel', price: 98 },
  { sku: 'AP-201', name: 'Rain shell jacket', category: 'Apparel', price: 165 },
  { sku: 'AP-202', name: 'Everyday sneakers', category: 'Apparel', price: 120 },
  { sku: 'HM-300', name: 'Pour-over coffee set', category: 'Home', price: 64 },
  { sku: 'HM-301', name: 'Linen bedding set', category: 'Home', price: 189 },
  { sku: 'HM-302', name: 'Cast iron skillet', category: 'Home', price: 45 },
  { sku: 'SP-400', name: 'Yoga mat', category: 'Sports', price: 58 },
  { sku: 'SP-401', name: 'Adjustable dumbbells', category: 'Sports', price: 299 },
  { sku: 'SP-402', name: 'Trail running pack', category: 'Sports', price: 85 },
  { sku: 'BK-500', name: 'Designing Data-Intensive Applications', category: 'Books', price: 42 },
  { sku: 'BK-501', name: 'Refactoring UI', category: 'Books', price: 79 },
  { sku: 'BK-502', name: 'The Pragmatic Programmer', category: 'Books', price: 38 },
];

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export const SEED_USER_COUNT = 500;
export const SEED_ORDER_COUNT = 2000;
const CUSTOMER_COUNT = 650;
const ORDER_WINDOW_DAYS = 120;

const pad = (value: number, width: number) => String(value).padStart(width, '0');
const slug = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '');

function generateUsers(random: Random, now: number): User[] {
  const emails = new Set<string>();
  const users: User[] = [];

  for (let i = 1; i <= SEED_USER_COUNT; i++) {
    const first = random.pick(FIRST_NAMES);
    const last = random.pick(LAST_NAMES);
    let email = `${slug(first)}.${slug(last)}@northwind.io`;
    for (let n = 2; emails.has(email); n++) email = `${slug(first)}.${slug(last)}${n}@northwind.io`;
    emails.add(email);

    const role = random.weighted<Role>({ admin: 5, manager: 20, viewer: 75 });
    const status = random.weighted<UserStatus>({ active: 80, invited: 12, suspended: 8 });
    const createdAt = now - random.int(1, 730) * DAY - random.int(0, 23) * HOUR;
    const lastActiveAt =
      status === 'invited' ? null : Math.max(createdAt, now - random.int(0, 60 * 24) * HOUR);

    users.push({
      id: `usr_${pad(i, 4)}`,
      name: `${first} ${last}`,
      email,
      role,
      status,
      department: random.pick(DEPARTMENTS),
      createdAt: new Date(createdAt).toISOString(),
      lastActiveAt: lastActiveAt === null ? null : new Date(lastActiveAt).toISOString(),
    });
  }
  return users;
}

function generateCustomers(random: Random): Customer[] {
  return Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
    const first = random.pick(FIRST_NAMES);
    const last = random.pick(LAST_NAMES);
    return {
      id: `cus_${pad(index + 1, 4)}`,
      name: `${first} ${last}`,
      email: `${slug(first)}.${slug(last)}${index + 1}@example.com`,
    };
  });
}

function generateItems(random: Random): OrderItem[] {
  const count = random.weighted({ '1': 50, '2': 30, '3': 15, '4': 5 });
  const chosen = new Map<string, OrderItem>();
  for (let i = 0; i < Number(count); i++) {
    const product = random.pick(PRODUCTS);
    const existing = chosen.get(product.sku);
    if (existing) {
      existing.quantity += 1;
      continue;
    }
    chosen.set(product.sku, {
      sku: product.sku,
      name: product.name,
      category: product.category,
      quantity: Number(random.weighted({ '1': 75, '2': 20, '3': 5 })),
      unitPrice: product.price,
    });
  }
  return [...chosen.values()];
}

/**
 * Plans the full lifecycle of an order and keeps only the events that have
 * already happened relative to `now`, so status and timeline always agree.
 */
function generateTimeline(random: Random, createdAt: number, now: number): OrderEvent[] {
  const outcome = random.weighted({ fulfilled: 88, cancelled: 6, refunded: 6 });
  const planned: OrderEvent[] = [];
  const push = (status: OrderStatus, at: number, note: string) =>
    planned.push({ status, at: new Date(at).toISOString(), note });

  push('pending', createdAt, 'Order placed');
  const paidAt = createdAt + random.int(2, 90) * 60_000;

  if (outcome === 'cancelled') {
    push('cancelled', createdAt + random.int(1, 36) * HOUR, 'Cancelled at customer request');
  } else {
    push('paid', paidAt, 'Payment captured');
    const shippedAt = paidAt + random.int(12, 60) * HOUR;
    push('shipped', shippedAt, `Shipped via ${random.pick(['UPS', 'DHL', 'FedEx'])}`);
    const deliveredAt = shippedAt + random.int(24, 120) * HOUR;
    push('delivered', deliveredAt, 'Delivered');
    if (outcome === 'refunded') {
      push('refunded', deliveredAt + random.int(1, 10) * DAY, 'Refund issued');
    }
  }

  return planned.filter((event) => new Date(event.at).getTime() <= now);
}

function generateOrders(random: Random, now: number): Order[] {
  const customers = generateCustomers(random);
  const drafts = Array.from({ length: SEED_ORDER_COUNT }, () => {
    // Skewed towards recent days so revenue shows a growth trend.
    const ageMs = ORDER_WINDOW_DAYS * DAY * (1 - Math.sqrt(random.next()));
    return Math.round(now - ageMs);
  }).sort((a, b) => a - b);

  return drafts.map((createdAt, index) => {
    const items = generateItems(random);
    const timeline = generateTimeline(random, createdAt, now);
    const latest = timeline[timeline.length - 1];
    const [city, country] = random.pick(CITIES);
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const id = pad(index + 1, 5);

    return {
      id: `ord_${id}`,
      number: `NW-${10000 + index + 1}`,
      customer: random.pick(customers),
      status: latest?.status ?? 'pending',
      total,
      createdAt: new Date(createdAt).toISOString(),
      updatedAt: latest?.at ?? new Date(createdAt).toISOString(),
      items,
      timeline,
      shippingAddress: { line1: `${random.int(10, 999)} ${random.pick(STREETS)}`, city, country },
    };
  });
}

export interface SeedData {
  users: User[];
  orders: Order[];
}

export function generateSeed(now: Date, seed = 20240601): SeedData {
  const random = createRandom(seed);
  const timestamp = now.getTime();
  return { users: generateUsers(random, timestamp), orders: generateOrders(random, timestamp) };
}
