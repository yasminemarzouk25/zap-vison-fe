// src/components/ReportList.tsx
import React from 'react';
import { format } from 'date-fns';
import { FileText, Download } from 'lucide-react';
import { Report } from '../types/Report';

interface ReportListProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
}

export const ReportList: React.FC<ReportListProps> = ({ reports, onSelectReport }) => {
  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                <p className="text-sm text-gray-500">
                  {format(report.date, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onSelectReport(report)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
          <p className="mt-2 text-gray-600">{report.summary}</p>
        </div>
      ))}
    </div>
  );
};
