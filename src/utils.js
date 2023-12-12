import { costPer1000Tokens } from "./constants";

export function calculateCost(modelName, usageObject) {
  const { prompt_tokens, completion_tokens } = usageObject;
  const selectedModel = costPer1000Tokens.find(
    (model) => model.model_name === modelName
  );

  if (selectedModel) {
    const inputCostInDollars =
      (prompt_tokens / 1000) * parseFloat(selectedModel.inputCost.slice(1));
    const outputCostInDollars =
      (completion_tokens / 1000) *
      parseFloat(selectedModel.outputCost.slice(1));
    const totalCostInDollars = inputCostInDollars + outputCostInDollars;
    const conversionRate = 83.5;
    const totalCostInRupees = totalCostInDollars * conversionRate;

    return totalCostInRupees.toFixed(3);
  } else {
    return "Model not found";
  }
}
