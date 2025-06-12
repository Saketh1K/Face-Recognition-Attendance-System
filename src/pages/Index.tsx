
import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CameraView from '@/components/CameraView';
import RegistrationModal from '@/components/RegistrationModal';
import AttendanceHistory from '@/components/AttendanceHistory';
import StatsDashboard from '@/components/StatsDashboard';
import AdminPanel from '@/components/AdminPanel';
import UserDashboard from '@/components/UserDashboard';
import { FaceRecognitionService } from '@/utils/faceRecognition';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Users, Settings } from 'lucide-react';

const faceService = new FaceRecognitionService();

const Index = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Position your face in the circle and click to check attendance');
  const [statusType, setStatusType] = useState<'idle' | 'success' | 'warning' | 'registration'>('idle');
  const [attendanceHistory, setAttendanceHistory] = useState(faceService.getAttendanceHistory());
  const [registeredUsers, setRegisteredUsers] = useState(faceService.getRegisteredUsers());
  const [activeTab, setActiveTab] = useState('attendance');
  const { toast } = useToast();

  const updateStatus = (message: string, type: typeof statusType) => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const refreshData = () => {
    setAttendanceHistory(faceService.getAttendanceHistory());
    setRegisteredUsers(faceService.getRegisteredUsers());
  };

  const handleFaceDetection = useCallback(async (imageData: string) => {
    console.log('Processing face detection...');
    setCapturedImage(imageData);
    
    try {
      updateStatus('Recognizing face...', 'idle');
      
      const recognizedUser = await faceService.recognizeFace(imageData);
      
      if (recognizedUser) {
        faceService.markAttendance(recognizedUser);
        updateStatus(`Welcome back, ${recognizedUser.name}! Attendance marked.`, 'success');
        refreshData();
        
        toast({
          title: "Attendance Marked",
          description: `Welcome back, ${recognizedUser.name}!`,
        });
      } else {
        updateStatus('Face not recognized. Please register first.', 'warning');
        setIsRegistering(true);
        
        toast({
          title: "Unknown Face",
          description: "Please register your face to mark attendance.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Face recognition error:', error);
      updateStatus('Error processing face. Please try again.', 'warning');
      
      toast({
        title: "Error",
        description: "Failed to process face recognition. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleRegistration = useCallback((userData: { name: string; email: string; department: string }, faceData: string) => {
    try {
      const newUser = faceService.registerUser(userData, faceData);
      setIsRegistering(false);
      setCapturedImage(null);
      updateStatus(`Registration successful! Welcome, ${newUser.name}.`, 'success');
      refreshData();
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${newUser.name}! You can now mark attendance.`,
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleCloseRegistration = () => {
    setIsRegistering(false);
    setCapturedImage(null);
    updateStatus('Position your face in the circle and click to check attendance', 'idle');
  };

  const handleClearHistory = () => {
    faceService.clearAttendanceHistory();
    refreshData();
    toast({
      title: "History Cleared",
      description: "Attendance history has been cleared.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    faceService.deleteUser(userId);
    refreshData();
  };

  const handleResetSystem = () => {
    if (window.confirm('Are you sure you want to reset the entire system? This will delete all users and attendance records.')) {
      faceService.clearAllData();
      refreshData();
      updateStatus('System reset. Position your face in the circle and click to check attendance', 'idle');
      toast({
        title: "System Reset",
        description: "All data has been cleared. You can start fresh.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Smart Attendance System
            </h1>
            <p className="text-gray-600">
              AI-powered face recognition for seamless attendance tracking
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="attendance" className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Attendance</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="mt-6">
              <CameraView
                onFaceDetected={handleFaceDetection}
                isRegistering={isRegistering}
                statusMessage={statusMessage}
                statusType={statusType}
              />
              
              <RegistrationModal
                isOpen={isRegistering}
                onClose={handleCloseRegistration}
                onRegister={handleRegistration}
                capturedImage={capturedImage}
              />
            </TabsContent>

            <TabsContent value="dashboard" className="mt-6">
              <StatsDashboard 
                records={attendanceHistory}
                totalUsers={registeredUsers.length}
              />
              <UserDashboard records={attendanceHistory} />
              <div className="mt-6">
                <AttendanceHistory
                  records={attendanceHistory}
                  onClearHistory={handleClearHistory}
                />
              </div>
            </TabsContent>

            <TabsContent value="admin" className="mt-6">
              <StatsDashboard 
                records={attendanceHistory}
                totalUsers={registeredUsers.length}
              />
              <AdminPanel
                users={registeredUsers}
                records={attendanceHistory}
                onDeleteUser={handleDeleteUser}
                onClearHistory={handleClearHistory}
                onResetSystem={handleResetSystem}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
