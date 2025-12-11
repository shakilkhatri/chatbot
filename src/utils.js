import { models } from "./constants";

export function calculateCost(modelName, usageObject, conversionRate = 87.9) {
  const { prompt_tokens, completion_tokens } = usageObject;
  const selectedModel = models.find((model) => model.model_name === modelName);

  if (selectedModel) {
    const inputCostInDollars =
      (prompt_tokens * parseFloat(selectedModel.inputCost.slice(1))) / 1000000;
    const outputCostInDollars =
      (completion_tokens * parseFloat(selectedModel.outputCost.slice(1))) /
      1000000;
    const totalCostInDollars = inputCostInDollars + outputCostInDollars;
    // Use the conversion rate passed as parameter (with default fallback)
    const totalCostInRupees = totalCostInDollars * conversionRate;
    const totalCostInPaise = totalCostInRupees * 100;

    return totalCostInPaise.toFixed(3);
  } else {
    return "Model not found";
  }
}
