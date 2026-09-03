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
          manually_assigned: boolean;
          organisation_group_id: string;
          organisation_id: string;
          organisation_user_id: string;
          scim_group_mapping_ids: string[];
        };
        Insert: {
          created_at?: string;
          manually_assigned?: boolean;
          organisation_group_id: string;
          organisation_id: string;
          organisation_user_id: string;
          scim_group_mapping_ids?: string[];
        };
        Update: {
          created_at?: string;
          manually_assigned?: boolean;
          organisation_group_id?: string;
          organisation_id?: string;
          organisation_user_id?: string;
          scim_group_mapping_ids?: string[];
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
          manually_assigned: boolean;
          organisation_group_id: string;
          organisation_id: string;
          organisation_user_provision_id: string;
          scim_group_mapping_ids: string[];
        };
        Insert: {
          created_at?: string;
          manually_assigned?: boolean;
          organisation_group_id: string;
          organisation_id: string;
          organisation_user_provision_id: string;
          scim_group_mapping_ids?: string[];
        };
        Update: {
          created_at?: string;
          manually_assigned?: boolean;
          organisation_group_id?: string;
          organisation_id?: string;
          organisation_user_provision_id?: string;
          scim_group_mapping_ids?: string[];
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
      organisation_scim_configurations: {
        Row: {
          created_at: string;
          default_role: Database['public']['Enums']['organisation_role'];
          organisation_id: string;
          token_created_at: string | null;
          token_hash: string | null;
          token_revoked_at: string | null;
          token_suffix: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_role?: Database['public']['Enums']['organisation_role'];
          organisation_id: string;
          token_created_at?: string | null;
          token_hash?: string | null;
          token_revoked_at?: string | null;
          token_suffix?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_role?: Database['public']['Enums']['organisation_role'];
          organisation_id?: string;
          token_created_at?: string | null;
          token_hash?: string | null;
          token_revoked_at?: string | null;
          token_suffix?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_scim_configurations_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: true;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
        ];
      };
      organisation_scim_group_mappings: {
        Row: {
          created_at: string;
          display_name: string;
          external_id: string | null;
          id: string;
          last_synchronized_at: string;
          organisation_cohort_id: string | null;
          organisation_group_id: string | null;
          organisation_id: string;
          source_deleted_at: string | null;
          target_type:
            Database['public']['Enums']['scim_group_target_type'] | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          external_id?: string | null;
          id?: string;
          last_synchronized_at?: string;
          organisation_cohort_id?: string | null;
          organisation_group_id?: string | null;
          organisation_id: string;
          source_deleted_at?: string | null;
          target_type?:
            Database['public']['Enums']['scim_group_target_type'] | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          external_id?: string | null;
          id?: string;
          last_synchronized_at?: string;
          organisation_cohort_id?: string | null;
          organisation_group_id?: string | null;
          organisation_id?: string;
          source_deleted_at?: string | null;
          target_type?:
            Database['public']['Enums']['scim_group_target_type'] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_scim_group_mappi_organisation_cohort_id_organ_fkey';
            columns: ['organisation_cohort_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_cohorts';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_scim_group_mappi_organisation_group_id_organi_fkey';
            columns: ['organisation_group_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_groups';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_scim_group_mappings_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
        ];
      };
      organisation_scim_group_members: {
        Row: {
          created_at: string;
          organisation_id: string;
          organisation_scim_group_mapping_id: string;
          organisation_scim_user_id: string;
        };
        Insert: {
          created_at?: string;
          organisation_id: string;
          organisation_scim_group_mapping_id: string;
          organisation_scim_user_id: string;
        };
        Update: {
          created_at?: string;
          organisation_id?: string;
          organisation_scim_group_mapping_id?: string;
          organisation_scim_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_scim_group_membe_organisation_scim_group_mapp_fkey';
            columns: ['organisation_scim_group_mapping_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_scim_group_mappings';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_scim_group_membe_organisation_scim_user_id_or_fkey';
            columns: ['organisation_scim_user_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_scim_users';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_scim_group_members_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
        ];
      };
      organisation_scim_users: {
        Row: {
          active: boolean;
          created_at: string;
          current_provision_id: string | null;
          display_name: string | null;
          external_id: string | null;
          family_name: string | null;
          given_name: string | null;
          id: string;
          organisation_id: string;
          updated_at: string;
          user_name: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          current_provision_id?: string | null;
          display_name?: string | null;
          external_id?: string | null;
          family_name?: string | null;
          given_name?: string | null;
          id?: string;
          organisation_id: string;
          updated_at?: string;
          user_name: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          current_provision_id?: string | null;
          display_name?: string | null;
          external_id?: string | null;
          family_name?: string | null;
          given_name?: string | null;
          id?: string;
          organisation_id?: string;
          updated_at?: string;
          user_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organisation_scim_users_current_provision_id_organisation__fkey';
            columns: ['current_provision_id', 'organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisation_user_provisions';
            referencedColumns: ['id', 'organisation_id'];
          },
          {
            foreignKeyName: 'organisation_scim_users_organisation_id_fkey';
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
          released_at: string | null;
        };
        Insert: {
          activated_at?: string;
          organisation_contract_period_id: string;
          organisation_id: string;
          organisation_user_id: string;
          released_at?: string | null;
        };
        Update: {
          activated_at?: string;
          organisation_contract_period_id?: string;
          organisation_id?: string;
          organisation_user_id?: string;
          released_at?: string | null;
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
          cohort_manually_assigned: boolean;
          created_at: string;
          id: string;
          invitation_consumed_at: string | null;
          invitation_expires_at: string | null;
          invitation_send_count: number;
          invitation_sent_at: string | null;
          invitation_token_hash: string | null;
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
          scim_cohort_mapping_ids: string[];
          source_external_id: string | null;
          status: Database['public']['Enums']['provisioning_status'];
          updated_at: string;
        };
        Insert: {
          cohort_manually_assigned?: boolean;
          created_at?: string;
          id?: string;
          invitation_consumed_at?: string | null;
          invitation_expires_at?: string | null;
          invitation_send_count?: number;
          invitation_sent_at?: string | null;
          invitation_token_hash?: string | null;
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
          scim_cohort_mapping_ids?: string[];
          source_external_id?: string | null;
          status?: Database['public']['Enums']['provisioning_status'];
          updated_at?: string;
        };
        Update: {
          cohort_manually_assigned?: boolean;
          created_at?: string;
          id?: string;
          invitation_consumed_at?: string | null;
          invitation_expires_at?: string | null;
          invitation_send_count?: number;
          invitation_sent_at?: string | null;
          invitation_token_hash?: string | null;
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
          scim_cohort_mapping_ids?: string[];
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
          cohort_manually_assigned: boolean;
          created_at: string;
          id: string;
          organisation_cohort_id: string | null;
          organisation_id: string;
          role: Database['public']['Enums']['organisation_role'];
          scim_cohort_mapping_ids: string[];
          status: Database['public']['Enums']['organisation_user_status'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cohort_manually_assigned?: boolean;
          created_at?: string;
          id?: string;
          organisation_cohort_id?: string | null;
          organisation_id: string;
          role: Database['public']['Enums']['organisation_role'];
          scim_cohort_mapping_ids?: string[];
          status?: Database['public']['Enums']['organisation_user_status'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cohort_manually_assigned?: boolean;
          created_at?: string;
          id?: string;
          organisation_cohort_id?: string | null;
          organisation_id?: string;
          role?: Database['public']['Enums']['organisation_role'];
          scim_cohort_mapping_ids?: string[];
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
      patient_profile_layers: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          operations: Json;
          patient_profile_id: string;
          schema_version: number;
          source_reference: string | null;
          source_revision: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          operations: Json;
          patient_profile_id: string;
          schema_version: number;
          source_reference?: string | null;
          source_revision?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          operations?: Json;
          patient_profile_id?: string;
          schema_version?: number;
          source_reference?: string | null;
          source_revision?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_profile_layers_patient_profile_id_fkey';
            columns: ['patient_profile_id'];
            isOneToOne: false;
            referencedRelation: 'patient_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      patient_profile_versions: {
        Row: {
          authored_by: string | null;
          change_summary: string;
          content_hash: string;
          created_at: string;
          document: Json;
          id: string;
          patient_profile_id: string;
          published_at: string | null;
          published_by: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          schema_version: number;
          source_reference: string | null;
          source_revision: string | null;
          state: Database['public']['Enums']['patient_profile_version_state'];
          submitted_at: string | null;
          updated_at: string;
          version_number: number;
          withdrawn_at: string | null;
        };
        Insert: {
          authored_by?: string | null;
          change_summary: string;
          content_hash: string;
          created_at?: string;
          document: Json;
          id?: string;
          patient_profile_id: string;
          published_at?: string | null;
          published_by?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          schema_version: number;
          source_reference?: string | null;
          source_revision?: string | null;
          state?: Database['public']['Enums']['patient_profile_version_state'];
          submitted_at?: string | null;
          updated_at?: string;
          version_number: number;
          withdrawn_at?: string | null;
        };
        Update: {
          authored_by?: string | null;
          change_summary?: string;
          content_hash?: string;
          created_at?: string;
          document?: Json;
          id?: string;
          patient_profile_id?: string;
          published_at?: string | null;
          published_by?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          schema_version?: number;
          source_reference?: string | null;
          source_revision?: string | null;
          state?: Database['public']['Enums']['patient_profile_version_state'];
          submitted_at?: string | null;
          updated_at?: string;
          version_number?: number;
          withdrawn_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_profile_versions_patient_profile_id_fkey';
            columns: ['patient_profile_id'];
            isOneToOne: false;
            referencedRelation: 'patient_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      patient_profiles: {
        Row: {
          archived_at: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          organisation_id: string | null;
          scope: Database['public']['Enums']['patient_profile_scope'];
          slug: string;
          source_profile_id: string | null;
          source_version_id: string | null;
          status: Database['public']['Enums']['patient_profile_status'];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          organisation_id?: string | null;
          scope: Database['public']['Enums']['patient_profile_scope'];
          slug: string;
          source_profile_id?: string | null;
          source_version_id?: string | null;
          status?: Database['public']['Enums']['patient_profile_status'];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          organisation_id?: string | null;
          scope?: Database['public']['Enums']['patient_profile_scope'];
          slug?: string;
          source_profile_id?: string | null;
          source_version_id?: string | null;
          status?: Database['public']['Enums']['patient_profile_status'];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_profiles_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_profiles_source_profile_id_fkey';
            columns: ['source_profile_id'];
            isOneToOne: false;
            referencedRelation: 'patient_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_profiles_source_version_lineage_fkey';
            columns: ['source_version_id', 'source_profile_id'];
            isOneToOne: false;
            referencedRelation: 'patient_profile_versions';
            referencedColumns: ['id', 'patient_profile_id'];
          },
        ];
      };
      patient_scenario_steps: {
        Row: {
          created_at: string;
          description: string | null;
          ehr_changes: Json;
          id: string;
          kind: Database['public']['Enums']['patient_scenario_step_kind'];
          patient_profile_id: string;
          patient_profile_layer_id: string;
          position: number;
          scenario_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          ehr_changes?: Json;
          id?: string;
          kind: Database['public']['Enums']['patient_scenario_step_kind'];
          patient_profile_id: string;
          patient_profile_layer_id: string;
          position: number;
          scenario_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          ehr_changes?: Json;
          id?: string;
          kind?: Database['public']['Enums']['patient_scenario_step_kind'];
          patient_profile_id?: string;
          patient_profile_layer_id?: string;
          position?: number;
          scenario_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_scenario_steps_patient_profile_layer_id_patient_pr_fkey';
            columns: ['patient_profile_layer_id', 'patient_profile_id'];
            isOneToOne: false;
            referencedRelation: 'patient_profile_layers';
            referencedColumns: ['id', 'patient_profile_id'];
          },
          {
            foreignKeyName: 'patient_scenario_steps_scenario_id_patient_profile_id_fkey';
            columns: ['scenario_id', 'patient_profile_id'];
            isOneToOne: false;
            referencedRelation: 'patient_scenarios';
            referencedColumns: ['id', 'patient_profile_id'];
          },
        ];
      };
      patient_scenarios: {
        Row: {
          archived_at: string | null;
          care_setting: string;
          created_at: string;
          description: string;
          id: string;
          intended_clinical_audiences: string[];
          organisation_id: string | null;
          patient_profile_id: string;
          patient_profile_version_id: string;
          scope: Database['public']['Enums']['patient_scenario_scope'];
          slug: string;
          status: Database['public']['Enums']['patient_scenario_status'];
          title: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          archived_at?: string | null;
          care_setting: string;
          created_at?: string;
          description: string;
          id?: string;
          intended_clinical_audiences?: string[];
          organisation_id?: string | null;
          patient_profile_id: string;
          patient_profile_version_id: string;
          scope: Database['public']['Enums']['patient_scenario_scope'];
          slug: string;
          status?: Database['public']['Enums']['patient_scenario_status'];
          title: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          archived_at?: string | null;
          care_setting?: string;
          created_at?: string;
          description?: string;
          id?: string;
          intended_clinical_audiences?: string[];
          organisation_id?: string | null;
          patient_profile_id?: string;
          patient_profile_version_id?: string;
          scope?: Database['public']['Enums']['patient_scenario_scope'];
          slug?: string;
          status?: Database['public']['Enums']['patient_scenario_status'];
          title?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'patient_scenarios_organisation_id_fkey';
            columns: ['organisation_id'];
            isOneToOne: false;
            referencedRelation: 'organisations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_scenarios_patient_profile_id_fkey';
            columns: ['patient_profile_id'];
            isOneToOne: false;
            referencedRelation: 'patient_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'patient_scenarios_patient_profile_version_id_patient_profi_fkey';
            columns: ['patient_profile_version_id', 'patient_profile_id'];
            isOneToOne: false;
            referencedRelation: 'patient_profile_versions';
            referencedColumns: ['id', 'patient_profile_id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_organisation_user_provision: {
        Args: {
          expected_status: Database['public']['Enums']['provisioning_status'];
          target_provision_id: string;
          target_user_id: string;
        };
        Returns: {
          cohort_manually_assigned: boolean;
          created_at: string;
          id: string;
          invitation_consumed_at: string | null;
          invitation_expires_at: string | null;
          invitation_send_count: number;
          invitation_sent_at: string | null;
          invitation_token_hash: string | null;
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
          scim_cohort_mapping_ids: string[];
          source_external_id: string | null;
          status: Database['public']['Enums']['provisioning_status'];
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisation_user_provisions';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      apply_scim_group_mapping: {
        Args: { target_mapping_id: string; target_organisation_id: string };
        Returns: undefined;
      };
      clear_organisation_provision_invitation: {
        Args: { expected_token_hash: string; target_provision_id: string };
        Returns: undefined;
      };
      consume_organisation_provision_invitation: {
        Args: { expected_token_hash: string; target_provision_id: string };
        Returns: {
          cohort_manually_assigned: boolean;
          created_at: string;
          id: string;
          invitation_consumed_at: string | null;
          invitation_expires_at: string | null;
          invitation_send_count: number;
          invitation_sent_at: string | null;
          invitation_token_hash: string | null;
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
          scim_cohort_mapping_ids: string[];
          source_external_id: string | null;
          status: Database['public']['Enums']['provisioning_status'];
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisation_user_provisions';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_organisation_cohort: {
        Args: {
          target_ends_on: string;
          target_name: string;
          target_organisation_id: string;
          target_starts_on: string;
        };
        Returns: {
          created_at: string;
          ends_on: string;
          id: string;
          name: string;
          organisation_id: string;
          starts_on: string;
          status: Database['public']['Enums']['group_status'];
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisation_cohorts';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_organisation_contract_period: {
        Args: {
          target_ends_on: string;
          target_learner_seat_allowance: number;
          target_organisation_id: string;
          target_starts_on: string;
        };
        Returns: {
          created_at: string;
          ends_on: string;
          id: string;
          learner_seat_allowance: number;
          organisation_id: string;
          starts_on: string;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisation_contract_periods';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_organisation_group: {
        Args: {
          target_cohort_id?: string;
          target_name: string;
          target_organisation_id: string;
        };
        Returns: {
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
        SetofOptions: {
          from: '*';
          to: 'organisation_groups';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_organisation_memberships: {
        Args: {
          target_cohort_id?: string;
          target_organisation_id: string;
          target_role: Database['public']['Enums']['organisation_role'];
          target_user_ids: string[];
        };
        Returns: {
          membership_id: string;
          reconciled_provision_id: string;
        }[];
      };
      has_organisation_role: {
        Args: {
          allowed_roles: Database['public']['Enums']['organisation_role'][];
          target_organisation_id: string;
        };
        Returns: boolean;
      };
      import_organisation_user_provisions: {
        Args: { import_rows: Json; target_organisation_id: string };
        Returns: {
          import_action: string;
          provision_id: string;
          row_number: number;
        }[];
      };
      is_platform_admin: { Args: never; Returns: boolean };
      issue_organisation_provision_invitation: {
        Args: {
          resend_cooldown_seconds: number;
          target_expires_at: string;
          target_organisation_id: string;
          target_provision_id: string;
          target_token_hash: string;
        };
        Returns: {
          cohort_manually_assigned: boolean;
          created_at: string;
          id: string;
          invitation_consumed_at: string | null;
          invitation_expires_at: string | null;
          invitation_send_count: number;
          invitation_sent_at: string | null;
          invitation_token_hash: string | null;
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
          scim_cohort_mapping_ids: string[];
          source_external_id: string | null;
          status: Database['public']['Enums']['provisioning_status'];
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisation_user_provisions';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      revoke_user_sessions: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
      search_organisation_membership_candidates: {
        Args: {
          page_number?: number;
          page_size?: number;
          search_query?: string;
          target_organisation_id: string;
        };
        Returns: {
          display_name: string;
          email: string;
          pending_provision_id: string;
          pending_provision_role: Database['public']['Enums']['organisation_role'];
          total_records: number;
          user_id: string;
        }[];
      };
      synchronize_scim_user: {
        Args: {
          target_active: boolean;
          target_display_name: string;
          target_external_id: string;
          target_family_name: string;
          target_given_name: string;
          target_organisation_id: string;
          target_scim_user_id: string;
          target_user_name: string;
        };
        Returns: {
          active: boolean;
          created_at: string;
          current_provision_id: string | null;
          display_name: string | null;
          external_id: string | null;
          family_name: string | null;
          given_name: string | null;
          id: string;
          organisation_id: string;
          updated_at: string;
          user_name: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisation_scim_users';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      transition_organisation_user_provision: {
        Args: {
          expected_status: Database['public']['Enums']['provisioning_status'];
          lifecycle_action: string;
          target_organisation_user_id?: string;
          target_provision_id: string;
        };
        Returns: {
          cohort_manually_assigned: boolean;
          created_at: string;
          id: string;
          invitation_consumed_at: string | null;
          invitation_expires_at: string | null;
          invitation_send_count: number;
          invitation_sent_at: string | null;
          invitation_token_hash: string | null;
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
          scim_cohort_mapping_ids: string[];
          source_external_id: string | null;
          status: Database['public']['Enums']['provisioning_status'];
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisation_user_provisions';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_organisation: {
        Args: {
          expected_status: Database['public']['Enums']['organisation_status'];
          target_name: string;
          target_organisation_id: string;
          target_slug: string;
          target_status: Database['public']['Enums']['organisation_status'];
        };
        Returns: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          status: Database['public']['Enums']['organisation_status'];
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisations';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_organisation_cohort: {
        Args: {
          expected_updated_at: string;
          target_cohort_id: string;
          target_ends_on: string;
          target_name: string;
          target_organisation_id: string;
          target_starts_on: string;
          target_status: Database['public']['Enums']['group_status'];
        };
        Returns: {
          created_at: string;
          ends_on: string;
          id: string;
          name: string;
          organisation_id: string;
          starts_on: string;
          status: Database['public']['Enums']['group_status'];
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisation_cohorts';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_organisation_contract_period: {
        Args: {
          expected_updated_at: string;
          target_contract_period_id: string;
          target_ends_on: string;
          target_learner_seat_allowance: number;
          target_organisation_id: string;
          target_starts_on: string;
        };
        Returns: {
          created_at: string;
          ends_on: string;
          id: string;
          learner_seat_allowance: number;
          organisation_id: string;
          starts_on: string;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisation_contract_periods';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_organisation_group: {
        Args: {
          expected_updated_at: string;
          target_cohort_id?: string;
          target_group_id: string;
          target_name: string;
          target_organisation_id: string;
          target_status?: Database['public']['Enums']['group_status'];
        };
        Returns: {
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
        SetofOptions: {
          from: '*';
          to: 'organisation_groups';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_organisation_group_membership: {
        Args: {
          add_provision_ids?: string[];
          add_user_ids?: string[];
          remove_provision_ids?: string[];
          remove_user_ids?: string[];
          target_group_id: string;
          target_organisation_id: string;
        };
        Returns: {
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
        SetofOptions: {
          from: '*';
          to: 'organisation_groups';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_organisation_membership: {
        Args: {
          expected_updated_at: string;
          target_cohort_id?: string;
          target_membership_id: string;
          target_organisation_id: string;
          target_role: Database['public']['Enums']['organisation_role'];
          target_status: Database['public']['Enums']['organisation_user_status'];
        };
        Returns: {
          cohort_manually_assigned: boolean;
          created_at: string;
          id: string;
          organisation_cohort_id: string | null;
          organisation_id: string;
          role: Database['public']['Enums']['organisation_role'];
          scim_cohort_mapping_ids: string[];
          status: Database['public']['Enums']['organisation_user_status'];
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organisation_users';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      group_status: 'active' | 'archived';
      organisation_role: 'org_admin' | 'tutor' | 'learner';
      organisation_status: 'active' | 'suspended' | 'archived';
      organisation_user_status: 'active' | 'suspended';
      patient_profile_scope: 'system' | 'user' | 'organisation';
      patient_profile_status: 'active' | 'archived';
      patient_profile_version_state:
        'draft' | 'in_review' | 'published' | 'superseded' | 'withdrawn';
      patient_scenario_scope: 'system' | 'user' | 'organisation';
      patient_scenario_status: 'draft' | 'published' | 'archived';
      patient_scenario_step_kind: 'beginning' | 'progression';
      provisioning_method: 'scim' | 'csv' | 'manual';
      provisioning_status:
        'pending' | 'linked' | 'inactive' | 'revoked' | 'failed';
      scim_group_target_type: 'cohort' | 'group';
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
      patient_profile_scope: ['system', 'user', 'organisation'],
      patient_profile_status: ['active', 'archived'],
      patient_profile_version_state: [
        'draft',
        'in_review',
        'published',
        'superseded',
        'withdrawn',
      ],
      patient_scenario_scope: ['system', 'user', 'organisation'],
      patient_scenario_status: ['draft', 'published', 'archived'],
      patient_scenario_step_kind: ['beginning', 'progression'],
      provisioning_method: ['scim', 'csv', 'manual'],
      provisioning_status: [
        'pending',
        'linked',
        'inactive',
        'revoked',
        'failed',
      ],
      scim_group_target_type: ['cohort', 'group'],
    },
  },
} as const;
