
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  department: string;
  registeredAt: string;
}

interface AttendanceRecord {
  id: string;
  name: string;
  timestamp: string;
  status: 'present' | 'registered';
}

interface AdminPanelProps {
  users: RegisteredUser[];
  records: AttendanceRecord[];
  onDeleteUser: (userId: string) => void;
  onClearHistory: () => void;
  onResetSystem: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  records,
  onDeleteUser,
  onClearHistory,
  onResetSystem
}) => {
  const { toast } = useToast();

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      onDeleteUser(userId);
      toast({
        title: "User Deleted",
        description: `${userName} has been removed from the system.`,
      });
    }
  };

  const exportData = () => {
    const data = {
      users,
      records,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Attendance data has been downloaded successfully.",
    });
  };

  const getLastAttendance = (userName: string) => {
    const userRecords = records
      .filter(record => record.name === userName && record.status === 'present')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return userRecords.length > 0 ? userRecords[0].timestamp : null;
  };

  return (
    <div className="space-y-6">
      {/* Admin Controls */}
      <Card>
        <CardHeader>
          <CardTitle>System Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={onClearHistory} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear History
            </Button>
            <Button onClick={onResetSystem} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Reset System
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registered Users */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No users registered yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Attendance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const lastAttendance = getLastAttendance(user.name);
                    const isPresent = lastAttendance && 
                      new Date(lastAttendance).toDateString() === new Date().toDateString();
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>{user.department || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={isPresent ? "default" : "secondary"}>
                            {isPresent ? 'Present' : 'Absent'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lastAttendance 
                            ? new Date(lastAttendance).toLocaleString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
