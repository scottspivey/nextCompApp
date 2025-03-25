import React from "react";
import Link from "next/link";

interface Calculator {
  id: string;
  name: string;
  path: string;
}

const calculators: Calculator[] = [
  { id: "aww", name: "Average Weekly Wage / Compensation Rate", path: "/Calculators/aww" },
  { id: "indemnity", name: "Indemnity", path: "/Calculators/indemnity" },
  { id: "commuted", name: "Commuted Value", path: "/Calculators/commuted" },
  { id: "hearing", name: "Hearing Loss", path: "/Calculators/hearing" },
  { id: "um", name: "Utica Mohawk", path: "/Calculators/um" },
  { id: "lifeexpectancy", name: "Life Expectancy", path: "/Calculators/lifeexpectancy" },
  { id: "wageloss", name: "Wage Loss", path: "/Calculators/wageloss" },
  { id: "conversions", name: "Common Conversions", path: "/Calculators/conversions" },
];

const CalculatorLink: React.FC<{ calculator: Calculator }> = ({ calculator }) => {
  return (
    <Link
      key={calculator.id}
      href={calculator.path}
      className="bg-blue-600 text-white p-4 rounded-lg shadow-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 active:bg-blue-700 flex items-center justify-center text-center"
      aria-label={`Go to ${calculator.name} calculator`}
    >
      {calculator.name}
    </Link>
  );
};

export default function Calculators() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Select a Calculator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {calculators.map((calc) => (
          <CalculatorLink key={calc.id} calculator={calc} />
        ))}
      </div>
    </div>
  );
}