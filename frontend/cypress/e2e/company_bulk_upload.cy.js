describe('Empresa de Transporte - Carga Masiva (CSV)', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    // Login inicial
    cy.visit('/login');
    cy.get('input[type="email"]').type('empresa@gmail.com');
    cy.get('input[type="password"]').type('123');
    cy.get('button.btn-login').click();

    cy.url().should('include', '/dashboard');
  });

  it('Debería cargar secuencialmente la flota de vehículos y posteriormente las rutas comerciales', () => {
    cy.visit('/company/rutas'); 

    // Cambiar visualmente a la pestaña de CSV
    cy.contains('button.tab-button', 'Carga Masiva (CSV)').click();

    // --- Bloque 1: Carga Masiva de Flota ---
    cy.get('input[type="radio"][value="flota"]').check();
    cy.get('input[type="file"]#csvFile').selectFile('cypress/fixtures/vehiculos-test.csv', { force: true });
    cy.get('.file-name-highlight').should('contain', 'vehiculos-test.csv');
    cy.get('button[type="submit"]').click();

    // Validar mensaje del sistema en pantalla (Heurística Nielsen)
    cy.get('.alert-success').should('be.visible').and('contain', 'Archivo procesado correctamente');

    // --- Bloque 2: Carga Masiva de Rutas ---
    cy.get('input[type="radio"][value="rutas"]').check();
    cy.get('input[type="file"]#csvFile').selectFile('cypress/fixtures/rutas-test.csv', { force: true });
    cy.get('button[type="submit"]').click();

    cy.get('.alert-success').should('be.visible').and('contain', 'Archivo procesado correctamente');
  });
});