function getMedicalLimits(golongan) {
    let rawat_inap_kamar = 0;
    let rawat_inap_total = 0;
    let rawat_jalan = 0;
    let kacamata = 0;
    let persalinan = 0;

    const g = (golongan || '').toUpperCase();
    
    // Group 10 & 9
    if (g.includes('10') || g.includes('9')) {
        rawat_inap_kamar = 1700000;
        rawat_inap_total = 65000000;
        rawat_jalan = 35000000;
        kacamata = 1500000;
        persalinan = 15000000;
    } 
    // Group 8 & 7
    else if (g.includes('8') || g.includes('7')) {
        rawat_inap_kamar = 1250000;
        rawat_inap_total = 55000000;
        rawat_jalan = 30000000;
        kacamata = 1000000;
        persalinan = 12500000;
    } 
    // Group 6, 5, 4
    else if (g.includes('6') || g.includes('5') || g.includes('4')) {
        rawat_inap_kamar = 800000;
        rawat_inap_total = 32500000;
        rawat_jalan = 13500000;
        kacamata = 700000;
        persalinan = 7500000;
    } 
    // Group 3, 2, 2A
    else if (g.includes('3') || g.includes('2')) {
        rawat_inap_kamar = 450000;
        rawat_inap_total = 22500000;
        rawat_jalan = 7000000;
        kacamata = 350000;
        persalinan = 5500000;
    } 
    // Default fallback to Group 4-6
    else {
        rawat_inap_kamar = 800000;
        rawat_inap_total = 32500000;
        rawat_jalan = 13500000;
        kacamata = 700000;
        persalinan = 7500000;
    }

    return {
        rawat_inap_kamar,
        rawat_inap_total,
        rawat_jalan,
        kacamata,
        persalinan
    };
}

module.exports = { getMedicalLimits };
