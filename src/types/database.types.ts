export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ability_scores: {
        Row: {
          charisma: number
          constitution: number
          creature_id: string
          dexterity: number
          intelligence: number
          strength: number
          wisdom: number
        }
        Insert: {
          charisma?: number
          constitution?: number
          creature_id: string
          dexterity?: number
          intelligence?: number
          strength?: number
          wisdom?: number
        }
        Update: {
          charisma?: number
          constitution?: number
          creature_id?: string
          dexterity?: number
          intelligence?: number
          strength?: number
          wisdom?: number
        }
        Relationships: [
          {
            foreignKeyName: "ability_scores_creature_id_fkey"
            columns: ["creature_id"]
            isOneToOne: true
            referencedRelation: "creatures"
            referencedColumns: ["id"]
          },
        ]
      }
      actions: {
        Row: {
          action_type: Database["public"]["Enums"]["Action Types"]
          created_at: string
          description: string | null
          id: number
          legendary_cost: number | null
          name: string
          recharge_amount: number | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["Action Types"]
          created_at?: string
          description?: string | null
          id?: number
          legendary_cost?: number | null
          name: string
          recharge_amount?: number | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["Action Types"]
          created_at?: string
          description?: string | null
          id?: number
          legendary_cost?: number | null
          name?: string
          recharge_amount?: number | null
        }
        Relationships: []
      }
      attacks: {
        Row: {
          attack_type: string
          created_at: string
          damage_bonus: number | null
          damage_die_count: number | null
          damage_die_type: string | null
          damage_type: Database["public"]["Enums"]["Damage Types"]
          description: string | null
          id: number
          name: string
          reach: number | null
          to_hit_modifier: number | null
        }
        Insert: {
          attack_type: string
          created_at?: string
          damage_bonus?: number | null
          damage_die_count?: number | null
          damage_die_type?: string | null
          damage_type: Database["public"]["Enums"]["Damage Types"]
          description?: string | null
          id?: number
          name: string
          reach?: number | null
          to_hit_modifier?: number | null
        }
        Update: {
          attack_type?: string
          created_at?: string
          damage_bonus?: number | null
          damage_die_count?: number | null
          damage_die_type?: string | null
          damage_type?: Database["public"]["Enums"]["Damage Types"]
          description?: string | null
          id?: number
          name?: string
          reach?: number | null
          to_hit_modifier?: number | null
        }
        Relationships: []
      }
      challenge_ratings: {
        Row: {
          armor_class: number
          attack_bonus: number
          challenge_rating: string
          created_at: string
          damage_per_round: string
          experience: number
          hit_points_range: string
          id: number
          proficiency_bonus: number
          save_dc: number
        }
        Insert: {
          armor_class?: number
          attack_bonus?: number
          challenge_rating?: string
          created_at?: string
          damage_per_round: string
          experience: number
          hit_points_range?: string
          id?: number
          proficiency_bonus?: number
          save_dc?: number
        }
        Update: {
          armor_class?: number
          attack_bonus?: number
          challenge_rating?: string
          created_at?: string
          damage_per_round?: string
          experience?: number
          hit_points_range?: string
          id?: number
          proficiency_bonus?: number
          save_dc?: number
        }
        Relationships: []
      }
      creature_types: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      creatures: {
        Row: {
          actions: Json[]
          alignment: string | null
          armor_class: number | null
          challenge_rating_id: number | null
          created_at: string
          damage_immunities:
            | Database["public"]["Enums"]["Damage Types"][]
            | null
          damage_resistances:
            | Database["public"]["Enums"]["Damage Types"][]
            | null
          damage_vulnerabilities:
            | Database["public"]["Enums"]["Damage Types"][]
            | null
          description: string | null
          environment_id: string | null
          hit_dice: string
          hit_points: number | null
          id: string
          is_public: boolean
          key: string
          languages: Database["public"]["Enums"]["Languages"][] | null
          name: string
          nonmagical_attack_immunity: boolean
          nonmagical_attack_resistance: boolean
          passive_perception: number
          saving_throws: Json | null
          size: number
          type: number
          user_id: string
        }
        Insert: {
          actions?: Json[]
          alignment?: string | null
          armor_class?: number | null
          challenge_rating_id?: number | null
          created_at?: string
          damage_immunities?:
            | Database["public"]["Enums"]["Damage Types"][]
            | null
          damage_resistances?:
            | Database["public"]["Enums"]["Damage Types"][]
            | null
          damage_vulnerabilities?:
            | Database["public"]["Enums"]["Damage Types"][]
            | null
          description?: string | null
          environment_id?: string | null
          hit_dice: string
          hit_points?: number | null
          id?: string
          is_public?: boolean
          key: string
          languages?: Database["public"]["Enums"]["Languages"][] | null
          name: string
          nonmagical_attack_immunity?: boolean
          nonmagical_attack_resistance?: boolean
          passive_perception?: number
          saving_throws?: Json | null
          size: number
          type: number
          user_id: string
        }
        Update: {
          actions?: Json[]
          alignment?: string | null
          armor_class?: number | null
          challenge_rating_id?: number | null
          created_at?: string
          damage_immunities?:
            | Database["public"]["Enums"]["Damage Types"][]
            | null
          damage_resistances?:
            | Database["public"]["Enums"]["Damage Types"][]
            | null
          damage_vulnerabilities?:
            | Database["public"]["Enums"]["Damage Types"][]
            | null
          description?: string | null
          environment_id?: string | null
          hit_dice?: string
          hit_points?: number | null
          id?: string
          is_public?: boolean
          key?: string
          languages?: Database["public"]["Enums"]["Languages"][] | null
          name?: string
          nonmagical_attack_immunity?: boolean
          nonmagical_attack_resistance?: boolean
          passive_perception?: number
          saving_throws?: Json | null
          size?: number
          type?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creatures_challenge_rating_id_fkey"
            columns: ["challenge_rating_id"]
            isOneToOne: false
            referencedRelation: "challenge_ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatures_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatures_size_fkey"
            columns: ["size"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatures_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "creature_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      environments: {
        Row: {
          created_at: string
          environment_description: string | null
          environment_name: string
          id: string
        }
        Insert: {
          created_at?: string
          environment_description?: string | null
          environment_name: string
          id?: string
        }
        Update: {
          created_at?: string
          environment_description?: string | null
          environment_name?: string
          id?: string
        }
        Relationships: []
      }
      movements: {
        Row: {
          burrow: number
          climb: number
          crawl: number
          created_at: string
          creature_id: string
          fly: number
          hover: boolean
          swim: number
          walk: number
        }
        Insert: {
          burrow?: number
          climb?: number
          crawl?: number
          created_at?: string
          creature_id: string
          fly?: number
          hover?: boolean
          swim?: number
          walk?: number
        }
        Update: {
          burrow?: number
          climb?: number
          crawl?: number
          created_at?: string
          creature_id?: string
          fly?: number
          hover?: boolean
          swim?: number
          walk?: number
        }
        Relationships: [
          {
            foreignKeyName: "movements_creature_id_fkey"
            columns: ["creature_id"]
            isOneToOne: true
            referencedRelation: "creatures"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      senses: {
        Row: {
          blindsight: number
          created_at: string
          creature_id: string
          darkvision: number
          is_blind_beyond: boolean
          tremor_sense: number
          true_sight: number
        }
        Insert: {
          blindsight?: number
          created_at?: string
          creature_id: string
          darkvision?: number
          is_blind_beyond?: boolean
          tremor_sense?: number
          true_sight?: number
        }
        Update: {
          blindsight?: number
          created_at?: string
          creature_id?: string
          darkvision?: number
          is_blind_beyond?: boolean
          tremor_sense?: number
          true_sight?: number
        }
        Relationships: [
          {
            foreignKeyName: "senses_creature_id_fkey"
            columns: ["creature_id"]
            isOneToOne: true
            referencedRelation: "creatures"
            referencedColumns: ["id"]
          },
        ]
      }
      sizes: {
        Row: {
          created_at: string
          hit_dice: number
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          hit_dice: number
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          hit_dice?: number
          id?: number
          name?: string
        }
        Relationships: []
      }
      skill_bonuses: {
        Row: {
          creature_id: string
          is_expert: boolean
          is_proficient: boolean
          skill_bonus: number
          skill_name: string
        }
        Insert: {
          creature_id: string
          is_expert?: boolean
          is_proficient?: boolean
          skill_bonus?: number
          skill_name: string
        }
        Update: {
          creature_id?: string
          is_expert?: boolean
          is_proficient?: boolean
          skill_bonus?: number
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_bonuses_creature_id_fkey"
            columns: ["creature_id"]
            isOneToOne: true
            referencedRelation: "creatures"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          id: number
          skill_modifier: string
          skill_name: string
        }
        Insert: {
          created_at?: string
          id?: number
          skill_modifier?: string
          skill_name?: string
        }
        Update: {
          created_at?: string
          id?: number
          skill_modifier?: string
          skill_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      "Action Types":
        | "action"
        | "bonus_action"
        | "legendary_action"
        | "reaction"
        | "special_ability"
        | "lair_action"
      "Damage Types":
        | "acid"
        | "bludgeoning"
        | "cold"
        | "fire"
        | "force"
        | "lightning"
        | "necrotic"
        | "piercing"
        | "poison"
        | "psychic"
        | "radiant"
        | "slashing"
        | "thunder"
      Languages:
        | "abyssal"
        | "celestial"
        | "common"
        | "deep-speech"
        | "draconic"
        | "druidic"
        | "dwarvish"
        | "elvish"
        | "giant"
        | "gnomish"
        | "goblin"
        | "halfling"
        | "infernal"
        | "orc"
        | "primordial"
        | "sylvan"
        | "thieves-cant"
        | "undercommon"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
