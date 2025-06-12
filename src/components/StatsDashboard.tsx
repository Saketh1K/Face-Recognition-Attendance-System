
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Calendar } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  name: string;
  timestamp: string;
  status: 'present' | 'registered';
}

interface StatsDashboardProps {
  records: AttendanceRecord[];
  totalUsers: number;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ records, totalUsers }) => {
  const today = new Date().toDateString();
  const todayRecords = records.filter(record => 
    new Date(record.timestamp).toDateString() === today && record.status === 'present'
  );
  
  const presentToday = new Set(todayRecords.map(record => record.name)).size;
  const absentToday = totalUsers - presentToday;
  const attendanceRate = totalUsers > 0 ? ((presentToday / totalUsers) * 100).toFixed(1) : '0';

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Present Today',
      value: presentToday,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Absent Today',
      value: absentToday,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceRate}%`,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsDashboard;
