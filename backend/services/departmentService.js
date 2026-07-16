import prisma from "../db.js";

export async function searchDepartments({ departmentName }) {
  const where = {};

  if (departmentName) {
    where.name = { contains: departmentName, mode: "insensitive" };
  }

  const departments = await prisma.department.findMany({
    where,
    include: {
      company: true,
      _count: {
        select: { employees: true },
      },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  if (!departments.length) {
    return "No matching departments found.";
  }

  return departments.map((department) => ({
    name: department.name,
    company: department.company.name,
    employeeCount: Number(department._count.employees || 0),
    employees: [],
  }));
}