const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const fileUpload = require('express-fileupload');


const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.redirect('/bde'))


  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null };
      res.render('pages/db', results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })



  .get('/serve/:id', async (req, res) => {

    const client = await pool.connect();
    const result = await client.query(`SELECT * FROM images WHERE imgname='${req.params.id}'`); //

    //var links = await get(LINKS);
    //var index = Math.floor(Math.random() * links.length);
    //var url = links[index];
    res.set({ 'Content-Type': 'image/png' });
    //res.buffer();
    const buf = new Buffer.from(result.rows[0].img, "hex")

    //const body = result.rows[0].img;
    client.release();
    res.end(buf)
    //fetch(url)
    //    .then(res => res.buffer())
    //    .then(body => res.end(body));

  })


  .post('/upload', fileUpload(), express.json(), async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    const client = await pool.connect();
    let image = req.files.image;

    //image.mv('./qwerty.jpg', function (err) {
    //if (err)
    //  return res.status(500).send(err);
    //res.send(`File uploaded! `);
    //});
    const image_name = uuidv4() + image.name ;
    //res.set({ 'Content-Type': 'image/png' });
    //const val = image.data.toString('hex')
    //const b = Buffer.from(val, "hex")
    //console.log(b);
    //res.end(b);//  (image.data)
    const result = await client.query(
      `INSERT INTO images(imgname, img )VALUES('${image_name}', '${image.data.toString('hex')}')`,
      (err, res) => {
        console.log(err, res);
      }
    );
   const result1 = await client.query(
     `INSERT INTO bde_inital(id, sentence, image_path)VALUES(DEFAULT, '${req.body.sentence}', '/serve/${image_name}')`,
      (err, res) => {
        console.log(err, res);
      }
    );

    client.release();

    res.redirect('/bde');

  })



  .post('/upload-notifications', fileUpload(), express.json(), async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    const client = await pool.connect();
    let v_image = req.files.v_image;
    let h_image = req.files.h_image;
    let date = req.body.date;

    //image.mv('./qwerty.jpg', function (err) {
    //if (err)
    //  return res.status(500).send(err);
    //res.send(`File uploaded! `);
    //});
    const vertical_image_name = uuidv4() + v_image.name ;
    const horizontal_image_name = uuidv4() + h_image.name ;
    //res.set({ 'Content-Type': 'image/png' });
    //const val = image.data.toString('hex')
    //const b = Buffer.from(val, "hex")
    //console.log(b);
    //res.end(b);//  (image.data)
    const result = await client.query(
      `INSERT INTO images(imgname, img )VALUES('${vertical_image_name}', '${v_image.data.toString('hex')}')`,
      (err, res) => {
        console.log(err, res);
      }
    );
    const result1 = await client.query(
      `INSERT INTO images(imgname, img )VALUES('${horizontal_image_name}', '${h_image.data.toString('hex')}')`,
      (err, res) => {
        console.log(err, res);
      }
    );

    console.log("running SQL- "+ `INSERT INTO bde(id, sentence, image_vertical_path, image_horizontal_path, due)VALUES(DEFAULT, '${req.body.sentence}', '/serve/${vertical_image_name}',  '/serve/${horizontal_image_name}', '${date}')`);

   const result2 = await client.query(
     `INSERT INTO bde(id, sentence, image_vertical_path, image_horizontal_path, due)VALUES(DEFAULT, '${req.body.sentence}', '/serve/${vertical_image_name}',  '/serve/${horizontal_image_name}', '${date}')`,
      (err, res) => {
        console.log(err, res);
      }
    );

    client.release();

    res.redirect('/bde-notifications');

  })

  .get('/bde', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM bde_inital');
      const results = { 'results': (result) ? result.rows : null };
      res.render('pages/bde', results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/bde-notifications', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM bde');
      const results = { 'results': (result) ? result.rows : null };

      console.log(results);

      res.render('pages/bde-notifications', results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })


  .get('/api/bde_init', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM bde_inital');
      const results = { 'results': (result) ? result.rows : null };
      console.log(JSON.stringify(results));
      //res.render('pages/bde', results);
      client.release();
      res.end(JSON.stringify(results))
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/api/bde_all_notif', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM bde');
      const results = { 'results': (result) ? result.rows : null };
      console.log(JSON.stringify(results));
      //res.render('pages/bde', results);
      client.release();
      res.end(JSON.stringify(results))
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/api/bde_today_notif', async (req, res) => {
    try {
      const client = await pool.connect()
      var moment = require('moment');
      let today = moment().format("YYYY-MM-DD");
      console.log(today);
      const result = await client.query(`SELECT * FROM bde WHERE due='${today}'`);
      const results = { 'results': (result) ? result.rows : null };
      //console.log(JSON.stringify(results));
      //res.render('pages/bde', results);
      client.release();
      res.end(JSON.stringify(results))
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/delete/:id', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query(`DELETE FROM bde_inital where id='${req.params.id}'`);
      client.release();
      res.redirect('/bde');
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/delete_notif/:id', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query(`DELETE FROM bde where id='${req.params.id}'`);
      client.release();
      res.redirect('/bde-notifications');
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })


  .listen(PORT, () => console.log(`Listening on ${PORT}`));


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}