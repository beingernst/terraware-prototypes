import type { Project } from '../types';

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Forest Restoration - Brazil',
    description: 'Large-scale Atlantic Forest restoration project',
    status: 'Active',
    organization: 'Terraware Brazil',
    createdAt: '2023-06-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Coastal Mangroves - Indonesia',
    description: 'Mangrove ecosystem restoration in coastal regions',
    status: 'Planning',
    organization: 'Terraware Asia',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 3,
    name: 'Alpine Reforestation - Nepal',
    description: 'High-altitude reforestation initiative',
    status: 'Active',
    organization: 'Terraware South Asia',
    createdAt: '2023-09-20T00:00:00Z',
  },
  {
    id: 4,
    name: 'Savanna Restoration - Kenya',
    description: 'Acacia woodland restoration project',
    status: 'Completed',
    organization: 'Terraware Africa',
    createdAt: '2022-03-10T00:00:00Z',
  },
  {
    id: 5,
    name: 'Urban Greening - Singapore',
    description: 'Urban forest corridor development',
    status: 'On Hold',
    organization: 'Terraware Singapore',
    createdAt: '2024-02-28T00:00:00Z',
  },
];
