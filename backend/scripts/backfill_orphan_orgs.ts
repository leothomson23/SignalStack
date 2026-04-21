/**
 * Back-fill a personal organisation + OWNER membership for any user that
 * signed up before the register endpoint started creating one automatically.
 *
 * Run once after deploying the fix:
 *   docker compose exec backend npx tsx scripts/backfill_orphan_orgs.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orphans = await prisma.user.findMany({
    where: { memberships: { none: {} } },
    select: { id: true, name: true, email: true },
  });

  if (orphans.length === 0) {
    console.log('No orphan users — nothing to do.');
    return;
  }

  console.log(`Found ${orphans.length} user(s) without a membership.`);
  for (const u of orphans) {
    const slugBase = (u.name || u.email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'workspace';
    const slug = `${slugBase}-${Date.now().toString(36)}-${u.id.slice(0, 6)}`;

    await prisma.$transaction(async (tx) => {
      const org = await tx.organisation.create({
        data: { name: `${u.name || u.email}'s workspace`, slug },
      });
      await tx.organisationMember.create({
        data: { userId: u.id, orgId: org.id, role: 'OWNER' },
      });
    });
    console.log(`  ${u.email} -> org slug ${slug}`);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
