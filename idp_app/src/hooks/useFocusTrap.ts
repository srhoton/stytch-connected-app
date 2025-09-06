import { useEffect, useRef } from 'react';

/**
 * Hook to trap focus within a container element
 * Useful for modals, dialogs, and other overlay components
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) {return;}

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus the first focusable element
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {return;}

      // If there are no focusable elements, prevent tab
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      // Trap focus within the container
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    // Add event listener
    container.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to the previously focused element
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to manage focus for keyboard navigation
 */
export function useKeyboardNavigation(items: HTMLElement[]) {
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (items.length === 0) {return;}

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          currentIndexRef.current = (currentIndexRef.current + 1) % items.length;
          items[currentIndexRef.current]?.focus();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          currentIndexRef.current = (currentIndexRef.current - 1 + items.length) % items.length;
          items[currentIndexRef.current]?.focus();
          break;
        case 'Home':
          event.preventDefault();
          currentIndexRef.current = 0;
          items[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          currentIndexRef.current = items.length - 1;
          items[items.length - 1]?.focus();
          break;
      }
    };

    // Add listeners to all items
    items.forEach((item, index) => {
      item.addEventListener('keydown', handleKeyDown);
      item.addEventListener('focus', () => {
        currentIndexRef.current = index;
      });
    });

    // Cleanup
    return () => {
      items.forEach((item) => {
        item.removeEventListener('keydown', handleKeyDown);
      });
    };
  }, [items]);
}

/**
 * Hook to announce changes to screen readers
 */
export function useAnnouncement() {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a visually hidden live region for announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    document.body.appendChild(announcement);
    announcementRef.current = announcement;

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, []);

  const announce = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return announce;
}