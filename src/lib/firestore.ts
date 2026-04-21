import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  nameHe?: string | null;
  category: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  variants: ProductVariant[];
  createdAt?: string;
}

export interface ProductVariant {
  nameAr: string;
  price: number;
}

export interface Order {
  id: string;
  userId?: string | null;
  customerPhone: string;
  customerName?: string | null;
  status: "new" | "preparing" | "ready" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
  notes?: string | null;
  deliveryAddress?: string | null;
  deliveryType: "delivery" | "pickup";
  paymentMethod: "cash" | "card" | "online";
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productNameAr: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface StoreSettings {
  isOpen: boolean;
  deliveryEnabled: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  storeName: string;
  storePhone: string;
  storeAddress: string;
}

export interface User {
  id: string;
  phone: string;
  role: "user" | "admin";
  otpCode?: string;
  otpExpiresAt?: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tsToISO(val: any): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val?.seconds) return new Date(val.seconds * 1000).toISOString();
  return String(val);
}

function docToProduct(d: DocumentData & { id: string }): Product {
  const data = d;
  return {
    id: d.id,
    name: data.name || data.nameAr || "",
    nameAr: data.nameAr || "",
    nameHe: data.nameHe || null,
    category: data.category || "",
    price: Number(data.price || 0),
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    isActive: data.isActive !== false,
    sortOrder: Number(data.sortOrder || 0),
    variants: data.variants ?? [],
    createdAt: tsToISO(data.createdAt),
  };
}

