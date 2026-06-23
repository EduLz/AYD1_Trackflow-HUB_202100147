describe('Módulo Operadores - Publicación de Servicios', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
    cy.get('input[type="email"]').type('operador@gmail.com');
    cy.get('input[type="password"]').type('123');
    cy.get('button.btn-login').click();

    cy.url().should('include', '/dashboard');
  });

  it('Debería registrar un servicio de envío únicamente al adjuntar al menos 3 imágenes', () => {
    cy.visit('/operator/registrar-servicio');

    // Llenar el formulario de registro manual
    cy.get('input#nombre').type('Envío Terrestre Pesado');
    cy.get('input#zona').type('Zonas 4, 9, 10 de la Ciudad Capital');
    cy.get('input#capacidad').type('8000');
    cy.get('input#precio').type('350.00');
    cy.get('textarea#descripcion').type('Servicio con flotilla de camiones cerrados y estricto control de seguridad.');

    // Adjuntar el lote de 3 archivos en un solo comando selectFile
    cy.get('input[type="file"]#fotos').selectFile([
      'cypress/fixtures/RPI-Connect.png',
      'cypress/fixtures/RPI-Connect.png',
      'cypress/fixtures/RPI-Connect.png'
    ], { force: true });

    // Validar la eliminación dinámica de la advertencia de cantidad de fotos
    cy.get('.advertencia-fotos').should('not.exist');
    cy.get('.preview-grid .preview-item').should('have.length', 3);

    // Enviar el formulario y verificar la alerta flotante Toast
    cy.get('button[type="submit"]').click();
    cy.get('.op-toast.toast-exito').should('be.visible').and('contain', 'Servicio registrado correctamente');
  });
});