import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, password: hashed, name: "Admin" },
  });

  console.log(`Admin user ready: ${user.email}`);

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "João Moraski",
      title: "Software Engineer & CS Student",
      bio: "Software Engineer specializing in **Fullstack Development, Cloud Architecture, and AI Solutions**.",
      aboutContent: "",
      linkedinUrl: "https://www.linkedin.com/in/joao-moraski/",
      githubUrl: "https://github.com/joaomoraski",
      instagramUrl: "https://www.instagram.com/joaomoraski/",
      email: "joaomoraskilunkes@gmail.com",
    },
  });

  console.log("Site settings ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