function docToOrder(d: DocumentData & { id: string }): Order {
  const data = d;
  return {
    id: d.id,
    userId: data.userId || null,
    customerPhone: data.customerPhone || "",
    customerName: data.customerName || null,
    status: data.status || "new",
    total: Number(data.total || 0),
    items: data.items || [],
    notes: data.notes || null,
    deliveryAddress: data.deliveryAddress || null,
    deliveryType: data.deliveryType || "pickup",
    paymentMethod: data.paymentMethod || "cash",
    createdAt: tsToISO(data.createdAt),
    updatedAt: tsToISO(data.updatedAt),
  };
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(category?: string): Promise<Product[]> {
  const col = collection(db, "products");
  const q = query(col, orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  let products = snap.docs
    .map((d) => docToProduct({ id: d.id, ...d.data() }))
    .filter((p) => p.isActive);
  if (category && category !== "الكل") {
    return products.filter((p) => p.category === category);
  }
  return products;
}

export function subscribeToProducts(
  category: string | undefined,
  callback: (products: Product[]) => void
): () => void {
  const col = collection(db, "products");
  const q = query(col, orderBy("sortOrder", "asc"));
  return onSnapshot(q, (snap) => {
    let products = snap.docs
      .map((d) => docToProduct({ id: d.id, ...d.data() }))
      .filter((p) => p.isActive);
    if (category && category !== "الكل") {
      products = products.filter((p) => p.category === category);
    }
    callback(products);
  });
}

export async function getAllProducts(): Promise<Product[]> {
  const col = collection(db, "products");
  const q = query(col, orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToProduct({ id: d.id, ...d.data() }));
}

export async function createProduct(data: Omit<Product, "id" | "createdAt">): Promise<Product> {
  const col = collection(db, "products");
  const ref = await addDoc(col, { ...data, createdAt: serverTimestamp() });
  const snap = await getDoc(ref);
  return docToProduct({ id: ref.id, ...snap.data() });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const ref = doc(db, "products", id);
  await updateDoc(ref, { ...data });
  const snap = await getDoc(ref);
  return docToProduct({ id, ...snap.data() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

export async function toggleProduct(id: string): Promise<Product> {
  const ref = doc(db, "products", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Product not found");
  const current = snap.data().isActive !== false;
  await updateDoc(ref, { isActive: !current });
  const updated = await getDoc(ref);
  return docToProduct({ id, ...updated.data() });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(data: {
  customerPhone: string;
  customerName?: string;
  items: Array<{
    productId: string;
    variantName?: string;
    variantPrice?: number;
    quantity: number;
  }>;
  notes?: string;
  deliveryAddress?: string;
  deliveryType: "delivery" | "pickup";
  paymentMethod: "cash" | "card" | "online";
  userId?: string | null;
}): Promise<Order> {

 const finalUserId = String(data.userId || data.customerPhone);
  
  const products = await Promise.all(
    data.items.map(async (item) => {
      const ref = doc(db, "products", item.productId);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error(`المنتج غير موجود: ${item.productId}`);
      return { ...docToProduct({ id: snap.id, ...snap.data() }), qty: item.quantity, variantName: item.variantName, variantPrice: item.variantPrice };
    })
  );

  let total = 0;
  const orderItems: OrderItem[] = products.map((p) => {
    let price = p.price;
    let label = "";
    if (p.variantName && p.variantPrice) {
      const variants = p.variants ?? [];
      const matched = variants.find((v) => v.nameAr === p.variantName);
      if (matched) { price = matched.price; label = matched.nameAr; }
      else { price = Number(p.variantPrice); label = p.variantName; }
    }
    const subtotal = price * p.qty;
    total += subtotal;
    return {
      productId: p.id,
      productName: p.name,
      productNameAr: p.nameAr + (label ? ` — ${label}` : ""),
      quantity: p.qty,
      price,
      subtotal,
    };
  });

  if (data.deliveryType === "delivery") total += 15;

  const now = new Date().toISOString();

const orderData = {
  userId: String(finalUserId), // 🔥 مهم جداً
    customerPhone: data.customerPhone,
    customerName: data.customerName || null,
    status: "new",
    total,
    items: orderItems,
    notes: data.notes || null,
    deliveryAddress: data.deliveryAddress || null,
    deliveryType: data.deliveryType,
    paymentMethod: data.paymentMethod,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    
  };
  

  const col = collection(db, "orders");
  const ref = await addDoc(col, orderData);

  try {
    const BASE = (window as any).__viteBasePath__ || "/";
    const itemsSummary = orderItems.map((i) => `${i.productNameAr} x${i.quantity}`).join("، ");
    await fetch(`${BASE}api/notify-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: ref.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        itemsSummary,
        total,
        paymentMethod: data.paymentMethod,
        deliveryType: data.deliveryType,
        deliveryAddress: data.deliveryAddress,
      }),
    });
  } catch {}

return {
  id: ref.id,
  userId: data.userId || data.customerPhone,
    customerPhone: data.customerPhone,
    customerName: data.customerName || null,
    status: "new",
    total,
    items: orderItems,
    notes: data.notes || null,
    deliveryAddress: data.deliveryAddress || null,
    deliveryType: data.deliveryType,
    paymentMethod: data.paymentMethod,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getMyOrders(userId: string): Promise<Order[]> {
  const col = collection(db, "orders");

  const snap = await getDocs(query(col, orderBy("createdAt", "desc")));

  const allOrders = snap.docs.map(d =>
    docToOrder({ id: d.id, ...d.data() })
  );

  // 🔥 الحل القوي
  return allOrders.filter(o =>
    String(o.userId) === String(userId) ||
    String(o.customerPhone) === String(userId)
  );
}
export async function getAllOrders(status?: string): Promise<Order[]> {
  const col = collection(db, "orders");
  const q = query(col, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => docToOrder({ id: d.id, ...d.data() }));
  if (status && status !== "all") return orders.filter((o) => o.status === status);
  return orders;
}

export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
  const col = collection(db, "orders");
  const q = query(col, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => docToOrder({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  const ref = doc(db, "orders", id);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });

  try {
    const snap = await getDoc(ref);
    const order = docToOrder({ id, ...snap.data() });
    const BASE = (window as any).__viteBasePath__ || "/";
    await fetch(`${BASE}api/notify-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, status, customerPhone: order.customerPhone, deliveryType: order.deliveryType }),
    });
  } catch {}

  const snap = await getDoc(ref);
  return docToOrder({ id, ...snap.data() });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: StoreSettings = {
  isOpen: true,
  deliveryEnabled: true,
  deliveryFee: 15,
  minOrderAmount: 0,
  storeName: "ليكير",
  storePhone: "",
  storeAddress: "",
};

export async function getSettings(): Promise<StoreSettings> {
  try {
    const ref = doc(db, "settings", "store");
    const snap = await getDoc(ref);
    if (!snap.exists()) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...snap.data() } as StoreSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
  const ref = doc(db, "settings", "store");
  await setDoc(ref, data, { merge: true });
  const snap = await getDoc(ref);
  return { ...DEFAULT_SETTINGS, ...snap.data() } as StoreSettings;
}

// ─── Auth / Users ─────────────────────────────────────────────────────────────

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phone: string): Promise<{ otp: string; fromServer: boolean }> {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const usersCol = collection(db, "users");
  const q = query(usersCol, where("phone", "==", phone));
  const snap = await getDocs(q);

  if (snap.empty) {
    await addDoc(usersCol, {
      phone,
      role: "user",
      otpCode: otp,
      otpExpiresAt: expiresAt,
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(snap.docs[0].ref, { otpCode: otp, otpExpiresAt: expiresAt });
  }

  try {
    const BASE = (window as any).__viteBasePath__ || "/";
    const resp = await fetch(`${BASE}api/send-sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    if (resp.ok) return { otp, fromServer: true };
  } catch {}

  return { otp, fromServer: false };
}

export async function verifyOtp(phone: string, otp: string): Promise<User> {
  const usersCol = collection(db, "users");
  const q = query(usersCol, where("phone", "==", phone));
  const snap = await getDocs(q);

  if (snap.empty) throw new Error("رقم الهاتف غير مسجل");

  const userDoc = snap.docs[0];
  const data = userDoc.data();

  if (data.otpCode !== otp) throw new Error("رمز التحقق غير صحيح");

  const expiresAt = new Date(data.otpExpiresAt);
  if (new Date() > expiresAt) throw new Error("انتهت صلاحية رمز التحقق");

  await updateDoc(userDoc.ref, { otpCode: null, otpExpiresAt: null });

  return {
    id: userDoc.id,
    phone: data.phone,
    role: data.role || "user",
    createdAt: tsToISO(data.createdAt),
  };
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const usersCol = collection(db, "users");
  const q = query(usersCol, where("phone", "==", phone));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    phone: data.phone,
    role: data.role || "user",
    createdAt: tsToISO(data.createdAt),
  };
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const orders = await getAllOrders();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt) >= todayStart && o.status !== "cancelled"
  );
  const monthOrders = orders.filter(
    (o) => new Date(o.createdAt) >= monthStart && o.status !== "cancelled"
  );
  const pendingOrders = orders.filter(
    (o) => o.status === "new" || o.status === "preparing"
  );

  const products = await getAllProducts();

  return {
    todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
    todayOrders: todayOrders.length,
    pendingOrders: pendingOrders.length,
    monthRevenue: monthOrders.reduce((s, o) => s + o.total, 0),
    totalProducts: products.filter((p) => p.isActive).length,
    totalOrders: orders.length,
  };
}

export async function getDailyRevenue(date?: Date) {
  const d = date || new Date();
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

  const orders = await getAllOrders();
  const dayOrders = orders.filter(
    (o) => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) < dayEnd && o.status !== "cancelled"
  );

  const hourlyMap: Record<string, { revenue: number; orders: number }> = {};
  for (let h = 0; h < 24; h++) {
    const label = `${h.toString().padStart(2, "0")}:00`;
    hourlyMap[label] = { revenue: 0, orders: 0 };
  }

  for (const order of dayOrders) {
    const hour = new Date(order.createdAt).getHours();
    const label = `${hour.toString().padStart(2, "0")}:00`;
    hourlyMap[label].revenue += order.total;
    hourlyMap[label].orders += 1;
  }

  const breakdown = Object.entries(hourlyMap).map(([label, data]) => ({ label, ...data }));
  const total = dayOrders.reduce((s, o) => s + o.total, 0);
  return { total, orderCount: dayOrders.length, breakdown };
}

export async function getMonthlyRevenue(year?: number, month?: number) {
  const now = new Date();
  const y = year || now.getFullYear();
  const m = month || now.getMonth() + 1;

  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 1);

  const orders = await getAllOrders();
  const monthOrders = orders.filter(
    (o) => new Date(o.createdAt) >= monthStart && new Date(o.createdAt) < monthEnd && o.status !== "cancelled"
  );

  const daysInMonth = new Date(y, m, 0).getDate();
  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  for (let day = 1; day <= daysInMonth; day++) {
    const label = `${day}/${m}`;
    dailyMap[label] = { revenue: 0, orders: 0 };
  }

  for (const order of monthOrders) {
    const day = new Date(order.createdAt).getDate();
    const label = `${day}/${m}`;
    dailyMap[label].revenue += order.total;
    dailyMap[label].orders += 1;
  }

  const breakdown = Object.entries(dailyMap).map(([label, data]) => ({ label, ...data }));
  const total = monthOrders.reduce((s, o) => s + o.total, 0);
  return { total, orderCount: monthOrders.length, breakdown };
}
