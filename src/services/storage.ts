import { BrickList, BrickListItem } from '../types';

const STORAGE_KEY = 'brickhunt_lists';

export function getAllBrickLists(): BrickList[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getBrickList(id: string): BrickList | null {
  const lists = getAllBrickLists();
  return lists.find(list => list.id === id) || null;
}

export function saveBrickList(list: BrickList): void {
  const lists = getAllBrickLists();
  const index = lists.findIndex(l => l.id === list.id);

  list.updatedAt = Date.now();

  if (index >= 0) {
    lists[index] = list;
  } else {
    lists.push(list);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function deleteBrickList(id: string): void {
  const lists = getAllBrickLists();
  const filtered = lists.filter(list => list.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function createBrickList(name: string, setNum?: string): BrickList {
  const newList: BrickList = {
    id: generateId(),
    name,
    setNum,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    items: [],
  };

  saveBrickList(newList);
  return newList;
}

export function addItemToBrickList(listId: string, item: BrickListItem): void {
  const list = getBrickList(listId);
  if (!list) return;

  const existingIndex = list.items.findIndex(
    i => i.part.part_num === item.part.part_num && i.color.id === item.color.id
  );

  if (existingIndex >= 0) {
    list.items[existingIndex].quantity += item.quantity;
  } else {
    list.items.push(item);
  }

  saveBrickList(list);
}

export function updateItemFound(listId: string, itemId: string, found: number): void {
  const list = getBrickList(listId);
  if (!list) return;

  const item = list.items.find(i => i.id === itemId);
  if (item) {
    item.found = Math.min(Math.max(0, found), item.quantity);
    saveBrickList(list);
  }
}

export function removeItemFromBrickList(listId: string, itemId: string): void {
  const list = getBrickList(listId);
  if (!list) return;

  list.items = list.items.filter(i => i.id !== itemId);
  saveBrickList(list);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
