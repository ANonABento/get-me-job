import { BarChart3, Calculator, TrendingUp } from "lucide-react";
import type { SalaryToolTab } from "@/features/salary/types";

export const SALARY_LOCATIONS = [
  "San Francisco",
  "New York",
  "Seattle",
  "Los Angeles",
  "Boston",
  "Austin",
  "Denver",
  "Chicago",
  "Atlanta",
  "Dallas",
  "Phoenix",
  "Remote",
];

export const SALARY_ROLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Engineer",
  "Principal Engineer",
  "Engineering Manager",
  "Product Manager",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Mobile Engineer",
  "QA Engineer",
  "UX Designer",
];

export const SALARY_TOOL_TABS: Array<{
  id: SalaryToolTab;
  label: string;
  icon: typeof Calculator;
}> = [
  { id: "calculator", label: "Salary Calculator", icon: Calculator },
  { id: "compare", label: "Compare Offers", icon: BarChart3 },
  { id: "negotiate", label: "Negotiate", icon: TrendingUp },
];

