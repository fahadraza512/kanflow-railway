import { Download, FileText } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ExportDataCardProps {
    isExportingPDF: boolean;
    onExportPDF: () => void;
}

export default function ExportDataCard({ isExportingPDF, onExportPDF }: ExportDataCardProps) {
    return (
        <Card variant="bordered" padding="none">
            <div className="p-4">
                <CardHeader divider>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Workspace Data
                    </h3>
                </CardHeader>
                <CardBody>
                    <div className={cn(
                        "p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-opacity",
                        isExportingPDF && "opacity-50"
                    )}>
                        <div className="flex-1">
                            <h4 className="text-xs font-semibold text-gray-900 mb-0.5">Export as PDF</h4>
                            <p className="text-[10px] text-gray-600">Download formatted report with tables and statistics</p>
                        </div>
                        <Button
                            onClick={onExportPDF}
                            disabled={isExportingPDF}
                            variant="primary"
                            size="sm"
                            isLoading={isExportingPDF}
                            className="w-full sm:w-auto shrink-0"
                        >
                            <FileText className="w-3 h-3 mr-1.5" />
                            {isExportingPDF ? "Exporting..." : "Export PDF"}
                        </Button>
                    </div>
                </CardBody>
            </div>
        </Card>
    );
}
