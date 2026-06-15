"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navItems } from "@/lib/navigation";
import { Logo } from "./logo";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Close drawer on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Accessibility & Focus Management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      
      if (e.key === "Tab" && isOpen && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      // Focus the close button when drawer opens
      setTimeout(() => firstFocusableRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
      // Return focus to trigger when drawer closes
      triggerRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button 
        ref={triggerRef}
        className="mobile-nav-trigger" 
        onClick={() => setIsOpen(true)}
        aria-label="Buka menu navigasi"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
      >
        <Menu size={24} aria-hidden="true" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="mobile-nav-backdrop" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div 
        ref={drawerRef}
        id="mobile-navigation-drawer"
        className={`mobile-nav-drawer ${isOpen ? "is-open" : ""}`} 
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigasi Utama Mobile"
      >
        <div className="drawer-header">
          <Logo variant="full" theme="dark" height={28} />
          <button 
            ref={firstFocusableRef}
            className="drawer-close" 
            onClick={() => setIsOpen(false)}
            aria-label="Tutup menu navigasi"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>
        
        <nav className="drawer-nav" aria-label="Menu navigasi utama mobile">
          {navItems.map((item) => {
            const active = item.href !== "#" && (
              item.exact ? pathname === item.href : pathname.startsWith(item.href)
            );
            return (
              <Link
                key={item.label}
                href={item.href}
                className="drawer-nav-item"
                aria-current={active ? "page" : undefined}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="drawer-footer">
          <p className="body-sm">SIAAS v1.0</p>
          <p className="label-md" style={{ opacity: 0.5, textTransform: "none" }}>Offline Mode</p>
        </div>
      </div>

      <style jsx>{`
        .mobile-nav-trigger {
          display: none;
          background: transparent;
          border: none;
          color: var(--on-surface);
          cursor: pointer;
          padding: 10px;
          margin-left: -10px;
          border-radius: var(--radius-default);
          min-width: 44px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease, transform 0.1s ease;
        }

        .mobile-nav-trigger:hover {
          background: var(--surface-container-low);
        }

        .mobile-nav-trigger:active {
          transform: scale(0.95);
        }

        .mobile-nav-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 100;
          animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-nav-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          max-width: 85vw;
          background: var(--tertiary);
          z-index: 101;
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--shadow-lg);
        }

        .mobile-nav-drawer.is-open {
          transform: translateX(0);
        }

        .drawer-header {
          padding: var(--gutter);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .drawer-close {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 4px;
          transition: transform 0.1s ease;
        }

        .drawer-close:active {
          transform: scale(0.95);
        }

        .drawer-nav {
          flex: 1;
          padding: var(--gutter);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .drawer-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          border-radius: var(--radius-default);
          font-weight: 500;
          transition: all 0.2s ease;
          opacity: 0;
          transform: translateX(-10px);
        }

        .is-open .drawer-nav-item {
          opacity: 1;
          transform: translateX(0);
        }

        .is-open .drawer-nav-item:nth-child(1) { transition-delay: 0.1s; }
        .is-open .drawer-nav-item:nth-child(2) { transition-delay: 0.15s; }
        .is-open .drawer-nav-item:nth-child(3) { transition-delay: 0.2s; }
        .is-open .drawer-nav-item:nth-child(4) { transition-delay: 0.25s; }
        .is-open .drawer-nav-item:nth-child(5) { transition-delay: 0.3s; }

        .drawer-nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .drawer-nav-item:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: -2px;
        }

        .drawer-nav-item[aria-current="page"] {
          background: var(--primary);
          color: var(--on-primary);
        }

        .drawer-footer {
          padding: var(--gutter);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.4);
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .mobile-nav-trigger {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
