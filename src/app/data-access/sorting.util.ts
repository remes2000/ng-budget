import { Category, Group, Preferences } from '@models';

export function sortGroupsByPreference(
  groups: Group[],
  preferences: Preferences | null
): Group[] {
  const preferredOrder = preferences?.config?.reportOrdering?.groupOrder;
  if (!preferredOrder) return groups;

  return sortItemsByPreference(groups, preferredOrder);
}

export function sortCategoriesByGroupPreference(
  categories: Category[],
  groupId: string,
  preferences: Preferences | null
): Category[] {
  const preferredOrder =
    preferences?.config?.reportOrdering?.categoryOrder?.[groupId];
  if (!preferredOrder) return categories;

  return sortItemsByPreference(categories, preferredOrder);
}

function sortItemsByPreference<T extends { id: string; name: string }>(
  items: T[],
  preferredIds: string[]
): T[] {
  // Items in preference list (preserves order)
  const preferredItems = preferredIds
    .map(id => items.find(item => item.id === id))
    .filter((item): item is T => item !== undefined);

  // Remaining items (alphabetical fallback)
  const remainingItems = items
    .filter(item => !preferredIds.includes(item.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...preferredItems, ...remainingItems];
}
