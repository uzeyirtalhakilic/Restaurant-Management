const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL bağlantısı
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'aliosman123',
  database: 'Restaurant_ordering'
});

// Bağlantıyı test et
db.connect((err) => {
  if (err) {
    console.error('MySQL bağlantı hatası:', err);
    return;
  }
  console.log('MySQL veritabanına başarıyla bağlandı');
});

// 1. Menüdeki tüm ürünleri getir
app.get('/menu', (req, res) => {
  db.query('SELECT * FROM menu_items', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// 1b. Menüdeki tüm ürünleri (menu_items) getir
app.get('/menu_items', (req, res) => {
  db.query('SELECT * FROM menu_items', (err, results) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).json({ error: 'Menü ürünleri alınırken bir hata oluştu.' });
    }
    res.json(results);
  });
});

// Menüye yeni ürün ekle
app.post('/menu_items', (req, res) => {
  const { name, description, price, image_url } = req.body;

  // Temel validasyon
  if (!name || !description || !price) {
    return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun.' });
  }

  db.query(
    'INSERT INTO menu_items (name, description, price, image_url) VALUES (?, ?, ?, ?)',
    [name, description, price, image_url || null],
    (err, result) => {
      if (err) {
        console.error('Veritabanı hatası:', err);
        return res.status(500).json({ error: 'Ürün eklenirken bir hata oluştu.' });
      }
      res.status(201).json({ message: 'Ürün başarıyla eklendi', id: result.insertId });
    }
  );
});

// 2. Yeni sipariş oluştur
app.post('/order', (req, res) => {
  const { table_id, order_items } = req.body;
  
  // Önce orders tablosuna siparişi ekle
  db.query(
    'INSERT INTO orders (table_id, status) VALUES (?, "Preparing")',
    [table_id],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const orderId = result.insertId;
      
      // Sipariş detaylarını order_items tablosuna ekle
      const orderItems = order_items.map(item => [
        orderId,
        item.menu_item_id,
        item.quantity
      ]);

      db.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES ?',
        [orderItems],
        (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json({ 
            message: 'Sipariş başarıyla oluşturuldu',
            order_id: orderId 
          });
        }
      );
    }
  );
});

// 3. Mutfak için siparişleri listele (her siparişin altında ürünler dizi olarak, masa adı ile)
app.get('/orders', (req, res) => {
  db.query(
    `SELECT o.id as order_id, o.status, o.created_at, o.table_id,
            t.name as table_name,
            oi.menu_item_id, oi.quantity,
            m.name as item_name
     FROM orders o
     JOIN tables t ON o.table_id = t.id
     JOIN order_items oi ON o.id = oi.order_id
     JOIN menu_items m ON oi.menu_item_id = m.id
     ORDER BY o.created_at DESC, o.id DESC`,
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      // Gruplama
      const orders = [];
      const map = {};
      for (const row of results) {
        if (!map[row.order_id]) {
          map[row.order_id] = {
            id: row.order_id,
            status: row.status,
            created_at: row.created_at,
            table_id: row.table_id,
            table_name: row.table_name,
            items: []
          };
          orders.push(map[row.order_id]);
        }
        map[row.order_id].items.push({
          menu_item_id: row.menu_item_id,
          name: row.item_name,
          quantity: row.quantity
        });
      }
      res.json(orders);
    }
  );
});

// 4. Sipariş durumunu güncelle
app.put('/order/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'Ready' && status !== 'Preparing') {
    res.status(400).json({ error: 'Geçersiz durum' });
    return;
  }

  db.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Sipariş bulunamadı' });
        return;
      }
      res.json({ message: 'Sipariş durumu güncellendi' });
    }
  );
});

// Menü ürününü sil
app.delete('/menu_items/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM menu_items WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).json({ error: 'Ürün silinirken bir hata oluştu.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı.' });
    }
    res.json({ message: 'Ürün başarıyla silindi' });
  });
});

// Menü ürününü güncelle
app.put('/menu_items/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url } = req.body;

  // Temel validasyon
  if (!name || !description || !price) {
    return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun.' });
  }

  db.query(
    'UPDATE menu_items SET name = ?, description = ?, price = ?, image_url = ? WHERE id = ?',
    [name, description, price, image_url || null, id],
    (err, result) => {
      if (err) {
        console.error('Veritabanı hatası:', err);
        return res.status(500).json({ error: 'Ürün güncellenirken bir hata oluştu.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Ürün bulunamadı.' });
      }
      res.json({ message: 'Ürün başarıyla güncellendi' });
    }
  );
});

// Siparişi sil
app.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  
  // Önce order_items tablosundan ilgili siparişin detaylarını sil
  db.query('DELETE FROM order_items WHERE order_id = ?', [id], (err) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).json({ error: 'Sipariş detayları silinirken bir hata oluştu.' });
    }

    // Sonra orders tablosundan siparişi sil
    db.query('DELETE FROM orders WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Veritabanı hatası:', err);
        return res.status(500).json({ error: 'Sipariş silinirken bir hata oluştu.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Sipariş bulunamadı.' });
      }
      res.json({ message: 'Sipariş başarıyla silindi' });
    });
  });
});

