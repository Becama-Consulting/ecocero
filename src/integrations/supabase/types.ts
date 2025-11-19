export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      absences: {
        Row: {
          absence_type: string | null
          ai_validated_at: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          document_ai_check: Json | null
          document_url: string | null
          document_validated: boolean | null
          employee_id: string
          end_date: string
          id: string
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: string | null
          total_days: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          absence_type?: string | null
          ai_validated_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          document_ai_check?: Json | null
          document_url?: string | null
          document_validated?: boolean | null
          employee_id: string
          end_date: string
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: string | null
          total_days?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          absence_type?: string | null
          ai_validated_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          document_ai_check?: Json | null
          document_url?: string | null
          document_validated?: boolean | null
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: string | null
          total_days?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "absences_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_type: string | null
          assigned_at: string | null
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          line_id: string | null
          message: string
          of_id: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: number | null
          title: string
          type: string | null
        }
        Insert: {
          alert_type?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          line_id?: string | null
          message: string
          of_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number | null
          title: string
          type?: string | null
        }
        Update: {
          alert_type?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          line_id?: string | null
          message?: string
          of_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "production_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_of_id_fkey"
            columns: ["of_id"]
            isOneToOne: false
            referencedRelation: "fabrication_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      bom_items: {
        Row: {
          cantidad_necesaria: number
          cantidad_recibida: number | null
          created_at: string | null
          estado: string | null
          id: string
          lote: string | null
          material_codigo: string
          material_descripcion: string
          notas: string | null
          of_id: string | null
          sap_material_id: string | null
          ubicacion_almacen: string | null
          unidad: string | null
          updated_at: string | null
        }
        Insert: {
          cantidad_necesaria: number
          cantidad_recibida?: number | null
          created_at?: string | null
          estado?: string | null
          id?: string
          lote?: string | null
          material_codigo: string
          material_descripcion: string
          notas?: string | null
          of_id?: string | null
          sap_material_id?: string | null
          ubicacion_almacen?: string | null
          unidad?: string | null
          updated_at?: string | null
        }
        Update: {
          cantidad_necesaria?: number
          cantidad_recibida?: number | null
          created_at?: string | null
          estado?: string | null
          id?: string
          lote?: string | null
          material_codigo?: string
          material_descripcion?: string
          notas?: string | null
          of_id?: string | null
          sap_material_id?: string | null
          ubicacion_almacen?: string | null
          unidad?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bom_items_of_id_fkey"
            columns: ["of_id"]
            isOneToOne: false
            referencedRelation: "fabrication_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string | null
          document_name: string | null
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          issue_date: string | null
          required: boolean | null
          status: string | null
          updated_at: string | null
          uploaded_by: string | null
          validated_at: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name?: string | null
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          issue_date?: string | null
          required?: boolean | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          validated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string | null
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          issue_date?: string | null
          required?: boolean | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          validated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          active: boolean | null
          contract_type: string
          created_at: string | null
          department: string
          dni: string
          email: string
          employee_code: string
          full_name: string
          hire_date: string
          id: string
          phone: string | null
          position: string
          termination_date: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          contract_type: string
          created_at?: string | null
          department: string
          dni: string
          email: string
          employee_code: string
          full_name: string
          hire_date: string
          id?: string
          phone?: string | null
          position: string
          termination_date?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          contract_type?: string
          created_at?: string | null
          department?: string
          dni?: string
          email?: string
          employee_code?: string
          full_name?: string
          hire_date?: string
          id?: string
          phone?: string | null
          position?: string
          termination_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ett_employees: {
        Row: {
          active: boolean | null
          agency: string
          contract_end: string | null
          contract_start: string
          created_at: string | null
          employee_id: string | null
          hourly_rate: number
          id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          agency: string
          contract_end?: string | null
          contract_start: string
          created_at?: string | null
          employee_id?: string | null
          hourly_rate: number
          id?: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          agency?: string
          contract_end?: string | null
          contract_start?: string
          created_at?: string | null
          employee_id?: string | null
          hourly_rate?: number
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ett_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      ett_invoices: {
        Row: {
          agency: string
          created_at: string | null
          discrepancies: Json | null
          extracted_data: Json | null
          file_size: number | null
          file_url: string
          id: string
          invoice_date: string
          invoice_number: string
          period_end: string
          period_start: string
          total_amount: number
          updated_at: string | null
          validated: boolean | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          agency: string
          created_at?: string | null
          discrepancies?: Json | null
          extracted_data?: Json | null
          file_size?: number | null
          file_url: string
          id?: string
          invoice_date: string
          invoice_number: string
          period_end: string
          period_start: string
          total_amount: number
          updated_at?: string | null
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          agency?: string
          created_at?: string | null
          discrepancies?: Json | null
          extracted_data?: Json | null
          file_size?: number | null
          file_url?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          period_end?: string
          period_start?: string
          total_amount?: number
          updated_at?: string | null
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
      }
      fabrication_orders: {
        Row: {
          almacen: string | null
          assignee_id: string | null
          avance_porcentaje: number | null
          cantidad: number | null
          completed_at: string | null
          created_at: string
          customer: string
          end_date: string | null
          estado_sap: string | null
          fecha_albaran: string | null
          fecha_creacion_pedido: string | null
          fecha_entrega_comprometida: string | null
          id: string
          line_id: string | null
          material_preparado: boolean | null
          material_solicitado_at: string | null
          numero_albaran: string | null
          oferta_comercial: string | null
          operarios_asignados: string[] | null
          pedido_comercial: string | null
          priority: number | null
          producto_codigo: string | null
          producto_descripcion: string | null
          propietario_comercial: string | null
          quality_validated: boolean | null
          referencia_proyecto: string | null
          sap_id: string | null
          start_date: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["of_status"]
          supervisor_id: string | null
          unidad: string | null
          updated_at: string
          validated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          almacen?: string | null
          assignee_id?: string | null
          avance_porcentaje?: number | null
          cantidad?: number | null
          completed_at?: string | null
          created_at?: string
          customer: string
          end_date?: string | null
          estado_sap?: string | null
          fecha_albaran?: string | null
          fecha_creacion_pedido?: string | null
          fecha_entrega_comprometida?: string | null
          id?: string
          line_id?: string | null
          material_preparado?: boolean | null
          material_solicitado_at?: string | null
          numero_albaran?: string | null
          oferta_comercial?: string | null
          operarios_asignados?: string[] | null
          pedido_comercial?: string | null
          priority?: number | null
          producto_codigo?: string | null
          producto_descripcion?: string | null
          propietario_comercial?: string | null
          quality_validated?: boolean | null
          referencia_proyecto?: string | null
          sap_id?: string | null
          start_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["of_status"]
          supervisor_id?: string | null
          unidad?: string | null
          updated_at?: string
          validated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          almacen?: string | null
          assignee_id?: string | null
          avance_porcentaje?: number | null
          cantidad?: number | null
          completed_at?: string | null
          created_at?: string
          customer?: string
          end_date?: string | null
          estado_sap?: string | null
          fecha_albaran?: string | null
          fecha_creacion_pedido?: string | null
          fecha_entrega_comprometida?: string | null
          id?: string
          line_id?: string | null
          material_preparado?: boolean | null
          material_solicitado_at?: string | null
          numero_albaran?: string | null
          oferta_comercial?: string | null
          operarios_asignados?: string[] | null
          pedido_comercial?: string | null
          priority?: number | null
          producto_codigo?: string | null
          producto_descripcion?: string | null
          propietario_comercial?: string | null
          quality_validated?: boolean | null
          referencia_proyecto?: string | null
          sap_id?: string | null
          start_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["of_status"]
          supervisor_id?: string | null
          unidad?: string | null
          updated_at?: string
          validated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fabrication_orders_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "production_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabrication_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      of_etapas: {
        Row: {
          cantidad_emitida: number | null
          cantidad_fabricada: number | null
          cantidad_fabricada_acumulada: number | null
          completed_at: string | null
          created_at: string | null
          descripcion: string | null
          documentos_soporte: Json | null
          duracion_estimada: number | null
          duracion_real: number | null
          estado: string | null
          estado_sap: string | null
          id: string
          material_codigo: string | null
          nombre: string
          notas: string | null
          of_id: string | null
          operario_id: string | null
          orden: number
          started_at: string | null
          updated_at: string | null
        }
        Insert: {
          cantidad_emitida?: number | null
          cantidad_fabricada?: number | null
          cantidad_fabricada_acumulada?: number | null
          completed_at?: string | null
          created_at?: string | null
          descripcion?: string | null
          documentos_soporte?: Json | null
          duracion_estimada?: number | null
          duracion_real?: number | null
          estado?: string | null
          estado_sap?: string | null
          id?: string
          material_codigo?: string | null
          nombre: string
          notas?: string | null
          of_id?: string | null
          operario_id?: string | null
          orden: number
          started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          cantidad_emitida?: number | null
          cantidad_fabricada?: number | null
          cantidad_fabricada_acumulada?: number | null
          completed_at?: string | null
          created_at?: string | null
          descripcion?: string | null
          documentos_soporte?: Json | null
          duracion_estimada?: number | null
          duracion_real?: number | null
          estado?: string | null
          estado_sap?: string | null
          id?: string
          material_codigo?: string | null
          nombre?: string
          notas?: string | null
          of_id?: string | null
          operario_id?: string | null
          orden?: number
          started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "of_etapas_of_id_fkey"
            columns: ["of_id"]
            isOneToOne: false
            referencedRelation: "fabrication_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      of_history: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_value: string | null
          of_id: string
          old_value: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_value?: string | null
          of_id: string
          old_value?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_value?: string | null
          of_id?: string
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "of_history_of_id_fkey"
            columns: ["of_id"]
            isOneToOne: false
            referencedRelation: "fabrication_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          advisor_data: Json | null
          base_salary: number | null
          bonuses: number | null
          created_at: string | null
          deductions: number | null
          discrepancies: Json | null
          employee_id: string
          extras: number | null
          gross_salary: number | null
          has_discrepancies: boolean | null
          id: string
          internal_data: Json | null
          net_salary: number | null
          period: string
          status: string | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          advisor_data?: Json | null
          base_salary?: number | null
          bonuses?: number | null
          created_at?: string | null
          deductions?: number | null
          discrepancies?: Json | null
          employee_id: string
          extras?: number | null
          gross_salary?: number | null
          has_discrepancies?: boolean | null
          id?: string
          internal_data?: Json | null
          net_salary?: number | null
          period: string
          status?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          advisor_data?: Json | null
          base_salary?: number | null
          bonuses?: number | null
          created_at?: string | null
          deductions?: number | null
          discrepancies?: Json | null
          employee_id?: string
          extras?: number | null
          gross_salary?: number | null
          has_discrepancies?: boolean | null
          id?: string
          internal_data?: Json | null
          net_salary?: number | null
          period?: string
          status?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      planificacion: {
        Row: {
          creado_por: string | null
          created_at: string | null
          fecha_fin_planificada: string | null
          fecha_inicio_planificada: string | null
          id: string
          notas_planificacion: string | null
          of_id: string | null
          prioridad_custom: string | null
          secuencia: number
          updated_at: string | null
        }
        Insert: {
          creado_por?: string | null
          created_at?: string | null
          fecha_fin_planificada?: string | null
          fecha_inicio_planificada?: string | null
          id?: string
          notas_planificacion?: string | null
          of_id?: string | null
          prioridad_custom?: string | null
          secuencia: number
          updated_at?: string | null
        }
        Update: {
          creado_por?: string | null
          created_at?: string | null
          fecha_fin_planificada?: string | null
          fecha_inicio_planificada?: string | null
          id?: string
          notas_planificacion?: string | null
          of_id?: string | null
          prioridad_custom?: string | null
          secuencia?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planificacion_of_id_fkey"
            columns: ["of_id"]
            isOneToOne: false
            referencedRelation: "fabrication_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      production_lines: {
        Row: {
          capacity: number
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["line_status"]
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["line_status"]
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["line_status"]
          updated_at?: string
        }
        Relationships: []
      }
      production_photos: {
        Row: {
          id: string
          step_id: string
          uploaded_at: string | null
          uploaded_by: string | null
          url: string
          validated: boolean | null
          validated_at: string | null
          validated_by: string | null
          validation_comment: string | null
        }
        Insert: {
          id?: string
          step_id: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          url: string
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
          validation_comment?: string | null
        }
        Update: {
          id?: string
          step_id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
          validation_comment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_photos_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "production_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      production_steps: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string
          id: string
          of_id: string
          photo_url: string | null
          status: Database["public"]["Enums"]["step_status"]
          step_number: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          id?: string
          of_id: string
          photo_url?: string | null
          status?: Database["public"]["Enums"]["step_status"]
          step_number: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          of_id?: string
          photo_url?: string | null
          status?: Database["public"]["Enums"]["step_status"]
          step_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_steps_of_id_fkey"
            columns: ["of_id"]
            isOneToOne: false
            referencedRelation: "fabrication_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          departamento: Database["public"]["Enums"]["departamento"] | null
          email: string
          id: string
          line_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          departamento?: Database["public"]["Enums"]["departamento"] | null
          email: string
          id: string
          line_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          departamento?: Database["public"]["Enums"]["departamento"] | null
          email?: string
          id?: string
          line_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string | null
          date: string
          employee_id: string
          end_time: string
          id: string
          shift_type: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          employee_id: string
          end_time: string
          id?: string
          shift_type: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          employee_id?: string
          end_time?: string
          id?: string
          shift_type?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json | null
          response: Json | null
          retry_count: number | null
          status: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          response?: Json | null
          retry_count?: number | null
          status?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          response?: Json | null
          retry_count?: number | null
          status?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouse_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          completed_at: string | null
          created_at: string
          estimated_duration_hours: number | null
          id: string
          material_type: string | null
          notes: string | null
          of_id: string
          priority: number | null
          status: string
          warehouse_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_duration_hours?: number | null
          id?: string
          material_type?: string | null
          notes?: string | null
          of_id: string
          priority?: number | null
          status?: string
          warehouse_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_duration_hours?: number | null
          id?: string
          material_type?: string | null
          notes?: string | null
          of_id?: string
          priority?: number | null
          status?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_assignments_of_id_fkey"
            columns: ["of_id"]
            isOneToOne: false
            referencedRelation: "fabrication_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_assignments_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          capacity: number
          created_at: string
          current_occupancy: number
          id: string
          location: string | null
          name: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          current_occupancy?: number
          id?: string
          location?: string | null
          name: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          current_occupancy?: number
          id?: string
          location?: string | null
          name?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      vista_materiales_etapas: {
        Row: {
          cantidad_emitida: number | null
          cantidad_fabricada: number | null
          cantidad_fabricada_acumulada: number | null
          customer: string | null
          estado_etapa: string | null
          estado_sap: string | null
          etapa_nombre: string | null
          etapa_numero: number | null
          material_codigo: string | null
          of_sap_id: string | null
          pedido_comercial: string | null
          producto_descripcion: string | null
        }
        Relationships: []
      }
      vista_pedidos_comerciales: {
        Row: {
          customer: string | null
          fecha_entrega_max: string | null
          fecha_pedido: string | null
          ofs_completadas: number | null
          ofs_en_proceso: number | null
          ofs_pendientes: number | null
          pedido_comercial: string | null
          porcentaje_completado: number | null
          propietario_comercial: string | null
          referencia_proyecto: string | null
          total_ofs: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_of_overtime: { Args: never; Returns: undefined }
      check_of_stalled: { Args: never; Returns: undefined }
      get_supervisor_metrics: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      alert_severity: "info" | "warning" | "critical"
      app_role:
        | "admin_global"
        | "admin_departamento"
        | "supervisor"
        | "operario"
        | "quality"
      departamento:
        | "produccion"
        | "logistica"
        | "compras"
        | "rrhh"
        | "comercial"
        | "administrativo"
      line_status: "active" | "paused" | "error"
      of_status:
        | "pendiente"
        | "en_proceso"
        | "completada"
        | "validada"
        | "albarana"
      step_status: "pendiente" | "en_proceso" | "completado" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_severity: ["info", "warning", "critical"],
      app_role: [
        "admin_global",
        "admin_departamento",
        "supervisor",
        "operario",
        "quality",
      ],
      departamento: [
        "produccion",
        "logistica",
        "compras",
        "rrhh",
        "comercial",
        "administrativo",
      ],
      line_status: ["active", "paused", "error"],
      of_status: [
        "pendiente",
        "en_proceso",
        "completada",
        "validada",
        "albarana",
      ],
      step_status: ["pendiente", "en_proceso", "completado", "error"],
    },
  },
} as const
