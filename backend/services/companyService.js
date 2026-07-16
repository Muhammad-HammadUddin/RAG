import prisma from "../db.js";

export async function searchCompanies({ name, industry }) {
  const where = {};

  if (name) {
    where.name = { contains: name, mode: "insensitive" };
  }

  if (industry) {
    where.industry = { contains: industry, mode: "insensitive" };
  }

  const companies = await prisma.company.findMany({
    where,
    include: {
      departments: {
        select: {
          _count: {
            select: { employees: true },
          },
        },
      },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  if (!companies.length) {
    return "No matching companies found.";
  }

  return companies.map((company) => ({
    name: company.name,
    industry: company.industry,
    location: company.location,
    departmentCount: company.departments.length,
    employeeCount: company.departments.reduce(
      (total, department) => total + Number(department._count.employees || 0),
      0
    ),
  }));
}