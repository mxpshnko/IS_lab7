import type { ITariff } from "../model/tariff";

const TARIFFS_URL = 'public/data/tariffs.json';

const money = (n: number): string =>
    n.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function loadTariffs(): Promise<ITariff[]> {
    const response = await fetch(TARIFFS_URL);
    const json = await response.json();
    return (Array.isArray(json) ? json : json.record) as ITariff[];
}

function setText(row: Element, selector: string, text: string): void {
    const cell = row.querySelector(selector);
    if (cell) cell.textContent = text;
}

export async function initCalculator(): Promise<void> {
    const form = document.querySelector<HTMLFormElement>('#calc-form');
    const total = document.querySelector<HTMLElement>('#total');
	const error = document.querySelector<HTMLElement>('#calc-error');

    if (!form || !total || !error) return;

    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;

    let tariffs: ITariff[] = [];
    try {
        tariffs = await loadTariffs();
    }
    catch (e) {
        console.error('Не вдалося завантажити тарифи', e);
        return;
    }

    const calculate = (): void => {
        let sum = 0;
        let hasError = false;

        for (const tariff of tariffs) {
            const row = form.querySelector(`tr[data-id="${tariff.id}"]`);
            if (!row) continue;

            let volume = 0;

            if (tariff.type === 'meter') {
                const prev = field(`${tariff.id}-prev`);
                const curr = field(`${tariff.id}-curr`);
                volume = Number(curr.value) - Number(prev.value);

                const invalid = prev.value === '' || curr.value === '' || volume < 0;
                curr.classList.toggle('is-invalid', invalid);
                if(invalid) {
                    hasError = true;
                    volume = 0;
                }
            }
            else if (tariff.type === 'area') {
                volume = Math.max(0, Number(field('area').value) || 0);
            }
            else {
                volume = Math.max(0, Number(field('residents').value) || 0);
            }

            const rowSum = Math.round(volume * tariff.tariff * 100) / 100;
            sum += rowSum;

            setText(row, '.calc-volume', volume.toLocaleString('uk-UA'));
			setText(row, '.calc-tariff', money(tariff.tariff));
			setText(row, '.calc-sum', money(rowSum));
        }
        
        error.hidden = !hasError;
        total.textContent = `${money(Math.round(sum * 100) / 100)} грн`;

        total.classList.remove('is-updated');
		void total.offsetWidth;
		total.classList.add('is-updated');
    };

    document.querySelector('#calc-btn')?.addEventListener('click', calculate);
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		calculate();
	});

    form.addEventListener('reset', () => setTimeout(calculate));

	calculate();
}