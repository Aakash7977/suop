export interface Batch { id: string; batch_number: string; status: string; version: number }
export interface Recipe { id: string; recipe_number: string; status: string; version: number }
export interface WorkCenter { id: string; code: string; name: string; status: string }
export interface Machine { id: string; code: string; name: string; status: string }
export interface Shift { id: string; code: string; name: string; status: string }
