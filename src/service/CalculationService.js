async function evaluateMinimumStockLevelForVaccines( BCGData,CurrentStockThresholdLevel) {
  const targetPopulation = BCGData.target_population;
  const dosesPerTarget = BCGData.doses_per_target;
  const wastageRate = BCGData.wastage_rate;
  const estimatedCoverage = BCGData.estimated_coverage;

  const QtyNeededPerYear =
    targetPopulation *
    (estimatedCoverage / 100) *
    dosesPerTarget *
    (100 / (100 - wastageRate));

  const QtyNeededPerWeek = QtyNeededPerYear / 52;

  return Math.round(CurrentStockThresholdLevel / QtyNeededPerWeek);
}

async function evaluateMinimumStockLevelForSupplies(BCGData,CurrentStockThresholdLevel) {
  const targetPopulation = BCGData.target_population;
  const dosesPerTarget = BCGData.doses_per_target;
  const wastageRate = BCGData.wastage_rate;
  const estimatedCoverage = BCGData.estimated_coverage;
  const numberOfPrsesentations=BCGData.presentations;

  const QtyNeededPerYear =
    targetPopulation *
    (estimatedCoverage / 100) *
    dosesPerTarget *
    (100 / (100 - wastageRate))*(1/numberOfPrsesentations);

  const QtyNeededPerWeek = QtyNeededPerYear / 52;

  return Math.round(CurrentStockThresholdLevel / QtyNeededPerWeek);
}



async function evaluateMinimumStockLevelForDiluents(BCGData,CurrentStockThresholdLevel) {
  const targetPopulation = BCGData.target_population;
  const dosesPerTarget = BCGData.doses_per_target;
  const wastageRate = BCGData.wastage_rate;
  const estimatedCoverage = BCGData.estimated_coverage;
 const numberOfPrsesentations=BCGData.presentations;

  const QtyNeededPerYear =
    targetPopulation *
    (estimatedCoverage / 100) *
    dosesPerTarget *
    (100 / (100 - wastageRate))*(1/numberOfPrsesentations);

  const QtyNeededPerWeek = QtyNeededPerYear / 52;

  return Math.round(CurrentStockThresholdLevel / QtyNeededPerWeek);
}

module.exports = {
  evaluateMinimumStockLevelForVaccines,
  evaluateMinimumStockLevelForSupplies,
  evaluateMinimumStockLevelForDiluents
};  