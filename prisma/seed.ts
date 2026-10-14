import "dotenv/config";
import { PrismaClient, ResourceType, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const seedPassword = process.env.SEED_PASSWORD || "ReserveHub123!";
  const passwordHash = await hash(seedPassword, 12);

  const users = [
    {
      email: "admin@reservehub.local",
      name: "ReserveHub Admin",
      role: Role.ADMIN,
    },
    {
      email: "member@reservehub.local",
      name: "Kasun Fernando",
      role: Role.MEMBER,
    },
    {
      email: "nadeesha@reservehub.lk",
      name: "Nadeesha Perera",
      role: Role.MEMBER,
    },
    {
      email: "admin@demo.lk",
      name: "ReserveHub Admin",
      role: Role.ADMIN,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: {
        ...user,
        passwordHash,
      },
    });
  }

  const resources = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Iris Boardroom",
      type: ResourceType.MEETING_ROOM,
      location: "Level 3 · Colombo HQ",
      capacity: 12,
      description: "Glass-walled boardroom with Meet setup, whiteboard and lake view.",
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Drum Studio Pod",
      type: ResourceType.MEETING_ROOM,
      location: "Level 1 · Kandy Branch",
      capacity: 4,
      description: "Quiet pod for interviews and 1:1s. Acoustic panels, 55-inch display.",
    },
    {
      id: "00000000-0000-4000-8000-000000000003",
      name: "Sony A7IV Kit",
      type: ResourceType.EQUIPMENT,
      location: "Media cage · Colombo HQ",
      capacity: 1,
      description: "Mirrorless kit with 24-70mm, 2 batteries and tripod. Pickup at reception.",
    },
    {
      id: "00000000-0000-4000-8000-000000000004",
      name: "Projector Epson X49",
      type: ResourceType.EQUIPMENT,
      location: "Store B · Galle Fort",
      capacity: 3,
      description: "4,000-lumen projector with HDMI + clicker. Great for workshops.",
    },
    {
      id: "00000000-0000-4000-8000-000000000005",
      name: "Rooftop Pavilion",
      type: ResourceType.OTHER,
      location: "Rooftop · Colombo HQ",
      capacity: 40,
      description: "Open-air pavilion for town halls and evening socials. Weather cover included.",
    },
    {
      id: "00000000-0000-4000-8000-000000000006",
      name: "Focus Booth 07",
      type: ResourceType.MEETING_ROOM,
      location: "Level 2 · Colombo HQ",
      capacity: 1,
      description: "Single soundproof booth for focused work, calls, and virtual meetings.",
    },
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { id: resource.id },
      update: {
        name: resource.name,
        type: resource.type,
        location: resource.location,
        capacity: resource.capacity,
        description: resource.description,
      },
      create: resource,
    });
  }

  console.log("Demo users and resources created successfully.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
