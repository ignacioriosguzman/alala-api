/**
 * Diagnóstico SMTP — ejecutar en Railway Shell:
 *   node scripts/check-smtp.js
 * o para probar envío real:
 *   SMTP_TEST_TO=tu@email.com node scripts/check-smtp.js
 */
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM;
const testTo = process.env.SMTP_TEST_TO;

console.log('\n══════════════════════════════════════');
console.log('  ALALÁ — Diagnóstico SMTP');
console.log('══════════════════════════════════════');
console.log('SMTP_HOST  :', host  || '(no definido)');
console.log('SMTP_PORT  :', port);
console.log('SMTP_USER  :', user  || '(no definido)');
console.log('SMTP_PASS  :', pass  ? '***' : '(no definido / vacío)');
console.log('SMTP_FROM  :', from  || '(no definido)');
console.log('');

if (!host || !user || !pass) {
  console.error('✗ Faltan variables SMTP. Configura SMTP_HOST, SMTP_USER y SMTP_PASS en Railway.');
  process.exit(1);
}

if (user === 'apikey' && !from) {
  console.error('✗ ERROR: Estás usando SendGrid (SMTP_USER="apikey") pero SMTP_FROM no está definido.');
  console.error('   SendGrid rechazará los envíos porque "apikey" no es un email válido.');
  console.error('   Solución: define SMTP_FROM con un remitente verificado (ej: contacto@alala.cl).');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  socketTimeout: 15000,
  greetingTimeout: 8000,
});

console.log('Verificando conexión SMTP…');
try {
  await transporter.verify();
  console.log('✓ Conexión SMTP exitosa.\n');
} catch (err) {
  console.error('✗ Error de conexión SMTP:', err.message);
  console.error('');
  console.error('Posibles causas:');
  console.error('  • Contraseña incorrecta');
  console.error('  • Puerto bloqueado (prueba con 465 para SSL)');
  console.error('  • El servidor SMTP rechaza conexiones desde IPs externas');
  console.error('  • Firewall del hosting bloqueando Railway');
  process.exit(1);
}

if (testTo) {
  console.log(`Enviando email de prueba a ${testTo}…`);
  try {
    const fromAddr = from || user;
    const info = await transporter.sendMail({
      from: `"ALALÁ Chile" <${fromAddr}>`,
      to: testTo,
      subject: 'ALALÁ — Test de correo transaccional',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
          <h2 style="color:#D4705A">Test de correo ALALÁ</h2>
          <p>Este es un correo de prueba generado por el script de diagnóstico SMTP.</p>
          <p>Si recibes este mensaje, el sistema de correos está funcionando correctamente.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
          <p style="color:#999;font-size:.8rem">ALALÁ Chile · alala.cl</p>
        </div>
      `,
    });
    console.log('✓ Email enviado. MessageId:', info.messageId);
  } catch (err) {
    console.error('✗ Error enviando email de prueba:', err.message);
    process.exit(1);
  }
} else {
  console.log('(Para probar envío real: SMTP_TEST_TO=tu@email.com node scripts/check-smtp.js)');
}

console.log('\nDiagnóstico completado.\n');
