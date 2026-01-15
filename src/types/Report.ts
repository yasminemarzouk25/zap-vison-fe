export interface Report {
  id: string;
  title: string;
  date: Date;
  summary: string;
  details: string;
  //status: 'completed' | 'pending' | 'archived';
}