import prisma from "../db.js";

export async function searchEmployees({
  name,
  role,
  companyName,
  departmentName,
}) {
  const employees = await prisma.employee.findMany({
    where: {
      ...(name && {
        name: {
          contains: name,
          mode: "insensitive",
        },
      }),

      ...(role && {
        role: {
          contains: role,
          mode: "insensitive",
        },
      }),

      ...(departmentName && {
        department: {
          name: {
            contains: departmentName,
            mode: "insensitive",
          },
        },
      }),

      ...(companyName && {
        department: {
          company: {
            name: {
              contains: companyName,
              mode: "insensitive",
            },
          },
        },
      }),
    },

    include: {
      department: {
        include: {
          company: true,
        },
      },
    },

    take: 20,
  });

  if (!employees.length) {
    return "No matching employees found.";
  }

  return employees.map((employee) => ({
    name: employee.name,
    role: employee.role,
    salary: employee.salary,
    department: employee.department.name,
    company: employee.department.company.name,
  }));
}