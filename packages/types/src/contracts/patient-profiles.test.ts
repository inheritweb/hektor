import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { patientProfileDocumentV1Schema } from './patient-profiles';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);

const seededProfiles = [
  'adebayo-omolade',
  'adam-marsden',
  'emma-barlow',
  'amina-warsame',
  'esther-jenkins',
];

function readSeedProfile(slug: string) {
  return JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        'supabase/seeds/patient-profiles',
        `${slug}.json`,
      ),
      'utf8',
    ),
  ) as unknown;
}

describe('patientProfileDocumentV1Schema', () => {
  it.each(seededProfiles)('validates the %s production profile', (slug) => {
    expect(() =>
      patientProfileDocumentV1Schema.parse(readSeedProfile(slug)),
    ).not.toThrow();
  });

  it('rejects duplicate stable IDs within a collection', () => {
    const document = readSeedProfile('esther-jenkins') as {
      problems: Array<Record<string, unknown>>;
    };
    document.problems[1] = {
      ...document.problems[1],
      id: document.problems[0]?.id,
    };

    const result = patientProfileDocumentV1Schema.safeParse(document);

    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({ message: 'Duplicate IDs in problems' }),
    );
  });

  it('rejects markup in authored plain text', () => {
    const document = readSeedProfile('emma-barlow') as {
      catalogue: { synopsis: string };
    };
    document.catalogue.synopsis = '<strong>Unsafe</strong>';

    expect(patientProfileDocumentV1Schema.safeParse(document).success).toBe(
      false,
    );
  });

  it('rejects identifiers outside the simulation convention', () => {
    const document = readSeedProfile('adebayo-omolade') as {
      identifiers: Array<{ value: string }>;
    };
    document.identifiers[0]!.value = '6128473059';

    expect(patientProfileDocumentV1Schema.safeParse(document).success).toBe(
      false,
    );
  });

  it('rejects unsupported schema versions and unknown fields', () => {
    const document = {
      ...(readSeedProfile('amina-warsame') as Record<string, unknown>),
      schemaVersion: 2,
      unrecognised: true,
    };

    expect(patientProfileDocumentV1Schema.safeParse(document).success).toBe(
      false,
    );
  });

  it('rejects documents above the total size limit', () => {
    const document = readSeedProfile('emma-barlow') as {
      background: Array<Record<string, unknown>>;
    };
    document.background = Array.from({ length: 30 }, (_, index) => ({
      category: 'social',
      details: 'a'.repeat(3900),
      id: `large-fact-${index}`,
      sensitivity: 'standard',
      summary: `Large fact ${index}`,
    }));

    expect(patientProfileDocumentV1Schema.safeParse(document).success).toBe(
      false,
    );
  });
});
