const transporter = require("../config/email");

const sendVerificationEmail = async (correo, nombre, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    await transporter.sendMail({
        from: `"TrackFlowHub" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: "Verifica tu cuenta TrackFlowHub",
        html: `
            <div style="font-family: Arial">
                <h2>Bienvenido a TrackFlowHub</h2>
                <p> Hola ${nombre}, </p>
                <p> Gracias por registrarte. </p>
                <p> Para activar tu cuenta haz clic en: </p>
                <a href="${verificationUrl}"> Verificar Cuenta </a>
                <br><br>
                <p>
                    Si no solicitaste esta cuenta,
                    puedes ignorar este correo.
                </p>
            </div>
        `
    });
};

const sendAdminOTPEmail = async (correo, codigo) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: correo,
        subject: "Código de verificación - TrackFlow HUB",
        html: `
            <h2>Autenticación de dos factores</h2>
            <p>Tu código de acceso es:</p>
            <h1 style="letter-spacing: 5px;">
                ${codigo}
            </h1>
            <p>
                El código expirará en 5 minutos.
            </p>
        `
    });
};

const sendMeetingEmail = async (correo, fecha_hora, enlace) => {

    await transporter.sendMail({
        to: correo,
        subject: "Reunión programada",
        html: `
            <h2>Reunión Virtual Programada</h2>
            <p>Su reunión ha sido programada.</p>
            <p>
                <b>Fecha:</b> ${fecha_hora}
            </p>
            <p>
                <b>Enlace:</b>
                <a href="${enlace}">
                    ${enlace}
                </a>
            </p>
        `
    });
};

const sendCouponEmail = async (correo, nombre, codigo, descripcion) => {

    await transporter.sendMail({
        from: `"TrackFlowHub" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: "Cupón disponible - TrackFlowHub",
        html: `
            <div style="font-family: Arial">
                <h2>¡Tienes un nuevo cupón!</h2>
                <p>Hola ${nombre},</p>
                <p> Un operador logístico te ha asignado un cupón promocional. </p>
                <div
                    style="
                        padding:15px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        margin:10px 0;
                    "
                >
                    <h3>Código:</h3>
                    <h2>${codigo}</h2>
                    <p>
                        <strong>Descripción:</strong>
                        ${descripcion}
                    </p>
                </div>
                <p>
                    Utilízalo en tu próximo envío.
                </p>
                <p>
                    Gracias por utilizar TrackFlowHub.
                </p>
            </div>
        `
    });
};

module.exports = {
    sendVerificationEmail,
    sendAdminOTPEmail,
    sendMeetingEmail,
    sendCouponEmail
};