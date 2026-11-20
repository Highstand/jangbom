"use client";

import { useState } from "react";
import { addresses, delivery } from "@/data/mock";
import { useStore } from "@/data/store";
import { AddressSheet } from "./AddressSheet";

/** 주소 시트 열기 · 열 때마다 새로 마운트한다 */
export function useAddressSheet() {
  const { address, setAddressId } = useStore();
  const [open, setOpen] = useState(false);
  const sheet = open ? (
    <AddressSheet
      addresses={addresses}
      currentId={address.id}
      arrival={delivery.arrival}
      onSave={(id) => {
        setAddressId(id);
        setOpen(false);
      }}
      onClose={() => setOpen(false)}
    />
  ) : null;
  return { openSheet: () => setOpen(true), sheet };
}
