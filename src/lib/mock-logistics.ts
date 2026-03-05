const COURIERS = ["J&T Express", "LBC Express", "Grab Express", "Flash Express"] as const;

export function getMockCourier(orderId: string): string {
  const charSum = orderId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COURIERS[charSum % COURIERS.length];
}

export function getMockTrackingNumber(orderId: string): string {
  return "TRK-" + orderId.substring(0, 8).toUpperCase();
}

export function getExpectedDelivery(createdAt: string): Date {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 5);
  return date;
}
