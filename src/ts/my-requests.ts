import { STATUS_TEXT, type IRequest } from '../model/request';
import { loadRequests, saveRequests } from './storage';

// захист від вставки HTML через опис заявки
const escapeHtml = (text: string): string =>
	text.replace(/[&<>"']/g, (char) => {
		const map: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
		};
		return map[char];
	});

export function initMyRequests(): void {
	const body = document.querySelector<HTMLTableSectionElement>('#requests-body');
	const empty = document.querySelector<HTMLElement>('#requests-empty');
	if (!body || !empty) return;

	let list: IRequest[] = loadRequests();
	const newId = Number(new URLSearchParams(location.search).get('new'));

	const rowHtml = (r: IRequest, i: number): string => `
	    <tr data-id="${r.id}" style="--i: ${i}"${r.id === newId ? ' class="is-new"' : ''}>
			<td data-label="№"><span class="requests-table__num">№${r.id}</span></td>
			<td data-label="Дата">${r.date}</td>
			<td data-label="Категорія">${escapeHtml(r.category)}</td>
			<td data-label="Статус"><span class="status status--${r.status}">${STATUS_TEXT[r.status]}</span></td>
			<td data-label="Дія">
				<div class="requests-table__actions">
					<button class="btn-outline btn-small" type="button" data-action="open">Відкрити</button>
					<button class="btn-danger btn-small" type="button" data-action="delete">Видалити</button>
				</div>
			</td>
		</tr>
		<tr class="requests-table__details" data-details="${r.id}" hidden>
			<td colspan="5">
				<div class="requests-table__info">
					<p><strong>Квартира:</strong> ${escapeHtml(r.flat)}</p>
					<p><strong>Опис:</strong> ${escapeHtml(r.description)}</p>
					<p><strong>Фото:</strong> ${r.photos.length}</p>
				</div>
			</td>
		</tr>`;

	body.innerHTML = list.map(rowHtml).join('');
	empty.hidden = list.length > 0;

	body.addEventListener('click', (e) => {
		const button = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
		if (!button) return;

		const row = button.closest<HTMLTableRowElement>('tr');
		if (!row) return;
		const id = Number(row.dataset.id);
		const details = body.querySelector<HTMLElement>(`tr[data-details="${id}"]`);

		if (button.dataset.action === 'open' && details) {
			details.hidden = !details.hidden;
		}

		if (button.dataset.action === 'delete') {
			if (!confirm(`Видалити заявку №${id}?`)) return;

			row.classList.add('is-removing');
			setTimeout(() => {
				row.remove();
				details?.remove();
				list = list.filter((r) => r.id !== id);
				saveRequests(list);
				empty.hidden = list.length > 0;
			}, 300);
		}
	});
}