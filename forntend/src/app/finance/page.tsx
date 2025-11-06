import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Printer, TrendingUp, Download, ArrowRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { EarningsChart } from "@/components/earnings-chart"

const transactions = [
  { id: "TRX001", date: "2024-07-15", amount: 75.50, status: "Paid" },
  { id: "TRX002", date: "2024-07-12", amount: 120.00, status: "Paid" },
  { id: "TRX003", date: "2024-07-10", amount: 45.25, status: "Paid" },
  { id: "TRX004", date: "2024-06-28", amount: 210.80, status: "Pending" },
  { id: "TRX005", date: "2024-06-25", amount: 88.00, status: "Paid" },
];

export default function FinancePage() {
  return (
    <div className="flex-grow bg-grid p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Finances</h1>
                <p className="text-muted-foreground">Track your earnings and view your payout history.</p>
            </div>
            <Button><Download className="mr-2 h-4 w-4"/> Download Report</Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,231.89</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$519.23</div>
              <p className="text-xs text-muted-foreground">Scheduled for Aug 1, 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Prints</CardTitle>
              <Printer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+72</div>
              <p className="text-xs text-muted-foreground">+12 since last month</p>
            </CardContent>
          </Card>
           <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Go to Dashboard</CardTitle>
              <CardDescription className="text-primary-foreground/80">Manage your printers and print jobs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile">
                <Button variant="secondary" className="w-full">
                  My Printer Dashboard <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
            <Card className="md:col-span-3">
                <CardHeader>
                    <CardTitle>Earnings Overview</CardTitle>
                    <CardDescription>Your earnings over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EarningsChart />
                </CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your most recent payouts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.id}</TableCell>
                                    <TableCell>${t.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={t.status === 'Paid' ? 'default' : 'secondary'} className={t.status === 'Paid' ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30'}>{t.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
