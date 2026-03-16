import { Download } from "lucide-react";
import { Invoice } from "@/lib/storage";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { clsx } from "clsx";

interface InvoiceListProps {
    invoices: Invoice[];
    onDownload: (invoiceId: string | number) => void;
}

export default function InvoiceList({ invoices, onDownload }: InvoiceListProps) {
    if (invoices.length === 0) {
        return (
            <Card>
                <CardBody>
                    <EmptyState
                        title="No invoices yet"
                        description="Your billing history will appear here once you upgrade to a paid plan."
                    />
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader divider>
                <h3 className="text-base font-bold text-gray-900">Billing History</h3>
                <p className="text-xs text-gray-500 mt-1">
                    Download your invoices and view payment history
                </p>
            </CardHeader>

            <CardBody>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                        Invoice
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                        Date
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                        Amount
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                        Status
                                    </th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {invoice.invoiceNumber}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {invoice.description}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                                            {new Date(invoice.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                            {invoice.amount}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <Badge
                                                variant={invoice.status === "paid" ? "success" : "warning"}
                                                size="sm"
                                            >
                                                {invoice.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDownload(invoice.id)}
                                            >
                                                <Download className="w-3.5 h-3.5 mr-1" />
                                                Download
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
