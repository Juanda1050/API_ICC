export interface School {
  id: number;
  name: string;
}

export interface SchoolGroups {
  id: number;
  group: string;
  grade: string;
}

export interface SchoolGroupFilter {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolGroup_id?: number;
}
