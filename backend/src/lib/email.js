import nodemailer from 'nodemailer';

const FROM = process.env.EMAIL_FROM || '"Project Finance" <noreply@projectfinance.app>';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function sendVerificationEmail(to, token) {
  const url = `${APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Verify your email – Project Finance',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Welcome to Project Finance!</h2>
        <p>Click the button below to verify your email address and activate your account.</p>
        <p style="margin:24px 0">
          <a href="${url}" style="padding:12px 24px;background:#1976d2;color:#fff;text-decoration:none;border-radius:4px;display:inline-block">
            Verify Email
          </a>
        </p>
        <p style="color:#666;font-size:14px">Or copy this link into your browser:<br>${url}</p>
      </div>
    `,
  });
}

export async function sendInvitationEmail(to, inviterName, projectName) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `You've been invited to "${projectName}" – Project Finance`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Project Invitation</h2>
        <p><strong>${inviterName || 'Someone'}</strong> has invited you to collaborate on the project <strong>${projectName}</strong>.</p>
        <p style="margin:24px 0">
          <a href="${APP_URL}/invitations" style="padding:12px 24px;background:#1976d2;color:#fff;text-decoration:none;border-radius:4px;display:inline-block">
            View Invitation
          </a>
        </p>
        <p style="color:#666;font-size:14px">
          Don't have an account yet?
          <a href="${APP_URL}/register">Register here</a> — the invitation will be waiting for you.
        </p>
      </div>
    `,
  });
}
