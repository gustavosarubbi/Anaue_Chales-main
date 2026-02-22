/**
 * Disponibilidade manual para os chalés
 * Formato: Record<chaletId, string[]> onde string é "YYYY-MM-DD"
 */
// Fevereiro 2026 todo fechado no Master (fallback caso Beds24/Booking não devolva bloqueio)
const MASTER_FEB_2026 = [
    '2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05', '2026-02-06', '2026-02-07',
    '2026-02-08', '2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13', '2026-02-14',
    '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21',
    '2026-02-22', '2026-02-23', '2026-02-24', '2026-02-25', '2026-02-26', '2026-02-27', '2026-02-28',
]

export const MANUAL_BOOKED_DATES: Record<string, string[]> = {
    'chale-anaue': [...MASTER_FEB_2026],
    'chale-2': [
        '2026-02-05', '2026-02-07',
        // Fechado: 10 a 20 de fevereiro
        '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13', '2026-02-14',
        '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20',
        '2026-02-25', // Camping fechado
        '2026-02-28', // Fechado manualmente
        '2026-03-06', '2026-03-07', // Fechado manualmente
        '2026-03-13', // Camping fechado
        '2026-03-14', // Rayssa Lima - Crédito R$700 - Chalé Camping
        '2026-04-17', // Bloqueio solicitado
    ]
}
