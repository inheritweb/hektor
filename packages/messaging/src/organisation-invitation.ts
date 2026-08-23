function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function organisationInvitationMessage(options: {
  acceptUrl: string;
  displayName?: string;
  expiresInHours: number;
  organisationName: string;
  to: string;
}) {
  const greeting = options.displayName
    ? `Hello ${options.displayName},`
    : 'Hello,';
  const subject = `Join ${options.organisationName} on Hektor`;
  const text = `${greeting}\n\n${options.organisationName} has invited you to join Hektor.\n\nAccept your invitation: ${options.acceptUrl}\n\nThis link expires in ${options.expiresInHours} hours. If you were not expecting this invitation, you can ignore this email.`;
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f6f7f8;color:#202124;font-family:Arial,sans-serif;padding:32px 16px">
    <table role="presentation" style="margin:0 auto;max-width:560px;width:100%;background:#fff;border-collapse:collapse">
      <tr><td style="padding:32px">
        <p style="color:#6252d9;font-size:13px;font-weight:700;letter-spacing:.16em;margin:0 0 24px">HEKTOR</p>
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 20px">Join ${escapeHtml(options.organisationName)} on Hektor</h1>
        <p style="line-height:1.6;margin:0 0 16px">${escapeHtml(greeting)}</p>
        <p style="line-height:1.6;margin:0 0 24px">${escapeHtml(options.organisationName)} has invited you to join Hektor.</p>
        <p style="margin:0 0 24px"><a href="${escapeHtml(options.acceptUrl)}" style="background:#6252d9;color:#fff;display:inline-block;padding:12px 18px;text-decoration:none">Accept invitation</a></p>
        <p style="color:#656970;font-size:14px;line-height:1.6;margin:0">This link expires in ${options.expiresInHours} hours. If you were not expecting this invitation, you can ignore this email.</p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { html, subject, text, to: options.to };
}
