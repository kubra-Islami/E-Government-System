import { faker } from "@faker-js/faker";
import pool from "./src/config/db.js";

async function resetTables() {
    await pool.query(`
        TRUNCATE TABLE requests, services, departments
        RESTART IDENTITY CASCADE;
  `);
    console.log("Tables truncated");
}

// Seed Departments
async function seedDepartments() {
    const departments = ["Interior", "Commerce", "Housing", "Education"];
    for (let name of departments) {
        await pool.query(
            "INSERT INTO departments (name) VALUES ($1) ON CONFLICT DO NOTHING",
            [name]
        );
    }
    console.log("Departments seeded");
}

// Seed Users
// async function seedUsers(count = 20) {
//     for (let i = 0; i < count; i++) {
//         const name = faker.person.fullName();
//         const email = faker.internet.email();
//         const password = "hashedpassword";
//         const nationalId = faker.string.numeric(10);
//         const dob = faker.date.birthdate({ min: 18, max: 70, mode: "age" });
//         const contactInfo = faker.phone.number();
//         const roles = ["citizen", "officer", "admin"];
//         const role = faker.helpers.arrayElement(roles);
//
//         const result = await pool.query(
//             `INSERT INTO users (name, email, password, national_id, date_of_birth, contact_info, role)
//        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
//             [name, email, password, nationalId, dob, contactInfo, role]
//         );
//
//         if (role !== "citizen") {
//             const dept = await pool.query(
//                 "SELECT id FROM departments ORDER BY RANDOM() LIMIT 1"
//             );
//             await pool.query(
//                 `UPDATE users SET department_id = $1 WHERE id = $2`,
//                 [dept.rows[0].id, result.rows[0].id]
//             );
//         }
//     }
//     console.log(" Users seeded");
// }

// Seed Services
async function seedServices() {
    const departments = await pool.query("SELECT id FROM departments");

    const services = [
        { name: "Passport Renewal", fee: 50 },
        { name: "Business License", fee: 100 },
        { name: "Land Registration", fee: 200 },
        { name: "National ID Update", fee: 20 },
    ];

    for (let dept of departments.rows) {

        const shuffled = faker.helpers.shuffle(services);


        const count = faker.number.int({ min: 1, max: services.length });
        const selected = shuffled.slice(0, count);

        for (let service of selected) {
            await pool.query(
                `INSERT INTO services (name, fee, department_id)
                 VALUES ($1, $2, $3)
                     ON CONFLICT (name, department_id) DO NOTHING`, // ensures no duplicates in same dept
                [service.name, service.fee, dept.id]
            );
        }
    }

    console.log(" Services seeded dynamically");
}

// Seed Requests
async function seedRequests(count = 30) {
    const citizens = await pool.query("SELECT id FROM users WHERE role = 'citizen'");
    const services = await pool.query("SELECT id FROM services");

    if (!citizens.rows.length || !services.rows.length) {
        console.log("No citizens or services found, skipping requests");
        return;
    }

    for (let i = 0; i < count; i++) {
        const citizen = faker.helpers.arrayElement(citizens.rows);
        const service = faker.helpers.arrayElement(services.rows);
        const status = faker.helpers.arrayElement([
            "submitted",
            "under_review",
            "approved",
            "rejected",
        ]);

        await pool.query(
            `INSERT INTO requests (citizen_id, service_id, request_number, status)
       VALUES ($1, $2, $3, $4)`,
            [
                citizen.id,
                service.id,
                faker.string.alphanumeric(10).toUpperCase(),
                status,
            ]
        );
    }
    console.log(" Requests seeded");
}

// Run all seeds
async function runSeeds() {
    try {
        await resetTables();
        await seedDepartments();
        // await seedUsers(30);
        await seedServices();
        await seedRequests(50);
    } catch (err) {
        console.error(" Error seeding data:", err);
    } finally {
        await pool.end();
    }
}

// runSeeds();
// resetTables();
