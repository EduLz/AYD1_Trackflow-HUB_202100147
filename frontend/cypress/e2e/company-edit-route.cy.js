describe('Empresa de Transporte - Edición Manual de Rutas', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('empresa@gmail.com');
    cy.get('input[type="password"]').type('123');
    cy.get('button.btn-login').click();
    
    cy.url().should('include', '/dashboard');
    });

  it('Debería abrir el modal de edición, actualizar los parámetros de la ruta y guardar cambios', () => {
    cy.visit('/company/rutas');

    // Seleccionar la primera ruta de la tabla y pulsar "Editar"
    cy.get('table.data-table tbody tr').first().within(() => {
      cy.get('button.btn-action.edit').click();
    });

    // Validar heurística de visibilidad: El modal de edición debe estar presente
    cy.get('.modal-overlay').should('be.visible');

    // Modificar los campos utilizando los v-model de tu formulario modal
    cy.get('.modal-content input').eq(0).clear().type('San Marcos');
    cy.get('.modal-content input').eq(1).clear().type('Huehuetenango');
    cy.get('.modal-content input').eq(2).clear().type('275.00');

    // Enviar el formulario interno del modal (guardarEdicion)
    cy.get('.modal-content form').submit();

    // Comprobar la notificación de éxito en la UI
    cy.get('.alert-success')
      .should('be.visible')
      .and('contain', 'Modificacion aplicada exitosamente.');
  });
});