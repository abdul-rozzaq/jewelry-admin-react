import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { useTranslation } from "react-i18next";
import type Project from "@/src/types/project";

interface ProcessTypeAndProjectProps {
  selectedType: number | null;
  selectedProject: number | null;
  processTypes: any[];
  projects: Project[];
  onTypeChange: (type: number | null) => void;
  onProjectChange: (project: number | null) => void;
}

export function ProcessTypeAndProject({
  selectedType,
  selectedProject,
  processTypes,
  projects,
  onTypeChange,
  onProjectChange,
}: ProcessTypeAndProjectProps) {
  const { t, i18n } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("createProcess.typeAndProject.title")}</CardTitle>
        <CardDescription>{t("createProcess.typeAndProject.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t("createProcess.type.select")}</Label>
            <Select onValueChange={(v) => onTypeChange(v !== "none" ? Number(v) : null)} value={selectedType?.toString() || "none"}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t("createProcess.type.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("createProcess.type.none")}</SelectItem>
                {processTypes.map((pt: any) => (
                  <SelectItem key={pt.id} value={pt.id.toString()}>
                    {pt.name[i18n.resolvedLanguage ?? "uz"] ?? pt.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Project</Label>
            <Select value={selectedProject?.toString() ?? "none"} onValueChange={(e) => onProjectChange(e != "none" ? Number(e) : null)}>
              <SelectTrigger className="w-full border mt-2">
                <SelectValue placeholder={t("createProcess.projectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"none"}>{t("createProcess.project.none")}</SelectItem>
                {projects.map((p: Project) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
