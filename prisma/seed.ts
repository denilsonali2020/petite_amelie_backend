import bcrypt from "bcrypt"; // Asegúrate de tener bcrypt instalado, o usa tu utilidad de auth
import { prisma } from "../src/config/db.js";

async function main() {
  console.log("Iniciando el proceso de seeding...");

  const ownerEmail = "denilsontrochez32@gmail.com";

  // 1. Verificamos si el usuario ya existe para no duplicarlo si corres el seed varias veces
  const existingOwner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (existingOwner) {
    console.log(
      `El usuario con el email ${ownerEmail} ya existe. Omitiendo creación.`,
    );
    return;
  }

  // 2. Hasheamos la contraseña por seguridad (¡NUNCA guardar en texto plano!)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("1231231231", saltRounds);

  // 3. Creamos el usuario en la base de datos
  const owner = await prisma.user.create({
    data: {
      name: "Denilson Trochez",
      email: ownerEmail,
      password: hashedPassword,
      role: "OWNER", // Asegúrate de que esto coincida exactamente con tu enum UserRole
      mustChangePassword: false,
      isActive: true,
    },
  });

  console.log("✅ Usuario OWNER creado exitosamente:");
  console.log(`- Nombre: ${owner.name}`);
  console.log(`- Email: ${owner.email}`);
  console.log(`- Rol: ${owner.role}`);
}

// Ejecutar la función main y manejar la desconexión
main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
