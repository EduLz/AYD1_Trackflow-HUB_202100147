describe('Módulo Autenticación - Ciclo Completo (Login & Logout)', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('Debería iniciar sesión con credenciales de Empresa, navegar al panel y cerrar sesión de forma segura', () => {
    cy.visit('/login');

    cy.get('input[type="email"]').type('empresa@gmail.com');
    cy.get('input[type="password"]').type('123');
    
    cy.get('button.btn-login').click();

    cy.url().should('include', '/dashboard');

    cy.get('main.dashboard-content').should('be.visible');
    cy.get('.dashboard-card').should('exist');

   cy.contains('button', 'Cerrar Sesion', { timeout: 20 })
      .should('be.visible')
      .click();

    cy.url().should('include', '/login');

    cy.get('input[type="email"]').should('have.value', '');
    cy.get('input[type="password"]').should('have.value', '');
  });
});