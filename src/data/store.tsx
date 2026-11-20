"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { addresses, delivery, initialCart } from "./mock";
import { saveOrder } from "./orders";
import type { Address, Catalog, PlacedOrder, Product } from "./types";

type Line = { id: string; qty: number };
type Swap = { from: string; to: string };

type Store = {
  /** Supabase products */
  products: Record<string, Product>;
  /** Supabase favorites (자주 사는 상품) · 상품 정보와 구매 횟수 */
  favorites: { product: Product; purchaseCount: number }[];
  address: Address;
  setAddressId: (id: string) => void;
  lines: Line[];
  qtyOf: (id: string) => number;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  /** 내일 아침 도착 상품 */
  deliverable: { product: Product; qty: number }[];
  /** 불가 상품 (이번 주문에서 빠짐) */
  unavailable: { product: Product; qty: number }[];
  deliverableCount: number;
  subtotal: number;
  /** 장바구니에 상품별 예외 마감이 있으면 배너 예외 줄 문구 (17_improvements 문제 3) */
  bannerException?: string;
  swapped: Swap | null;
  swap: (from: string) => void;
  undoSwap: () => void;
  /** 결제하기 → Supabase orders에 한 줄 저장하고 장바구니를 비운다 */
  placeOrder: () => Promise<PlacedOrder>;
  placedOrder: PlacedOrder | null;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  const { products } = catalog;
  const [addressId, setAddressId] = useState(addresses[0].id);
  const [lines, setLines] = useState<Line[]>(() => initialCart.filter((l) => products[l.id]));
  const [swapped, setSwapped] = useState<Swap | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  const store = useMemo<Store>(() => {
    const address = addresses.find((a) => a.id === addressId) ?? addresses[0];
    const withProduct = lines.filter((l) => products[l.id]).map((l) => ({ product: products[l.id], qty: l.qty }));
    const deliverable = withProduct.filter((l) => l.product.arrival === "confirmed");
    const unavailable = withProduct.filter((l) => l.product.arrival === "unavailable");
    const subtotal = deliverable.reduce((n, l) => n + l.qty * l.product.price, 0);
    const cutoff = unavailable.find((l) => l.product.cutoff)?.product.cutoff;
    return {
      products,
      favorites: catalog.favorites.map((f) => ({ product: products[f.productId], purchaseCount: f.purchaseCount })),
      address,
      setAddressId,
      lines,
      qtyOf: (id) => lines.find((l) => l.id === id)?.qty ?? 0,
      add: (id) => setLines((ls) => (ls.some((l) => l.id === id) ? ls : [...ls, { id, qty: 1 }])),
      setQty: (id, qty) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l))),
      remove: (id) => setLines((ls) => ls.filter((l) => l.id !== id)),
      deliverable,
      unavailable,
      deliverableCount: deliverable.reduce((n, l) => n + l.qty, 0),
      subtotal,
      bannerException: cutoff ? `일부 상품은 ${cutoff} 마감이에요` : undefined,
      swapped,
      swap: (from) => {
        const to = products[from]?.substituteId;
        if (!to || !products[to]) return;
        setLines((ls) => {
          const qty = ls.find((l) => l.id === from)?.qty ?? 1;
          const rest = ls.filter((l) => l.id !== from && l.id !== to);
          const firstOk = rest.findIndex((l) => products[l.id]?.arrival === "confirmed");
          const at = firstOk === -1 ? rest.length : firstOk;
          return [...rest.slice(0, at), { id: to, qty }, ...rest.slice(at)];
        });
        setSwapped({ from, to });
      },
      undoSwap: () => {
        if (!swapped) return;
        setLines((ls) => [{ id: swapped.from, qty: ls.find((l) => l.id === swapped.to)?.qty ?? 1 }, ...ls.filter((l) => l.id !== swapped.to)]);
        setSwapped(null);
      },
      placeOrder: async () => {
        const order = await saveOrder({
          items: deliverable.map(({ product, qty }) => ({ productId: product.id, name: product.name, quantity: qty, price: product.price })),
          subtotal,
          shippingFee: delivery.shipping,
          addressLabel: address.label,
          address: `${address.street} ${address.detail}`,
          arrivalText: `${delivery.arrival} 도착`,
        });
        setPlacedOrder(order);
        setLines([]);
        setSwapped(null);
        return order;
      },
      placedOrder,
    };
  }, [addressId, lines, swapped, placedOrder, products, catalog.favorites]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error("StoreProvider 밖에서 useStore를 불렀어요");
  return s;
}
