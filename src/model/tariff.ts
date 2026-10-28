export type TariffType = 'meter' | 'area' | 'residents';

export interface ITariff {
    id: string;
    type: TariffType;
    tariff: number;
}