export type RequestStatus = 'new' | 'assigned' | 'work' | 'queue' | 'closed';

export interface IRequest {
    id: number;
    date: string;
    category: string;
    flat: string;
    description: string;
    photos: string[];
    status: RequestStatus;
}

export const STATUS_TEXT: Record<RequestStatus, string> = {
    new: 'Нова',
	assigned: 'Майстра призначено',
	work: 'В роботі',
	queue: 'В черзі',
	closed: 'Закрито',
};