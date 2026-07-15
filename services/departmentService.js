import prisma from "../db.js";

export async function searchDepartments({
  departmentName,
}) {
  const departments = await prisma.department.findMany({
    where: departmentName
      ? {
          name: {
            contains: departmentName,
            mode: "insensitive",
          },
        }
      : {},

    include: {
      company: true,
      employees: true,
    },

    take: 20,
  });

  if (!departments.length) {
    return "No matching departments found.";
  }

  return departments.map((department) => ({
    name: department.name,
    company: department.company.name,
    employeeCount: department.employees.length,
    employees: department.employees.map((employee) => employee.name),
  }));
}