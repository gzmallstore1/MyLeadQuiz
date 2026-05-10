const express = require('express');
const midtransClient = require('midtrans-client');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
// Baris ini agar background.jpg di folder kamu bisa tampil di web
app.use(express.static(__dirname)); 

// KONFIGURASI MIDTRANS
let snap = new midtransClient.Snap({
    isProduction : false,
    serverKey : process.env.MIDTRANS_SERVER_KEY,
clientKey : process.env.MIDTRANS_CLIENT_KEY
});

// FUNGSI MASKING OTOMATIS (Awal & Akhir)
function maskNama(nama) {
    if (!nama || nama === "Peserta Lainnya") return nama;
    let kata = nama.split(' ');
    return kata.map(w => w.length <= 2 ? w[0] + "*" : w[0] + "****" + w[w.length - 1]).join(' ');
}

// 1. HALAMAN DEPAN (LANDING PAGE)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LeadQuiz Grand Challenge</title>
            <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
            <style>
                body {
                    margin: 0; padding: 20px;
                    background: url('/background.jpg') no-repeat center center fixed;
                    background-size: cover;
                    font-family: 'Roboto', sans-serif;
                    display: flex; flex-direction: column; align-items: center; min-height: 100vh;
                    color: white;
                }
                
                /* Kartu Utama */
                .main-card {
                    background: rgba(0, 0, 0, 0.85);
                    padding: 40px; border-radius: 20px; text-align: center;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.7); backdrop-filter: blur(15px);
                    max-width: 600px; border: 1px solid rgba(0, 212, 255, 0.3);
                    margin-bottom: 30px;
                }
                h1 { font-family: 'Orbitron'; color: #00d4ff; margin: 0; font-size: 35px; text-shadow: 0 0 15px rgba(0,212,255,0.5); }
                .prize-pool { color: #ff4757; font-size: 38px; font-weight: bold; margin: 15px 0; font-family: 'Orbitron'; text-shadow: 0 0 10px rgba(255,71,87,0.4); }
                
                .btn {
                    padding: 20px 50px; background: linear-gradient(45deg, #27ae60, #2ecc71);
                    color: white; border: none; border-radius: 50px; cursor: pointer;
                    font-size: 18px; font-weight: bold; font-family: 'Orbitron';
                    transition: 0.3s; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.5);
                    text-transform: uppercase; margin-top: 10px;
                }
                .btn:hover { transform: scale(1.05); box-shadow: 0 6px 25px rgba(46, 204, 113, 0.7); }

                /* Container Tabel Bawah */
                .info-container {
                    display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; width: 100%; max-width: 1100px;
                }
                .info-box {
                    background: rgba(0, 0, 0, 0.8); padding: 25px; border-radius: 15px;
                    flex: 1; min-width: 320px; border: 1px solid rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                }
                h3 { font-family: 'Orbitron'; color: #00d4ff; font-size: 18px; border-bottom: 2px solid #00d4ff; padding-bottom: 10px; margin-top: 0; display: flex; align-items: center; gap: 10px; }
                
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { text-align: left; color: #00d4ff; padding: 10px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #333; }
                td { padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
                
                .rank-badge { background: #ff9f43; color: black; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
                .price { color: #2ecc71; font-weight: bold; font-size: 12px; }
                .gift-name { font-weight: 500; }
                .winner-name { color: #fff; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="main-card">
                <h1>🏆 LEADQUIZ 🏆</h1>
                <div class="event-period">PERIODE CHALLENGE:<br><b>1 MEI - 30 JULI 2026</b></div>
                <p style="margin: 5px 0; color: #00d4ff; letter-spacing: 4px; font-weight: bold;">GRAND CHALLENGE</p>
                <div class="prize-pool">TOTAL Rp 10.000.000</div>
                <p style="color: #ccc;">Uji pengetahuanmu dan jadilah satu dari 10 pemenang terbaik untuk membawa pulang hadiah impian!</p>
                <p style="font-size: 16px; margin-bottom: 25px;">Biaya Registrasi: <span style="color: #2ecc71; font-weight: bold; border: 1px solid #2ecc71; padding: 2px 10px; border-radius: 5px;">Rp 10.000</span></p>
                <button class="btn" onclick="window.location.href='/bayar'">DAFTAR & BAYAR SEKARANG</button>
            </div>

            <div class="info-container">
                <!-- Tabel 10 Hadiah Barang -->
                <div class="info-box">
                    <h3>🎁 10 HADIAH BARANG</h3>
                    <table>
                        <tr><th>PERINGKAT</th><th>ITEM HADIAH</th><th style="text-align:right">ESTIMASI</th></tr>
                        <tr><td><span class="rank-badge">1</span></td><td class="gift-name">Poco X6 Pro 5G (Gaming Phone)</td><td style="text-align:right" class="price">4.5 Jt</td></tr>
                        <tr><td><span class="rank-badge">2</span></td><td class="gift-name">Monitor Gaming 24" 144Hz</td><td style="text-align:right" class="price">1.7 Jt</td></tr>
                        <tr><td><span class="rank-badge">3</span></td><td class="gift-name">Keyboard Mech. Varmilo TKL</td><td style="text-align:right" class="price">1.2 Jt</td></tr>
                        <tr><td><span class="rank-badge">4</span></td><td class="gift-name">Logitech G435 Wireless</td><td style="text-align:right" class="price">800 Rb</td></tr>
                        <tr><td><span class="rank-badge">5</span></td><td class="gift-name">TWS Anker Soundcore ANC</td><td style="text-align:right" class="price">500 Rb</td></tr>
                        <tr><td><span class="rank-badge">6-10</span></td><td class="gift-name">Gaming Gear & E-Wallet</td><td style="text-align:right" class="price">1.3 Jt</td></tr>
                    </table>
                    <p style="font-size: 11px; color: #888; margin-top: 15px; font-style: italic;">*Hadiah dapat berubah sewaktu-waktu dengan nilai yang setara.</p>
                </div>

                <!-- Tabel 10 Leaderboard (Dummy Data) -->
                <div class="info-box">
    <h3>📊 TOP 10 LEADERS</h3>
    <table>
        <tr><th>POSISI</th><th>NAMA PESERTA</th><th style="text-align:right">SKOR</th></tr>
        <tr><td>#1</td><td class="winner-name">A****m</td><td style="text-align:right; color: #00d4ff;">985</td></tr>
        <tr><td>#2</td><td class="winner-name">R****r</td><td style="text-align:right; color: #00d4ff;">960</td></tr>
        <tr><td>#3</td><td class="winner-name">S****s</td><td style="text-align:right; color: #00d4ff;">945</td></tr>
        <tr><td>#4</td><td class="winner-name">B****e</td><td style="text-align:right; color: #00d4ff;">930</td></tr>
        <tr><td>#5</td><td class="winner-name">P****y</td><td style="text-align:right; color: #00d4ff;">915</td></tr>
        <tr><td>#6-10</td><td class="winner-name">P****a</td><td style="text-align:right; color: #00d4ff;">---</td></tr>
    </table>
    <div style="text-align: center; margin-top: 20px;">
        <span style="font-size: 11px; color: #888;">*Data diproteksi (Hanya huruf awal & akhir)</span>
    </div>
</div>
        </body>
        </html>
    `);
});

// 2. PROSES PEMBAYARAN
app.get('/bayar', async (req, res) => {
    let parameter = {
        "transaction_details": { "order_id": "LQ-" + Date.now(), "gross_amount": 10000 },
        "callbacks": { "finish": "http://localhost:3000/mulai-kuis" }
    };
    try {
        const transaction = await snap.createTransaction(parameter);
        res.redirect(transaction.redirect_url);
    } catch (e) { res.send("Gagal bayar: " + e.message); }
});

// 3. HALAMAN KUIS
app.get('/mulai-kuis', (req, res) => {
    res.sendFile(path.join(__dirname, 'kuis.html'));
});

// 4. API SIMPAN SKOR KE DATA (skor.json)
app.post('/simpan-skor', (req, res) => {
    const dataBaru = req.body;
    fs.readFile('skor.json', (err, data) => {
        let list = [];
        if (!err && data.length > 0) list = JSON.parse(data);
        list.push(dataBaru);
        list.sort((a, b) => b.skor - a.skor); // Urutkan skor tertinggi
        fs.writeFile('skor.json', JSON.stringify(list.slice(0, 10)), () => {
            res.json({ ok: true });
        });
    });
});

// 5. API AMBIL LEADERBOARD
app.get('/ambil-leaderboard', (req, res) => {
    fs.readFile('skor.json', (err, data) => {
        if (err) return res.json([]);
        res.json(JSON.parse(data));
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));