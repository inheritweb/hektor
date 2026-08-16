export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      organisation_cohorts: {
        Row: {
          created_at: string;
          ends_on: string;
          id: string;
          name: string;
          organisation_id: string;
          starts_on: string;
          status: Database['public']['Enums']['group_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_on: string;
          id?: string;
          name: string;
          organisation_id: string;
          starts_on: string;
          status?: Database['public']['Enums']['group_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_on?: string;
          id?: string;
          name?: string;
          organisation_id?: string;
          starts_on?: string;
          status?: Database['public']['Enums']['group_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_cohorts_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
        ];
      };
      organisation_contract_periods: {
        Row: {
          created_at: string;
          ends_on: string;
          id: string;
          learner_seat_allowance: number;
          organisation_id: string;
          starts_on: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_on: string;
          id?: string;
          learner_seat_allowance: number;
          organisation_id: string;
          starts_on: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_on?: string;
          id?: string;
          learner_seat_allowance?: number;
          organisation_id?: string;
          starts_on?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_contract_periods_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
        ];
      };
      organisation_group_users: {
        Row: {
          created_at: string;
          organisation_group_id: string;
          organisation_id: string;
          organisation_user_id: string;
        };
        Insert: {
          created_at?: string;
          organisation_group_id: string;
          organisation_id: string;
          organisation_user_id: string;
        };
        Update: {
          created_at?: string;
          organisation_group_id?: string;
          organisation_id?: string;
          organisation_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_group_users_organisation_group_id_organisatio_fkey';
            columns: ['organisation_group_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_groups';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_group_users_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'organisation_group_users_organisation_user_id_organisation_fkey';
            columns: ['organisation_user_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_users';
            referencedColumns: ['id', 'organisation_id'];
          },
        ];
      };
      organisation_groups: {
        Row: {
          created_at: string;
          id: string;
          last_synchronized_at: string | null;
          name: string;
          organisation_cohort_id: string | null;
          organisation_id: string;
          provisioning_method:
            Database['public']['Enums']['provisioning_method'] | null;
          source_deleted_at: string | null;
          source_external_id: string | null;
          status: Database['public']['Enums']['group_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_synchronized_at?: string | null;
          name: string;
          organisation_cohort_id?: string | null;
          organisation_id: string;
          provisioning_method?:
            Database['public']['Enums']['provisioning_method'] | null;
          source_deleted_at?: string | null;
          source_external_id?: string | null;
          status?: Database['public']['Enums']['group_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_synchronized_at?: string | null;
          name?: string;
          organisation_cohort_id?: string | null;
          organisation_id?: string;
          provisioning_method?:
            Database['public']['Enums']['provisioning_method'] | null;
          source_deleted_at?: string | null;
          source_external_id?: string | null;
          status?: Database['public']['Enums']['group_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_groups_organisation_cohort_id_organisation_id_fkey';
            columns: ['organisation_cohort_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_cohorts';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_groups_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
        ];
      };
      organisation_provisioned_group_users: {
        Row: {
          created_at: string;
          organisation_group_id: string;
          organisation_id: string;
          organisation_user_provision_id: string;
        };
        Insert: {
          created_at?: string;
          organisation_group_id: string;
          organisation_id: string;
          organisation_user_provision_id: string;
        };
        Update: {
          created_at?: string;
          organisation_group_id?: string;
          organisation_id?: string;
          organisation_user_provision_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_provisioned_grou_organisation_group_id_organi_fkey';
            columns: ['organisation_group_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_groups';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_provisioned_grou_organisation_user_provision__fkey';
            columns: ['organisation_user_provision_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_user_provisions';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_provisioned_group_users_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
        ];
      };
      organisation_seat_activations: {
        Row: {
          activated_at: string;
          organisation_contract_period_id: string;
          organisation_id: string;
          organisation_user_id: string;
        };
        Insert: {
          activated_at?: string;
          organisation_contract_period_id: string;
          organisation_id: string;
          organisation_user_id: string;
        };
        Update: {
          activated_at?: string;
          organisation_contract_period_id?: string;
          organisation_id?: string;
          organisation_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_seat_activations_organisation_contract_period_fkey';
            columns: ['organisation_contract_period_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_contract_periods';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_seat_activations_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'organisation_seat_activations_organisation_user_id_organis_fkey';
            columns: ['organisation_user_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_users';
            referencedColumns: ['id', 'organisation_id'];
          },
        ];
      };
      organisation_user_provisions: {
        Row: {
          created_at: string;
          id: string;
          last_synchronized_at: string | null;
          linked_at: string | null;
          organisation_cohort_id: string | null;
          organisation_id: string;
          organisation_user_id: string | null;
          provisioned_display_name: string | null;
          provisioned_family_name: string | null;
          provisioned_given_name: string | null;
          provisioned_role: Database['public']['Enums']['organisation_role'];
          provisioned_user_name: string;
          provisioning_method: Database['public']['Enums']['provisioning_method'];
          revoked_at: string | null;
          source_external_id: string | null;
          status: Database['public']['Enums']['provisioning_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_synchronized_at?: string | null;
          linked_at?: string | null;
          organisation_cohort_id?: string | null;
          organisation_id: string;
          organisation_user_id?: string | null;
          provisioned_display_name?: string | null;
          provisioned_family_name?: string | null;
          provisioned_given_name?: string | null;
          provisioned_role: Database['public']['Enums']['organisation_role'];
          provisioned_user_name: string;
          provisioning_method: Database['public']['Enums']['provisioning_method'];
          revoked_at?: string | null;
          source_external_id?: string | null;
          status?: Database['public']['Enums']['provisioning_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_synchronized_at?: string | null;
          linked_at?: string | null;
          organisation_cohort_id?: string | null;
          organisation_id?: string;
          organisation_user_id?: string | null;
          provisioned_display_name?: string | null;
          provisioned_family_name?: string | null;
          provisioned_given_name?: string | null;
          provisioned_role?: Database['public']['Enums']['organisation_role'];
          provisioned_user_name?: string;
          provisioning_method?: Database['public']['Enums']['provisioning_method'];
          revoked_at?: string | null;
          source_external_id?: string | null;
          status?: Database['public']['Enums']['provisioning_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_user_provisions_organisation_cohort_id_organi_fkey';
            columns: ['organisation_cohort_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_cohorts';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_user_provisions_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'organisation_user_provisions_organisation_user_id_organisa_fkey';
            columns: ['organisation_user_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_users';
            referencedColumns: ['id', 'organisation_id'];
          },
        ];
      };
      organisation_users: {
        Row: {
          created_at: string;
          id: string;
          organisation_cohort_id: string | null;
          organisation_id: string;
          role: Database['public']['Enums']['organisation_role'];
          status: Database['public']['Enums']['organisation_user_status'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organisation_cohort_id?: string | null;
          organisation_id: string;
          role: Database['public']['Enums']['organisation_role'];
          status?: Database['public']['Enums']['organisation_user_status'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organisation_cohort_id?: string | null;
          organisation_id?: string;
          role?: Database['public']['Enums']['organisation_role'];
          status?: Database['public']['Enums']['organisation_user_status'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_users_organisation_cohort_id_organisation_id_fkey';
            columns: ['organisation_cohort_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_cohorts';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_users_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
        ];
      };
      organisations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          status: Database['public']['Enums']['organisation_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          status?: Database['public']['Enums']['organisation_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          status?: Database['public']['Enums']['organisation_status'];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_organisation_role: {
        Args: {
          allowed_roles: Database['public']['Enums']['organisation_role'][];
          target_organisation_id: string;
        };
        Returns: boolean;
      };
      is_platform_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      group_status: 'active' | 'archived';
      organisation_role: 'org_admin' | 'tutor' | 'learner';
      organisation_status: 'active' | 'suspended' | 'archived';
      organisation_user_status: 'active' | 'suspended';
      provisioning_method: 'scim' | 'csv' | 'manual';
      provisioning_status:
        'pending' | 'linked' | 'inactive' | 'revoked' | 'failed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      group_status: ['active', 'archived'],
      organisation_role: ['org_admin', 'tutor', 'learner'],
      organisation_status: ['active', 'suspended', 'archived'],
      organisation_user_status: ['active', 'suspended'],
      provisioning_method: ['scim', 'csv', 'manual'],
      provisioning_status: [
        'pending',
        'linked',
        'inactive',
        'revoked',
        'failed',
      ],
    },
  },
} as const;
