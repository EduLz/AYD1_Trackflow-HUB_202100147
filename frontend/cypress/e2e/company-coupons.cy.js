describe('Empresa de Transporte - Gestión de Cupones', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('empresa@gmail.com');
    cy.get('input[type="password"]').type('123');
    cy.get('button.btn-login').click();

    cy.url().should('include', '/dashboard');
  });

  it('Debería generar un código aleatorio y emitir un cupón promocional a un cliente', () => {
    cy.visit('/company/cupones');

    // Configurar correo destino
    cy.get('input[placeholder="ejemplo@cliente.com"]').type('cliente@ejemplo.com');
    
    // Probar el botón complementario de ayuda al usuario para autogenerar códigos
    cy.contains('button', 'Autogenerar').click();
    cy.get('input[placeholder="Ej. VERANO2026"]').should('not.have.value', '');

    // Rellenar las características técnicas y fechas límite del cupón
    cy.get('select.form-select').select('1'); // Descuento Estándar
    cy.get('input[placeholder="Ej. 15.50"]').type('10.00');
    cy.get('input[type="datetime-local"]').type('2026-06-30T18:00');
    cy.get('input[placeholder="Ej. Descuento valido por inauguracion de rutas"]').type('Cupón promocional enviado desde la suite automatizada.');

    // Procesar la solicitud
    cy.get('button[type="submit"]').click();

    // Validar que la UI confirme el guardado exitoso
    cy.get('.alert-success').should('be.visible').and('contain', 'registrado y enviado exitosamente');
  });
});