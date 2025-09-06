"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function DateTimeUrlSync() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    const time = now.toTimeString().slice(0, 5);
    const params = new URLSearchParams(window.location.search);
    let updated = false;
    if (params.get('date') !== date) {
      params.set('date', date);
      updated = true;
    }
    if (params.get('time') !== time) {
      params.set('time', time);
      updated = true;
    }
    if (updated) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [router, pathname]);

  return null;
}

export default DateTimeUrlSync;
