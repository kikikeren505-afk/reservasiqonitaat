import { supabase } from './supabase';

/**
 * Helper functions untuk query Supabase dengan error handling
 */

export async function getAll<T>(table: string, options?: {
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}) {
  try {
    let query = supabase.from(table).select('*');
    
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as T[];
  } catch (error: any) {
    console.error(`Error fetching from ${table}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function getOne<T>(
  table: string, 
  column: string, 
  value: any
) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(column, value)
      .limit(1)
      .single();
    
    if (error) throw error;
    return data as T;
  } catch (error: any) {
    console.error(`Error fetching from ${table}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function getMany<T>(
  table: string,
  filters: { column: string; value: any }[],
  options?: {
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  try {
    let query = supabase.from(table).select('*');
    
    // Apply filters
    filters.forEach(filter => {
      query = query.eq(filter.column, filter.value);
    });
    
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as T[];
  } catch (error: any) {
    console.error(`Error fetching from ${table}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function insertOne<T>(
  table: string,
  data: any
) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result as T;
  } catch (error: any) {
    console.error(`Error inserting into ${table}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function updateOne<T>(
  table: string,
  id: string | number,
  data: any
) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result as T;
  } catch (error: any) {
    console.error(`Error updating ${table}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function deleteOne(
  table: string,
  id: string | number
) {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error(`Error deleting from ${table}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function countRows(
  table: string,
  filters?: { column: string; value: any }[]
) {
  try {
    let query = supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (filters) {
      filters.forEach(filter => {
        query = query.eq(filter.column, filter.value);
      });
    }
    
    const { count, error } = await query;
    
    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error(`Error counting ${table}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
}