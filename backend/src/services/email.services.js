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

module.exports = {
    sendVerificationEmail,
    sendAdminOTPEmail
};