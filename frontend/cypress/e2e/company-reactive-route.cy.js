describe('Empresa de Transporte - Reactivación de Rutas Suspendidas', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('empresa@gmail.com');
    cy.get('input[type="password"]').type('123');
    cy.get('button.btn-login').click();
    
    cy.url().should('include', '/dashboard');
    cy.visit('/company/rutas');
  });

  it('Debería transicionar una ruta al estado suspendido y luego reactivarla con éxito', () => {
    // 1. Asegurar la carga de datos: Esperar a que la tabla deje de estar vacía
    cy.get('table.data-table tbody').should('not.contain', 'Cargando');

    // 2. PASO SEGURO: Buscamos la primera ruta activa y la suspendemos primero 
    // para GARANTIZAR que exista un botón de reactivar en la pantalla.
    cy.get('table.data-table tbody').then(($tbody) => {
      if ($tbody.find('button.btn-action.suspend').length > 0) {
        // Si hay una activa, la suspendemos temporalmente
        cy.get('button.btn-action.suspend').first().click();
        cy.get('.modal-overlay').should('be.visible');
        cy.get('button.btn-warning').click(); // Confirmar suspensión
        cy.get('.alert-success').should('be.visible'); // Esperar confirmación
      }
    });

    // 3. AHORA SÍ: El botón "Reactivar" existe con total certeza en la interfaz
    cy.get('button.btn-action.reactivate').first().should('be.visible').click();

    // 4. Validar el flujo de la ventana modal de Reactivación (confirmarReactivacion)
    cy.get('.modal-overlay').should('be.visible');
    cy.get('.modal-content h2').should('contain', 'Confirmar Reactivacion');
    
    // Hacer clic en el botón verde "Si, Reactivar"
    cy.get('button.btn-success').click();

    // 5. Heurística de Nielsen: Verificar la alerta de éxito final en la UI
    cy.get('.alert-success')
      .should('be.visible')
      .and('contain', 'Ruta reactivada y visible nuevamente.');
      
    // Validar el cambio visual de la etiqueta de estado a "Activo"
    cy.get('.status-indicator').first().should('contain', 'Activo');
  });
});