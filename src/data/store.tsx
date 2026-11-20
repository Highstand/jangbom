"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { addresses, alternatives, initialCart, products } from "./mock";
import type { Address, Product } from "./types";

type Line = { id: string; qty: number };
type Swap = { from: string; to: string };

type Store = {
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
  swapped: Swap | null;
  swap: (from: string) => void;
  undoSwap: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [addressId, setAddressId] = useState(addresses[0].id);
  const [lines, setLines] = useState<Line[]>(initialCart);
  const [swapped, setSwapped] = useState<Swap | null>(null);

  const store = useMemo<Store>(() => {
    const withProduct = lines.map((l) => ({ product: products[l.id], qty: l.qty }));
    const deliverable = withProduct.filter((l) => l.product.arrival === "confirmed");
    const unavailable = withProduct.filter((l) => l.product.arrival === "unavailable");
    return {
      address: addresses.find((a) => a.id === addressId) ?? addresses[0],
      setAddressId,
      lines,
      qtyOf: (id) => lines.find((l) => l.id === id)?.qty ?? 0,
      add: (id) => setLines((ls) => (ls.some((l) => l.id === id) ? ls : [...ls, { id, qty: 1 }])),
      setQty: (id, qty) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l))),
      remove: (id) => setLines((ls) => ls.filter((l) => l.id !== id)),
      deliverable,
      unavailable,
      deliverableCount: deliverable.reduce((n, l) => n + l.qty, 0),
      subtotal: deliverable.reduce((n, l) => n + l.qty * l.product.price, 0),
      swapped,
      swap: (from) => {
        const to = alternatives[from];
        if (!to) return;
        setLines((ls) => {
          const qty = ls.find((l) => l.id === from)?.qty ?? 1;
          const rest = ls.filter((l) => l.id !== from && l.id !== to);
          const firstOk = rest.findIndex((l) => products[l.id].arrival === "confirmed");
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
    };
  }, [addressId, lines, swapped]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error("StoreProvider 밖에서 useStore를 불렀어요");
  return s;
}
