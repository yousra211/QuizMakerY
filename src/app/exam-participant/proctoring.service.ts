import { Injectable, Inject, PLATFORM_ID, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ProctoringService {
      examViolated = new EventEmitter<void>();
  private keydownListener?: (e: KeyboardEvent) => void;
  private contextmenuListener?: (e: Event) => void;
  private visibilityListener?: () => void;
  private focusInterval?: number;


  private tabSwitchCount = 0;
  private maxTabSwitches = 1;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  startProctoring(): void {
    if (!isPlatformBrowser(this.platformId)) return;
 this.detectTabSwitch();
    this.blockKeyboardShortcuts();
    this.blockContextMenu();
    this.maintainFocus();
    console.log('Proctoring mode activated');
  }
  
  private detectTabSwitch(): void {
    window.addEventListener('blur', () => this.handleViolation());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.handleViolation();
    });
  }

  private handleViolation(): void {
    this.tabSwitchCount++;
    console.warn('🚨 Tab switch detected. Count:', this.tabSwitchCount);

    if (this.tabSwitchCount > this.maxTabSwitches) {
      this.examViolated.emit(); // 🔥 BOOM!
    }
  }

  stopProctoring(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener, true);
    }
    if (this.contextmenuListener) {
      document.removeEventListener('contextmenu', this.contextmenuListener);
    }
    if (this.visibilityListener) {
      document.removeEventListener('visibilitychange', this.visibilityListener);
    }
    if (this.focusInterval) {
      window.clearInterval(this.focusInterval);
    }
    console.log('Proctoring mode deactivated');
  }

  private blockKeyboardShortcuts(): void {
  this.keydownListener = (e: KeyboardEvent): void => {
    const blockedKeys = [
      // Tab switching
      (e.ctrlKey || e.metaKey) && e.key === 'Tab',
      e.altKey && e.key === 'Tab',
      // New windows/tabs
      (e.ctrlKey || e.metaKey) && e.code === 'KeyN',
      (e.ctrlKey || e.metaKey) && e.code === 'KeyT',
      // Developer tools
      e.key === 'F12',
      (e.ctrlKey || e.metaKey) && e.shiftKey && (e.code === 'KeyI' || e.code === 'KeyJ'),
      (e.ctrlKey || e.metaKey) && e.code === 'KeyU',
      // System keys
      e.key === 'F11',
      e.key === 'Meta'
    ];
           
    if (blockedKeys.some(condition => condition)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  };
  
  // N'oubliez pas d'ajouter l'event listener
  document.addEventListener('keydown', this.keydownListener);
}

  private blockContextMenu(): void {
    this.contextmenuListener = (e: Event): void => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', this.contextmenuListener);
  }

  private maintainFocus(): void {
    this.visibilityListener = (): void => {
      if (document.hidden) {
        setTimeout(() => window.focus(), 100);
      }
    };
    document.addEventListener('visibilitychange', this.visibilityListener);

    this.focusInterval = window.setInterval(() => {
      if (!document.hasFocus()) {
        window.focus();
      }
    }, 500);
  }

  // Basic clipboard monitoring
  startClipboardMonitoring() {
    document.addEventListener('copy', (e) => {
      alert('Copying is not allowed during exams!');
      e.preventDefault(); // Block copy action
    });

    document.addEventListener('paste', (e) => {
      alert('Pasting is not allowed during exams!');
      e.preventDefault(); // Block paste action
    });
  }
}