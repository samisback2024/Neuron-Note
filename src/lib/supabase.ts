import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "./config";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          workspace: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["notes"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          completed: boolean;
          priority: "high" | "medium" | "low";
          due_date: string | null;
          project_id: string | null;
          project_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["tasks"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          color: string;
          due_date: string | null;
          members: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["projects"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          title: string;
          description: string;
          image: string | null;
          tags: string[];
          collection: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["bookmarks"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["bookmarks"]["Insert"]>;
      };
      note_links: {
        Row: {
          id: string;
          source_id: string;
          target_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["note_links"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["note_links"]["Insert"]>;
      };
      tags: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          color: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["tags"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      note_tags: {
        Row: {
          note_id: string;
          tag_id: string;
        };
        Insert: Database["public"]["Tables"]["note_tags"]["Row"];
        Update: Partial<Database["public"]["Tables"]["note_tags"]["Insert"]>;
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["chat_messages"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["chat_messages"]["Insert"]
        >;
      };
    };
  };
};
