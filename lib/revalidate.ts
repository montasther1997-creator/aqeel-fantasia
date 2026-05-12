import { revalidatePath } from 'next/cache';

/**
 * Bust the Next.js full-route cache for public pages whose content depends on
 * the admin entity being mutated. Each entity maps to one or more paths.
 *
 * Safe to call even if the path has no cache entry — Next will simply no-op.
 */
export function revalidateForEntity(entity:
  | 'product' | 'category' | 'collection' | 'note' | 'slide'
  | 'new-arrival' | 'made-for-one' | 'content' | 'shipping' | 'discount'
  | 'archive' | 'setting' | 'newsletter'
) {
  try {
    switch (entity) {
      case 'product':
      case 'category':
      case 'collection':
      case 'new-arrival':
      case 'slide':
        revalidatePath('/[locale]/home', 'page');
        revalidatePath('/[locale]/collections', 'page');
        revalidatePath('/[locale]', 'page');
        revalidatePath('/[locale]/product/[slug]', 'page');
        break;
      case 'note':
        revalidatePath('/[locale]/home', 'page');
        break;
      case 'made-for-one':
        revalidatePath('/[locale]/made-for-me', 'page');
        break;
      case 'content':
      case 'setting':
        revalidatePath('/', 'layout');
        break;
      case 'shipping':
      case 'discount':
      case 'archive':
      case 'newsletter':
        // not visible on public pages, no-op
        break;
    }
  } catch {
    // revalidatePath throws if called outside a Server Action / route handler
    // — silently ignore so dev/seed scripts don't break.
  }
}
