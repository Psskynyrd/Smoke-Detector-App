import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  Timestamp,
  onSnapshot,
  DocumentData
} from 'firebase/firestore';

// Firebase config (replace with your config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface SensorReading {
  id?: string;
  deviceId: string;
  deviceName: string;
  fire: string;
  smoke: string;
  temperature: number;
  humidity: number;
  timestamp: Timestamp;
  createdAt?: Date;
}

export interface DeviceStats {
  deviceId: string;
  deviceName: string;
  totalReadings: number;
  avgTemperature: number;
  avgHumidity: number;
  fireAlerts: number;
  smokeAlerts: number;
  lastReading: Date;
}

class FirebaseService {
  private readonly COLLECTION_NAME = 'sensorReadings';

  // Add new sensor reading
  async addSensorReading(reading: Omit<SensorReading, 'id' | 'timestamp'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...reading,
        timestamp: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding sensor reading:', error);
      throw error;
    }
  }

  // Get recent sensor readings with limit
  async getRecentReadings(deviceId?: string, limitCount: number = 50): Promise<SensorReading[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      if (deviceId) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('deviceId', '==', deviceId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().timestamp?.toDate(),
      })) as SensorReading[];
    } catch (error) {
      console.error('Error fetching recent readings:', error);
      throw error;
    }
  }

  // Get readings for a specific time range
  async getReadingsInRange(
    startDate: Date, 
    endDate: Date, 
    deviceId?: string
  ): Promise<SensorReading[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      );

      if (deviceId) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('deviceId', '==', deviceId),
          where('timestamp', '>=', Timestamp.fromDate(startDate)),
          where('timestamp', '<=', Timestamp.fromDate(endDate)),
          orderBy('timestamp', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().timestamp?.toDate(),
      })) as SensorReading[];
    } catch (error) {
      console.error('Error fetching readings in range:', error);
      throw error;
    }
  }

  // Real-time listener for sensor readings
  subscribeToReadings(
    callback: (readings: SensorReading[]) => void,
    deviceId?: string,
    limitCount: number = 20
  ): () => void {
    let q = query(
      collection(db, this.COLLECTION_NAME),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    if (deviceId) {
      q = query(
        collection(db, this.COLLECTION_NAME),
        where('deviceId', '==', deviceId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }

    return onSnapshot(q, (querySnapshot) => {
      const readings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().timestamp?.toDate(),
      })) as SensorReading[];
      callback(readings);
    });
  }

  // Get device statistics
  async getDeviceStats(deviceId: string): Promise<DeviceStats | null> {
    try {
      const readings = await this.getRecentReadings(deviceId, 1000); // Get more data for stats
      
      if (readings.length === 0) return null;

      const totalReadings = readings.length;
      const avgTemperature = readings.reduce((sum, r) => sum + r.temperature, 0) / totalReadings;
      const avgHumidity = readings.reduce((sum, r) => sum + r.humidity, 0) / totalReadings;
      const fireAlerts = readings.filter(r => r.fire !== 'Normal' && r.fire !== 'Clear').length;
      const smokeAlerts = readings.filter(r => r.smoke !== 'Clear' && r.smoke !== 'Normal').length;
      const lastReading = readings[0]?.createdAt || new Date();

      return {
        deviceId,
        deviceName: readings[0].deviceName,
        totalReadings,
        avgTemperature: Math.round(avgTemperature * 10) / 10,
        avgHumidity: Math.round(avgHumidity * 10) / 10,
        fireAlerts,
        smokeAlerts,
        lastReading,
      };
    } catch (error) {
      console.error('Error calculating device stats:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();