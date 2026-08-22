import { InstitutionalAccessUnavailablePage } from '@hektor/ui/pages';

export default async function InstitutionalAccessUnavailable({
  searchParams,
}: {
  searchParams: Promise<{ institution?: string }>;
}) {
  const { institution } = await searchParams;

  return (
    <InstitutionalAccessUnavailablePage
      institutionName={institution || 'your institution'}
    />
  );
}
