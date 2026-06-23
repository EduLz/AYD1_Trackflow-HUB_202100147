describe('Empresa de Transporte - Acciones y Modales en Rutas', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('empresa@gmail.com');
    cy.get('input[type="password"]').type('123');
    cy.get('button.btn-login').click();

    cy.url().should('include', '/dashboard');
  });

  it('Debería desplegar el modal de confirmación y suspender temporalmente una ruta', () => {
    cy.visit('/company/rutas');

    // Interactuar con la primera fila de datos renderizada en la tabla
    cy.get('table.data-table tbody tr').first().within(() => {
      cy.get('button.btn-action.suspend').click(); // suspend 
    });

    // Validar que la ventana modal de confirmación emerja en la UI
    cy.get('.modal-overlay').should('be.visible');
    
    // Confirmar la acción en el botón de advertencia
    cy.get('button.btn-warning').click();

    // Verificar notificación de éxito
    cy.get('.alert-success').should('be.visible').and('contain', 'Ruta suspendida correctamente');
  });
});