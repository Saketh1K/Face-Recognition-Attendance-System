// Face recognition utility functions
// In a real implementation, this would connect to a backend service with OpenCV/face_recognition

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  department: string;
  faceData: string;
  registeredAt: string;
}

interface AttendanceRecord {
  id: string;
  name: string;
  timestamp: string;
  status: 'present' | 'registered';
}

export class FaceRecognitionService {
  private readonly STORAGE_KEY_USERS = 'face_recognition_users';
  private readonly STORAGE_KEY_ATTENDANCE = 'face_recognition_attendance';

  // Simulate face recognition (in real app, this would call backend API)
  async recognizeFace(imageData: string): Promise<RegisteredUser | null> {
    console.log('Simulating face recognition...');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = this.getRegisteredUsers();
    
    // Simple simulation: check if any user is registered (in real app, this would be actual face matching)
    if (users.length > 0) {
      // For demo purposes, randomly return a user or null to simulate recognition
      const recognitionSuccess = Math.random() > 0.3; // 70% success rate for demo
      return recognitionSuccess ? users[Math.floor(Math.random() * users.length)] : null;
    }
    
    return null;
  }

  registerUser(userData: { name: string; email: string; department: string }, faceData: string): RegisteredUser {
    const user: RegisteredUser = {
      id: crypto.randomUUID(),
      ...userData,
      faceData,
      registeredAt: new Date().toISOString()
    };

    const users = this.getRegisteredUsers();
    users.push(user);
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));

    // Add registration record
    this.addAttendanceRecord(user.name, 'registered');

    console.log('User registered:', user);
    return user;
  }

  markAttendance(user: RegisteredUser): void {
    this.addAttendanceRecord(user.name, 'present');
    console.log('Attendance marked for:', user.name);
  }

  private addAttendanceRecord(name: string, status: 'present' | 'registered'): void {
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      name,
      timestamp: new Date().toISOString(),
      status
    };

    const records = this.getAttendanceHistory();
    records.unshift(record); // Add to beginning
    
    // Keep only last 50 records
    const limitedRecords = records.slice(0, 50);
    localStorage.setItem(this.STORAGE_KEY_ATTENDANCE, JSON.stringify(limitedRecords));
  }

  deleteUser(userId: string): void {
    const users = this.getRegisteredUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(filteredUsers));
    
    // Also remove attendance records for this user
    const records = this.getAttendanceHistory();
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete) {
      const filteredRecords = records.filter(record => record.name !== userToDelete.name);
      localStorage.setItem(this.STORAGE_KEY_ATTENDANCE, JSON.stringify(filteredRecords));
    }
  }

  getRegisteredUsers(): RegisteredUser[] {
    const users = localStorage.getItem(this.STORAGE_KEY_USERS);
    return users ? JSON.parse(users) : [];
  }

  getAttendanceHistory(): AttendanceRecord[] {
    const records = localStorage.getItem(this.STORAGE_KEY_ATTENDANCE);
    return records ? JSON.parse(records) : [];
  }

  clearAttendanceHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY_ATTENDANCE);
  }

  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY_USERS);
    localStorage.removeItem(this.STORAGE_KEY_ATTENDANCE);
  }
}
