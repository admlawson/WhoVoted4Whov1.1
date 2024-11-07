export interface Database {
  public: {
    Tables: {
      election_data: {
        Row: {
          id: number;
          year: number;
          data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          year: number;
          data: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          year?: number;
          data?: any;
          updated_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: number;
          key: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}