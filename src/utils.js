import { models } from "./constants";

export function calculateCost(modelName, usageObject) {
  const { prompt_tokens, completion_tokens } = usageObject;
  const selectedModel = models.find((model) => model.model_name === modelName);

  if (selectedModel) {
    const inputCostInDollars =
      (prompt_tokens * parseFloat(selectedModel.inputCost.slice(1))) / 1000000;
    const outputCostInDollars =
      (completion_tokens * parseFloat(selectedModel.outputCost.slice(1))) /
      1000000;
    const totalCostInDollars = inputCostInDollars + outputCostInDollars;
    const conversionRate = 83.8;
    const totalCostInRupees = totalCostInDollars * conversionRate;

    return totalCostInRupees.toFixed(3);
  } else {
    return "Model not found";
  }
}
