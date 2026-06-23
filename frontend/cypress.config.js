import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', 
    
    specPattern: [
      'cypress/e2e/auth_login.cy.js', 
      'cypress/e2e/company_bulk_upload.cy.js',
      'cypress/e2e/company-coupons.cy.js',
      'cypress/e2e/company-edit-route.cy.js',
      'cypress/e2e/company-reactive-route.cy.js',
      'cypress/e2e/company-routes-actions.cy.js',
      'cypress/e2e/operator-register-services.cy.js',
    ],

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});