import React from 'react';
import { format } from 'date-fns';
import { Calendar, Download } from 'lucide-react';

interface DateListProps {
  dates: string[];
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

export const DateList: React.FC<DateListProps> = ({ dates, onSelectDate, selectedDate }) => {
  return (
    <div className="space-y-4">
      {dates.map((date) => {
        const formattedDate = new Date(date);
        const isSelected = selectedDate === date;
        
        return (
          <div
            key={date}
            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {format(formattedDate, 'EEEE')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(formattedDate, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onSelectDate(date)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Select</span>
                </button>
              </div>
            </div>
            {isSelected && (
              <div className="mt-2">
                <p className="text-sm text-green-600">Currently selected date</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};