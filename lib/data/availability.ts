/**
 * Disponibilidade manual para os chalés
 * Formato: Record<chaletId, string[]> onde string é "YYYY-MM-DD"
 */
export const MANUAL_BOOKED_DATES: Record<string, string[]> = {
    'chale-anaue': [
        // Exemplo: '2024-02-10', '2024-02-11'
    ],
    'chale-2': [
        '2026-02-05', '2026-02-07',
        // Fechado: 10 a 20 de fevereiro
        '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13', '2026-02-14',
        '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20',
        '2026-02-28', // Fechado manualmente
        '2026-03-06', '2026-03-07', // Fechado manualmente
        '2026-03-14', // Rayssa Lima - Crédito R$700 - Chalé Camping
    ]
}
