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
  preferences: Preferences | null,
  groupId: string
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
  const orderedItems: T[] = [];
  const itemMap = items.reduce((map, i) => map.set(i.id, i), new Map<T['id'], T>);
  const preferredIdsSet = new Set(preferredIds);

  for (const preferredId of preferredIds) {
    const item = itemMap.get(preferredId);
    if (item !== undefined) {
      orderedItems.push(item);
    }
  }

  const remainingItems = items
    .filter(({ id }) => !preferredIdsSet.has(id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...orderedItems, ...remainingItems];
}
