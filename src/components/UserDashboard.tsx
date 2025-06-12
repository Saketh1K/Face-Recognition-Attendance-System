
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  name: string;
  timestamp: string;
  status: 'present' | 'registered';
}

interface UserDashboardProps {
  records: AttendanceRecord[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ records }) => {
  const today = new Date().toDateString();
  const currentWeekStart = new Date();
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
  
  // Group records by user
  const userStats = records.reduce((acc, record) => {
    if (record.status === 'present') {
      if (!acc[record.name]) {
        acc[record.name] = [];
      }
      acc[record.name].push(record);
    }
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  const getUserTodayStatus = (userName: string) => {
    const userRecords = userStats[userName] || [];
    return userRecords.some(record => 
      new Date(record.timestamp).toDateString() === today
    );
  };

  const getUserWeeklyCount = (userName: string) => {
    const userRecords = userStats[userName] || [];
    return userRecords.filter(record => 
      new Date(record.timestamp) >= currentWeekStart
    ).length;
  };

  const getLastAttendance = (userName: string) => {
    const userRecords = userStats[userName] || [];
    const sorted = userRecords.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sorted[0];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Attendance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(userStats).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No attendance records found
            </p>
          ) : (
            <div className="grid gap-4">
              {Object.keys(userStats).map((userName) => {
                const isPresent = getUserTodayStatus(userName);
                const weeklyCount = getUserWeeklyCount(userName);
                const lastRecord = getLastAttendance(userName);
                
                return (
                  <Card key={userName} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{userName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>This week: {weeklyCount} days</span>
                            </div>
                            {lastRecord && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Last: {new Date(lastRecord.timestamp).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant={isPresent ? "default" : "secondary"}>
                          {isPresent ? 'Present Today' : 'Absent Today'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
