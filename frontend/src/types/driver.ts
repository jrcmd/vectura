export type DocumentItem = {
  type: string;
  status: string;
  fileUrl: string | null;
  expiryDate: string | null;
};

export type MissionSummary = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  missionDate: string;
  startTime: string;
  endTime: string | null;
  truckType: string;
  hourlyRate: number;
  status: string;
};
