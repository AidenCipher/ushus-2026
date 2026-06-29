import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Test@123", 12);
  const email = "manual.tester@student.com";
  
  // Check if exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Delete existing dependencies first if needed (like registrations), 
    // but for a fresh manual test account it might just not exist or we can just drop the user.
    // Assuming Cascade delete is enabled, or we'll just use a random email to avoid conflicts.
  }

  const uniqueEmail = `manual.test.${Date.now()}@student.com`;

  await prisma.user.create({
    data: {
      id: uuid(),
      email: uniqueEmail,
      passwordHash,
      name: "Manual Tester",
      role: Role.PARTICIPANT,
      college: "Testing University",
      phone: "+91 99999 00000",
    }
  });

  console.log("Account created successfully!");
  console.log("Email:", uniqueEmail);
  console.log("Password: Test@123");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
