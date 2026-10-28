import type { IRequest } from '../model/request';

const LIST_KEY = 'kandinsky-requests';
const ID_KEY = 'kandinsky-last-id';

export function saveRequests(list: IRequest[]): void {
	localStorage.setItem(LIST_KEY, JSON.stringify(list));
}

// Поки заявок не створено, список порожній
export function loadRequests(): IRequest[] {
	const raw = localStorage.getItem(LIST_KEY);
	if (raw === null) return [];

	try {
		return JSON.parse(raw) as IRequest[];
	} catch {
		return [];
	}
}

export function nextId(): number {
	const next = Number(localStorage.getItem(ID_KEY) ?? 0) + 1;
	localStorage.setItem(ID_KEY, String(next));
	return next;
}