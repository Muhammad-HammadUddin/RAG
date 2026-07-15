import prisma from "../db.js";

export async function searchCompanies({
  name,
  industry,
}) {
  const companies = await prisma.company.findMany({
    where: {
      ...(name && {
        name: {
          contains: name,
          mode: "insensitive",
        },
      }),

      ...(industry && {
        industry: {
          contains: industry,
          mode: "insensitive",
        },
      }),
    },

    include: {
      departments: {
        include: {
          employees: true,
        },
      },
    },

    take: 20,
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
      (sum, department) => sum + department.employees.length,
      0
    ),
  }));
}