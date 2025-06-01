import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, CheckSquare, Archive, AlertOctagon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Mock reports data
const initialReports = [
  { id: 'rep_001', reportedItemType: 'Listing', reportedItemId: 'lst_004', reason: 'Misleading information', reporter: 'Alice W.', date: '2023-05-15', status: 'pending' },
  { id: 'rep_002', reportedItemType: 'User', reportedItemId: 'usr_5', reason: 'Spamming messages', reporter: 'Bob B.', date: '2023-05-16', status: 'resolved' },
  { id: 'rep_003', reportedItemType: 'Listing', reportedItemId: 'lst_001', reason: 'Incorrect mileage', reporter: 'Charlie B.', date: '2023-05-17', status: 'pending' },
  { id: 'rep_004', reportedItemType: 'Comment', reportedItemId: 'cmt_012', reason: 'Offensive language', reporter: 'Diana P.', date: '2023-05-18', status: 'archived' },
];

const AdminReportsPage = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState(initialReports);
  // Add filter states if needed (e.g., by status, type)

  const handleUpdateReportStatus = (reportId, newStatus) => {
    setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    toast({ title: "Report Status Updated", description: `Report ${reportId} marked as ${newStatus}.` });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center">
          <AlertOctagon className="mr-3 h-8 w-8 text-destructive" /> Manage Reports
        </h1>
        {/* Add filter buttons or search here if needed */}
      </div>

      <Card className="shadow-xl border-destructive/20">
        <CardHeader>
          <CardTitle>User & Listing Reports</CardTitle>
          <CardDescription>Review and manage reports submitted by users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Item ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length > 0 ? reports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-mono text-xs">{report.id}</TableCell>
                  <TableCell>{report.reportedItemType}</TableCell>
                  <TableCell>
                    {report.reportedItemType === 'Listing' ? (
                      <Link to={`/vehicle/${report.reportedItemId.replace('lst_','')} `} target="_blank" className="text-primary hover:underline">{report.reportedItemId}</Link>
                    ) : (
                      <span>{report.reportedItemId}</span> /* Could link to user profile if available */
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={report.reason}>{report.reason}</TableCell>
                  <TableCell>{report.reporter}</TableCell>
                  <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Manage Report</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        {report.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleUpdateReportStatus(report.id, 'resolved')}>
                            <CheckSquare className="mr-2 h-4 w-4 text-green-600" /> Mark as Resolved
                          </DropdownMenuItem>
                        )}
                        {report.status !== 'archived' && (
                           <DropdownMenuItem onClick={() => handleUpdateReportStatus(report.id, 'archived')}>
                            <Archive className="mr-2 h-4 w-4 text-gray-600" /> Archive Report
                          </DropdownMenuItem>
                        )}
                         {report.status === 'archived' && (
                           <DropdownMenuItem onClick={() => handleUpdateReportStatus(report.id, 'pending')}>
                            <AlertOctagon className="mr-2 h-4 w-4 text-yellow-600" /> Re-open Report
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                    No reports found. Great job!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminReportsPage;