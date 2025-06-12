
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Calendar } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  name: string;
  timestamp: string;
  status: 'present' | 'registered';
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
  onClearHistory: () => void;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ records, onClearHistory }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    return status === 'present' ? 'text-green-600' : 'text-blue-600';
  };

  const getStatusIcon = (status: string) => {
    return status === 'present' ? <Clock className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        {records.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearHistory}>
            Clear History
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No records yet</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div className={getStatusColor(record.status)}>
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <p className="font-medium">{record.name}</p>
                    <p className="text-sm text-gray-600">
                      {record.status === 'present' ? 'Attendance Marked' : 'Registered'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{formatTime(record.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceHistory;
