export const models = [
  "gpt-3.5-turbo-1106",
  "gpt-4-1106-preview",
  "gpt-4-0613",
];

export const costPer1000Tokens = [
  {
    model_name: "gpt-3.5-turbo-1106",
    inputCost: "$0.0005",
    outputCost: "$0.0015",
  },
  {
    model_name: "gpt-4-turbo",
    inputCost: "$0.01",
    outputCost: "$0.03",
  },
  {
    model_name: "gpt-4o",
    inputCost: "$0.005",
    outputCost: "$0.015",
  },
];
