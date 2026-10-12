import "dotenv/config";
import { PrismaClient, ResourceType, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("ReserveHub123!", 12);

  const users = [
    {
      email: "admin@reservehub.local",
      name: "ReserveHub Admin",
      role: Role.ADMIN,
    },
    {
      email: "member@reservehub.local",
      name: "Demo Member",
      role: Role.MEMBER,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        passwordHash,
      },
    });
  }

  const resources = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Conference Room A",
      type: ResourceType.MEETING_ROOM,
      location: "First Floor",
      capacity: 12,
      description: "Meeting room with a display and whiteboard.",
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Meeting Room B",
      type: ResourceType.MEETING_ROOM,
      location: "Second Floor",
      capacity: 6,
      description: "Quiet room for smaller team meetings.",
    },
    {
      id: "00000000-0000-4000-8000-000000000003",
      name: "Portable Projector",
      type: ResourceType.EQUIPMENT,
      location: "IT Office",
      capacity: null,
      description: "Shared projector for presentations.",
    },
    {
      id: "00000000-0000-4000-8000-000000000004",
      name: "Training Room",
      type: ResourceType.MEETING_ROOM,
      location: "Ground Floor",
      capacity: 25,
      description: "Room for workshops and training sessions.",
    },
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { id: resource.id },
      update: {},
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
