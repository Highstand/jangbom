import { supabase } from "@/lib/supabase";
import type { PlacedOrder } from "./types";

/** 주문 번호 · orders는 읽기를 막아 두어(supabase/schema.sql) DB가 만든 값을 되읽지 않고 앱이 만든다 */
function makeOrderNumber() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${date}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
}

/** 결제하기 → orders에 한 줄 저장. 번호가 겹치면(23505) 한 번 더 만든다 */
export async function saveOrder(order: Omit<PlacedOrder, "number">): Promise<PlacedOrder> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const number = makeOrderNumber();
    const { error } = await supabase()
      .from("orders")
      .insert({
        order_number: number,
        items: order.items.map((i) => ({ product_id: i.productId, name: i.name, quantity: i.quantity, price: i.price })),
        item_count: order.items.reduce((n, i) => n + i.quantity, 0),
        subtotal: order.subtotal,
        shipping_fee: order.shippingFee,
        total: order.subtotal + order.shippingFee,
        address_label: order.addressLabel,
        address: order.address,
        arrival_text: order.arrivalText,
      });
    if (!error) return { ...order, number };
    if (error.code !== "23505") throw new Error(`주문을 저장하지 못했어요: ${error.message}`);
  }
  throw new Error("주문 번호가 겹쳐 저장하지 못했어요");
}
