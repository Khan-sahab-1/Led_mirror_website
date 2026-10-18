import { products as fallbackProducts } from "@/lib/products";
import { getStoreProducts } from "@/lib/products-server";

export type CheckoutItem = { productId: string; quantity: number };

export async function validateItems(raw: unknown) {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 30) {
    throw new Error("Please add valid items to your cart.");
  }

  const liveProducts = await getStoreProducts();
  const allProducts = [...liveProducts, ...fallbackProducts];

  const items = raw.map((item: any) => {
    const productId = String(item?.productId || "").trim();
    const quantity = Number(item?.quantity);

    const product =
      allProducts.find((p) => p.id === productId) ||
      allProducts.find((p) => p.slug === productId) ||
      (item?.name ? allProducts.find((p) => p.name.toLowerCase() === String(item.name).toLowerCase()) : undefined);

    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error(`One or more cart items are invalid (${productId || "unknown"}).`);
    }

    return { product, quantity };
  });

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  if (total < 1 || total > 2000000) {
    throw new Error("Order total is outside the permitted range.");
  }

  return { items, total };
}
