/**
 * Triggers a beautiful inside-app toast notification.
 */
export function showToast(title: string, message: string, type: 'success' | 'info' | 'error' = 'success') {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('show-toast', { detail: { title, message, type } });
    window.dispatchEvent(event);
  }
}

/**
 * Triggers a custom, premium confirmation modal.
 */
export function showConfirm(title: string, message: string, onConfirm: () => void) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('show-confirm', { detail: { title, message, onConfirm } });
    window.dispatchEvent(event);
  }
}
