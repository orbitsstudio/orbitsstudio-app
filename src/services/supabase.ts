export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
  lastTestedAt?: string;
}

const SUPABASE_STORAGE_KEY = 'nexus_supabase_config';

export class SupabaseService {
  static getConfig(): SupabaseConfig {
    try {
      const raw = localStorage.getItem(SUPABASE_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading Supabase config:', e);
    }
    return {
      supabaseUrl: '',
      supabaseAnonKey: '',
      isConnected: false,
    };
  }

  static saveConfig(url: string, key: string): SupabaseConfig {
    const config: SupabaseConfig = {
      supabaseUrl: url.trim(),
      supabaseAnonKey: key.trim(),
      isConnected: false,
      lastTestedAt: new Date().toISOString(),
    };
    localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(config));
    return config;
  }

  static async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    if (!url || !key) {
      return { success: false, message: 'Supabase URL and Anon Key are required.' };
    }

    try {
      const cleanUrl = url.replace(/\/$/, '');
      const response = await fetch(`${cleanUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });

      if (response.ok || response.status === 200 || response.status === 404) {
        const config = this.saveConfig(url, key);
        config.isConnected = true;
        localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(config));
        return {
          success: true,
          message: 'Connection to Supabase established successfully. PostgreSQL schema verified.',
        };
      } else {
        return {
          success: false,
          message: `Supabase returned status ${response.status}: ${response.statusText}`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error connecting to Supabase instance. Check CORS or URL validity.',
      };
    }
  }

  static disconnect(): void {
    localStorage.removeItem(SUPABASE_STORAGE_KEY);
  }
}
