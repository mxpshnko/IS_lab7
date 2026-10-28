import type { IRequest } from '../model/request';
import { loadRequests, nextId, saveRequests } from './storage';

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png'];

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const formatDate = (d: Date): string =>
	[
		String(d.getDate()).padStart(2, '0'),
		String(d.getMonth() + 1).padStart(2, '0'),
		d.getFullYear(),
	].join('.');

export function initNewRequest(): void {
	const form = document.querySelector<HTMLFormElement>('#request-form');
	const category = document.querySelector<HTMLSelectElement>('#category');
	const flat = document.querySelector<HTMLInputElement>('#flat');
	const description = document.querySelector<HTMLTextAreaElement>('#description');
	const input = document.querySelector<HTMLInputElement>('#photos');
	const previews = document.querySelector<HTMLElement>('#previews');
	const photosError = document.querySelector<HTMLElement>('#photos-error');
	if (!form || !category || !flat || !description || !input || !previews || !photosError) return;

	const fields: Control[] = [category, flat, description];
	let files: File[] = [];

    const params = new URLSearchParams(location.search);
	const presetCategory = params.get('category');
	const presetDescription = params.get('description');

	if (presetCategory) category.value = presetCategory;
	if (presetDescription) description.value = presetDescription;

	const setInvalid = (el: Control, invalid: boolean): void => {
		el.classList.toggle('is-invalid', invalid);
		const message = form.querySelector<HTMLElement>(`#${el.id}-error`);
		if (message) message.hidden = !invalid;
	};

	const validate = (): boolean => {
		let valid = true;
		for (const el of fields) {
			const empty = el.value.trim() === '';
			setInvalid(el, empty);
			if (empty) valid = false;
		}
		return valid;
	};

	for (const el of fields) {
		el.addEventListener('input', () => setInvalid(el, false));
	}

	const renderPreviews = (): void => {
		previews.querySelectorAll('img').forEach((img) => URL.revokeObjectURL(img.src));
		previews.innerHTML = '';

		files.forEach((file, index) => {
			const item = document.createElement('li');
			item.className = 'preview';

			const img = document.createElement('img');
			img.src = URL.createObjectURL(file);
			img.alt = file.name;

			const remove = document.createElement('button');
			remove.type = 'button';
			remove.className = 'preview__remove';
			remove.textContent = '×';
			remove.setAttribute('aria-label', 'Видалити фото');
			remove.addEventListener('click', () => {
				files.splice(index, 1);
				renderPreviews();
			});

			item.append(img, remove);
			previews.append(item);
		});
	};

	input.addEventListener('change', () => {
		let message = '';

		for (const file of Array.from(input.files ?? [])) {
			if (files.length >= MAX_FILES) {
				message = `Не більше ${MAX_FILES} файлів.`;
				break;
			}
			if (!ALLOWED.includes(file.type)) {
				message = 'Дозволені лише файли JPG або PNG.';
				continue;
			}
			if (file.size > MAX_SIZE) {
				message = 'Розмір файлу не більше 5 МБ.';
				continue;
			}
			files.push(file);
		}

		input.value = '';
		photosError.textContent = message;
		photosError.hidden = message === '';
		renderPreviews();
	});

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		if (!validate()) return;

		const request: IRequest = {
			id: nextId(),
			date: formatDate(new Date()),
			category: category.value,
			flat: flat.value.trim(),
			description: description.value.trim(),
			photos: files.map((file) => file.name),
			status: 'new',
		};

		const list = loadRequests();
		list.unshift(request);
		saveRequests(list);

		location.href = `my-requests.html?new=${request.id}`;
	});
}