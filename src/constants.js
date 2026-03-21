//cost per 1M tokens
export const models = [
  {
    model_name: "gpt-4o-mini",
    inputCost: "$0.15",
    outputCost: "$0.6",
    isCOT: false,
  },
  {
    model_name: "gpt-5.4-nano",
    inputCost: "$0.2",
    outputCost: "$1.25",
    isCOT: true,
  },
  {
    model_name: "gpt-5.4-mini",
    inputCost: "$0.75",
    outputCost: "$4.50",
    isCOT: true,
  },
  {
    model_name: "gpt-5.4",
    inputCost: "$2.50",
    outputCost: "$15.00",
    isCOT: true,
  },
];
