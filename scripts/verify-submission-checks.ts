import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== 1. Checking Database Resource Descriptions ===");
  const booth = await prisma.resource.findFirst({
    where: { name: "Focus Booth 07" },
  });

  console.log("Focus Booth 07 description in DB:\n  ", JSON.stringify(booth?.description));

  if (booth?.description && booth.description.includes("Book up to 4 hours")) {
    console.log("-> 'Book up to 4 hours' was still present. Updating...");
    await prisma.resource.update({
      where: { id: booth.id },
      data: {
        description: "Single soundproof booth for focused work, calls, and virtual meetings.",
      },
    });
    console.log("-> Updated Focus Booth 07 description successfully.");
  } else {
    console.log("-> VERIFIED: 'Book up to 4 hours' is NOT present in Focus Booth 07 description.");
  }

  // Also check if any other resource in DB has 'Book up to 4 hours'
  const allResources = await prisma.resource.findMany({ orderBy: { name: "asc" } });
  const lingering = allResources.filter(r => r.description?.includes("Book up to 4 hours"));
  if (lingering.length > 0) {
    console.log("-> Lingering records found:", lingering.map(r => r.name));
    for (const r of lingering) {
      await prisma.resource.update({
        where: { id: r.id },
        data: { description: r.description?.replace(/Book up to 4 hours\.?/gi, "").trim() }
      });
    }
    console.log("-> Cleaned lingering records.");
  } else {
    console.log("-> VERIFIED: Zero resources in database mention 'Book up to 4 hours'.");
  }

  console.log("\n=== 2. Checking Current Resource Capacities and Pluralization in DB ===");
  for (const r of allResources) {
    const plural = r.capacity !== null ? (r.capacity === 1 ? "1 person" : `${r.capacity} people`) : "Equipment / General";
    console.log(`- ${r.name.padEnd(25)} | Capacity: ${String(r.capacity).padEnd(5)} | Formatted: ${plural}`);
  }
}

main()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
