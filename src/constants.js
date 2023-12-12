export const models = [
  "gpt-3.5-turbo-1106",
  "gpt-4-1106-preview",
  "gpt-4-0613",
];

export const costPer1000Tokens = [
  {
    model_name: "gpt-3.5-turbo-1106",
    inputCost: "$0.0010",
    outputCost: "$0.0020",
  },
  {
    model_name: "gpt-4-1106-preview",
    inputCost: "$0.01",
    outputCost: "$0.03",
  },
  {
    model_name: "gpt-4-0613",
    inputCost: "$0.03",
    outputCost: "$0.06",
  },
];
