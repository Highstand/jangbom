import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 · URL과 공개 키는 .env.local에서만 읽는다 (CLAUDE.md 4장 · 키를 코드에 쓰지 않음).
 * 공개(publishable) 키라 브라우저에서도 쓴다. 할 수 있는 일은 테이블의 RLS 정책이 정한다
 * (products 읽기 · favorites 읽기·만들기 · orders 만들기, supabase/schema.sql).
 */
let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(".env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 넣어 주세요.");
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
