/**
 * Navigation service to abstract window.location dependencies
 * This makes the code more testable and provides a single place to manage navigation
 */

export interface NavigationService {
  getCurrentUrl(): string;
  getHostname(): string;
  getOrigin(): string;
  getPathname(): string;
  getSearchParams(): URLSearchParams;
  navigateTo(url: string): void;
  reload(): void;
  replaceUrl(url: string): void;
  goBack(): void;
}

class BrowserNavigationService implements NavigationService {
  getCurrentUrl(): string {
    return window.location.href;
  }

  getHostname(): string {
    return window.location.hostname;
  }

  getOrigin(): string {
    return window.location.origin;
  }

  getPathname(): string {
    return window.location.pathname;
  }

  getSearchParams(): URLSearchParams {
    return new URLSearchParams(window.location.search);
  }

  navigateTo(url: string): void {
    window.location.href = url;
  }

  reload(): void {
    window.location.reload();
  }

  replaceUrl(url: string): void {
    window.location.replace(url);
  }

  goBack(): void {
    window.history.back();
  }
}

// Mock implementation for testing
export class MockNavigationService implements NavigationService {
  private currentUrl: string = 'http://localhost:3000';
  private history: string[] = [];

  constructor(initialUrl?: string) {
    if (initialUrl) {
      this.currentUrl = initialUrl;
    }
    this.history.push(this.currentUrl);
  }

  getCurrentUrl(): string {
    return this.currentUrl;
  }

  getHostname(): string {
    return new URL(this.currentUrl).hostname;
  }

  getOrigin(): string {
    return new URL(this.currentUrl).origin;
  }

  getPathname(): string {
    return new URL(this.currentUrl).pathname;
  }

  getSearchParams(): URLSearchParams {
    return new URLSearchParams(new URL(this.currentUrl).search);
  }

  navigateTo(url: string): void {
    this.currentUrl = url;
    this.history.push(url);
  }

  reload(): void {
    // In mock, reload doesn't change the URL
  }

  replaceUrl(url: string): void {
    this.currentUrl = url;
    // Replace doesn't add to history, just updates the last entry
    if (this.history.length > 0) {
      this.history[this.history.length - 1] = url;
    } else {
      this.history.push(url);
    }
  }

  goBack(): void {
    if (this.history.length > 1) {
      this.history.pop();
      this.currentUrl = this.history[this.history.length - 1] || this.currentUrl;
    }
  }

  // Test helper methods
  getHistory(): string[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [this.currentUrl];
  }
}

// Factory function to create the appropriate service
export function createNavigationService(): NavigationService {
  if (typeof window !== 'undefined' && window.location) {
    return new BrowserNavigationService();
  }
  // Return mock for testing or SSR environments
  return new MockNavigationService();
}

// Singleton instance
let navigationService: NavigationService | null = null;

export function getNavigationService(): NavigationService {
  if (!navigationService) {
    navigationService = createNavigationService();
  }
  return navigationService;
}

// For testing - allows injecting a mock service
export function setNavigationService(service: NavigationService): void {
  navigationService = service;
}

// React Hook for using the navigation service
import { useMemo } from 'react';

export function useNavigation(): NavigationService {
  return useMemo(() => getNavigationService(), []);
}