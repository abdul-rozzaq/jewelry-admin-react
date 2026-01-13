import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useTranslation } from "react-i18next";

interface GoldCalculationCardProps {
  inputGoldQuantity: number;
  outputGoldQuantity: number;
  goldDifference: number;
  efficiency: number;
}

export function GoldCalculationCard({ inputGoldQuantity, outputGoldQuantity, goldDifference, efficiency }: GoldCalculationCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
          {t("createProcess.goldCalculation.title")}
        </CardTitle>
        <CardDescription>{t("createProcess.goldCalculation.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">{t("createProcess.goldCalculation.input")}</div>
            <div className="text-2xl font-bold text-blue-700">
              {inputGoldQuantity.toFixed(3)} <span className="text-sm font-normal">g</span>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">{t("createProcess.goldCalculation.output")}</div>
            <div className="text-2xl font-bold text-green-700">
              {outputGoldQuantity.toFixed(3)} <span className="text-sm font-normal">g</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${goldDifference >= 0 ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}>
            <div className={`text-sm font-medium mb-1 ${goldDifference >= 0 ? "text-red-600" : "text-orange-600"}`}>
              {goldDifference >= 0 ? t("createProcess.goldCalculation.loss") : t("createProcess.goldCalculation.excess")}
            </div>
            <div className={`text-2xl font-bold ${goldDifference >= 0 ? "text-red-700" : "text-orange-700"}`}>
              {Math.abs(goldDifference).toFixed(3)} <span className="text-sm font-normal">g</span>
            </div>
          </div>
        </div>

        {inputGoldQuantity > 0 && outputGoldQuantity > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">{t("createProcess.goldCalculation.efficiency")}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, efficiency)}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{efficiency.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