// Siparişi (masa numarası ve ürünler) güncelle
app.put('/orders/:id', (req, res) => {
  const { id } = req.params;
  const { table_id, items } = req.body; // items: [{menu_item_id, quantity}, ...]

  if (!table_id || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Eksik veya hatalı veri.' });
  }

  // Önce masa id'sini güncelle
  db.query('UPDATE orders SET table_id = ? WHERE id = ?', [table_id, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Masa güncellenemedi.' });
    }

    // Siparişin eski ürünlerini sil
    db.query('DELETE FROM order_items WHERE order_id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Sipariş ürünleri silinemedi.' });
      }

      // Yeni ürünleri ekle
      if (items.length === 0) {
        return res.json({ message: 'Sipariş güncellendi (ürünsüz).' });
      }
      const values = items.map(item => [id, item.menu_item_id, item.quantity]);
      db.query('INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES ?', [values], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Sipariş ürünleri eklenemedi.' });
        }
        res.json({ message: 'Sipariş başarıyla güncellendi.' });
      });
    });
  });
});

// Tüm masaları getir
app.get('/tables', (req, res) => {
  db.query('SELECT * FROM tables', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Yeni masa ekle
app.post('/tables', (req, res) => {
  const { name, type, description } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Masa adı ve tipi zorunludur.' });
  }

  db.query(
    'INSERT INTO tables (name, type, description) VALUES (?, ?, ?)',
    [name, type, description],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Masa eklenirken bir hata oluştu.' });
      }
      res.status(201).json({ message: 'Masa başarıyla eklendi.', id: result.insertId });
    }
  );
});

// Masa güncelle
app.put('/tables/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, description } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Masa adı ve tipi zorunludur.' });
  }

  db.query(
    'UPDATE tables SET name = ?, type = ?, description = ? WHERE id = ?',
    [name, type, description, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Masa güncellenirken bir hata oluştu.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Masa bulunamadı.' });
      }
      res.json({ message: 'Masa başarıyla güncellendi.' });
    }
  );
});

// Masa sil
app.delete('/tables/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tables WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Masa silinirken bir hata oluştu.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Masa bulunamadı.' });
    }
    res.json({ message: 'Masa başarıyla silindi.' });
  });
});

// Tüm çalışanları getir
app.get('/staff', (req, res) => {
  db.query('SELECT * FROM staff', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Yeni çalışan ekle
app.post('/staff', (req, res) => {
  const { name, hire_date, work_hours } = req.body;
  if (!name || !hire_date) {
    return res.status(400).json({ error: 'İsim ve işe başlama tarihi zorunludur.' });
  }
  db.query(
    'INSERT INTO staff (name, hire_date, work_hours) VALUES (?, ?, ?)',
    [name, hire_date, work_hours || ''],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Çalışan eklenirken bir hata oluştu.' });
      }
      res.status(201).json({ message: 'Çalışan başarıyla eklendi.', id: result.insertId });
    }
  );
});

// Çalışan sil
app.delete('/staff/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM staff WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Çalışan silinirken bir hata oluştu.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Çalışan bulunamadı.' });
    }
    res.json({ message: 'Çalışan başarıyla silindi.' });
  });
});

// Çalışan güncelle
app.put('/staff/:id', (req, res) => {
  const { id } = req.params;
  const { name, hire_date, work_hours } = req.body;
  if (!name || !hire_date) {
    return res.status(400).json({ error: 'İsim ve işe başlama tarihi zorunludur.' });
  }
  db.query(
    'UPDATE staff SET name = ?, hire_date = ?, work_hours = ? WHERE id = ?',
    [name, hire_date, work_hours || '', id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Çalışan güncellenirken bir hata oluştu.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Çalışan bulunamadı.' });
      }
      res.json({ message: 'Çalışan başarıyla güncellendi.' });
    }
  );
});

// Müşteri girişi
app.post('/customer_login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM tables WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Veritabanı hatası.' });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
      }
      res.json({ message: 'Giriş başarılı', table: results[0] });
    }
  );
});

// En popüler ürünleri getir
app.get('/popular_items', (req, res) => {
  db.query(
    `SELECT m.id, m.name, m.description, m.price, m.image_url, COALESCE(SUM(oi.quantity), 0) as total_ordered
     FROM menu_items m
     LEFT JOIN order_items oi ON m.id = oi.menu_item_id
     GROUP BY m.id, m.name, m.description, m.price, m.image_url
     ORDER BY total_ordered DESC, m.name ASC`,
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(results);
    }
  );
});

app.listen(port, () => {
  console.log(`Server http://localhost:${port} adresinde çalışıyor`);
}); 