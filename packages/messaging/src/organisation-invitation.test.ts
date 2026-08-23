import { describe, expect, it } from 'vitest';

import { organisationInvitationMessage } from './organisation-invitation';

describe('organisation invitation message', () => {
  it('renders HTML and text without trusting supplied values', () => {
    const message = organisationInvitationMessage({
      acceptUrl: 'https://example.test/invite?token=a&next=<unsafe>',
      displayName: '<Learner>',
      expiresInHours: 24,
      organisationName: 'Northbridge & Co',
      to: 'learner@example.test',
    });

    expect(message.subject).toBe('Join Northbridge & Co on Hektor');
    expect(message.text).toContain('This link expires in 24 hours');
    expect(message.html).toContain('Northbridge &amp; Co');
    expect(message.html).not.toContain('<Learner>');
  });
});
