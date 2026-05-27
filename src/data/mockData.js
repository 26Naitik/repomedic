// Shared colour helpers (used by SecurityPanel & SmartSuggestions)
export function getPriorityColor(priority) {
  switch (priority) {
    case "HIGH":   return "red";
    case "MEDIUM": return "orange";
    case "LOW":    return "cyan";
    default:       return "purple";
  }
}

export function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000)    return (n / 1000).toFixed(1) + "k";
  return String(n);
}
