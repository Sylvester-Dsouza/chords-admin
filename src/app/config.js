// This file contains configuration for the Next.js application

// Set dynamic rendering for all protected routes
export const dynamicConfig = {
  // Force dynamic rendering for all pages
  dynamic: 'force-dynamic',
  // Disable static generation
  revalidate: 0
};
