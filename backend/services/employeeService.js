import prisma from "../db.js";

export async function searchEmployees({ name, role, companyName, departmentName }) {
  const where = {};

  if (name) {
    where.name = { contains: name, mode: "insensitive" };
  }

  if (role) {
    where.role = { contains: role, mode: "insensitive" };
  }

  if (departmentName) {
    where.department = {
      name: { contains: departmentName, mode: "insensitive" },
    };
  }

  if (companyName) {
    where.department = {
      ...where.department,
      company: {
        name: { contains: companyName, mode: "insensitive" },
      },
    };
  }

  const employees = await prisma.employee.findMany({
    where,
    include: {
      department: {
        include: { company: true },
      },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  if (!employees.length) {
    return "No matching employees found.";
  }

  return employees.map((employee) => ({
    name: employee.name,
    role: employee.role,
    salary: Number(employee.salary),
    department: employee.department.name,
    company: employee.department.company.name,
  }));
}