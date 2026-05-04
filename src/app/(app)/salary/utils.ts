export function getSalaryCalculatorLayoutClass(
  hasSalaryRange: boolean,
): string {
  return hasSalaryRange
    ? "grid gap-8 transition-all duration-300 ease-out lg:grid-cols-2"
    : "grid gap-8 transition-all duration-300 ease-out lg:grid-cols-[minmax(0,42rem)]";
}
