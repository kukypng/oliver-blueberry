# Implementation Plan

- [x] 1. Create centralized app configuration system



  - Create src/config/app.ts with centralized app configuration including name, contact info, and URLs
  - Create src/hooks/useAppConfig.ts hook for easy access to app configuration
  - Define TypeScript types for configuration structure
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 2. Update HTML configuration and metadata files
  - Replace "Oliver" with "OneDrip" in index.html meta tags, titles, and PWA configurations
  - Update page title, Open Graph tags, Twitter cards, and Apple PWA settings
  - _Requirements: 1.1, 1.3, 1.4_

- [ ] 2. Update project configuration files
  - Modify package.json project metadata if needed
  - Update any configuration files that reference the application name
  - _Requirements: 1.1, 1.2_

- [ ] 3. Update main documentation files
  - Replace all "Oliver" references with "OneDrip" in README.md
  - Update LICENSE file to reference "OneDrip System"
  - Update SECURITY.md contact information and system references
  - _Requirements: 2.1, 2.3, 5.1, 5.3_

- [ ] 4. Update additional documentation files
  - Replace "Oliver" with "OneDrip" in DESIGN_IMPROVEMENTS_SUMMARY.md
  - Update CSV_IMPORT_EXPORT_FIX.md to reference "OneDrip"
  - _Requirements: 2.1, 2.2_

- [ ] 5. Update React component files - Navigation and Headers
  - Modify TabletHeaderNav.tsx to use centralized app configuration instead of hardcoded "Oliver"
  - Update component to import and use useAppConfig hook
  - Update logo alt text and header title using configuration
  - _Requirements: 1.1, 1.2, 6.2, 6.4_

- [ ] 6. Update React component files - Plans and Marketing
  - Modify PlansHero.tsx to use centralized app configuration
  - Update component to import and use useAppConfig hook
  - Update logo alt text and main title display using configuration
  - _Requirements: 1.1, 1.2, 4.3, 6.2, 6.4_

- [ ] 7. Update PWA and installation components
  - Modify PWAInstallPrompt.tsx to use centralized app configuration
  - Update component to import and use useAppConfig hook for app name
  - Update installation dialog text and app references using configuration
  - _Requirements: 1.1, 1.3, 4.1, 6.2, 6.4_

- [ ] 8. Update main application pages
  - Modify Index.tsx to use centralized app configuration
  - Update component to import and use useAppConfig hook
  - Update logo alt texts, titles, and marketing copy using configuration
  - _Requirements: 1.1, 1.2, 4.2, 6.2, 6.4_

- [ ] 9. Update authentication and success pages
  - Modify ResetPasswordPage.tsx and PurchaseSuccessPage.tsx to use centralized app configuration
  - Update components to import and use useAppConfig hook
  - Update logo alt texts and page titles using configuration
  - _Requirements: 1.1, 1.2, 4.2, 6.2, 6.4_

- [ ] 10. Update PWA hooks and utilities
  - Modify usePWA.ts hook to use centralized app configuration for sharing functionality
  - Update hook to import and use APP_CONFIG for share data
  - Update share data title and text references using configuration
  - _Requirements: 1.4, 4.4, 6.2, 6.3_

- [ ] 11. Update component code comments and headers
  - Replace "Oliver" references in file header comments
  - Update system name in CsvImportExportDemo.tsx, typography.tsx, modern-notifications.tsx, modern-cards.tsx, and animations.tsx
  - _Requirements: 2.2, 2.4_

- [ ] 12. Update site settings and configuration components
  - Modify SiteSettingsContent.tsx placeholder text from "Vantagens do Oliver" to "Vantagens do OneDrip"
  - Update any other configuration-related text
  - _Requirements: 3.1, 3.2_

- [ ] 13. Update database migration files
  - Replace "Oliver" references in SQL migration files
  - Update default values, example data, and system references in supabase/migrations
  - Change benefit titles, testimonials, and FAQ references
  - _Requirements: 3.2, 3.3_

- [ ] 14. Update email addresses and contact information
  - Replace oliver.com email addresses with onedrip.com equivalents
  - Update contact information in SECURITY.md and README.md
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 15. Perform comprehensive search and replace validation
  - Run global search to find any remaining "Oliver" references
  - Update any missed occurrences in code, comments, or configuration
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 16. Test PWA functionality with new branding
  - Verify PWA installation shows "OneDrip" as app name
  - Test sharing functionality uses correct app name
  - Validate meta tags are properly updated
  - _Requirements: 1.3, 1.4, 4.4_

- [ ] 17. Validate centralized configuration system
  - Verify all components are using centralized app configuration
  - Test that changing app name in config updates all references
  - Confirm no hardcoded "Oliver" references remain in components
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 18. Validate all user-facing text and interface elements
  - Check all pages display "OneDrip" consistently
  - Verify logo alt texts are updated
  - Confirm no "Oliver" references remain in UI
  - Test that future brand changes only require config file update
  - _Requirements: 1.1, 1.2, 4.1, 4.2, 6.1_