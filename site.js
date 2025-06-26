/* these are variables for the imported modules*/
/*express is the web framework*/
/*body parser is what reads the form data*/
/*pg is the database*/
/*site is the express instance*/
const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const site = express();

/*allows us to connect to our database*/
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "blog-site",
    password: "59aLkn67mp9",
    port: 5432
});
db.connect();

/*set tells express to use the EJS templates to render HTML*/
/*use express serves files like styles.css from the public folder*/
/*use body parser parses form submissions*/
site.set('view engine', 'ejs');
site.use(express.static('public'));
site.use(bodyParser.urlencoded({extended: true}));

/*gets index page and offers the users the option to sign in or register an account*/
site.get('/', (req, res) => {
    res.render('index');
});

/*renders the register page*/
site.get('/sign-up', (req, res) => {
    res.render('sign-up');
});

/*renders the sign in page*/
site.get('/sign-in', (req, res) => {
    res.render('sign-in');
});

/*renders the posts page getting all posts from the database*/
site.get('/posts', async (req, res) => {
    const posts = await db.query('SELECT * FROM blogs');
    res.render('posts', { posts: posts.rows });
});

/*Creates a new entry into the database if no other user has the same email and allows the user to now sign up under that email and password*/
site.post('/sign-up', async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    const posts = await db.query("SELECT * FROM blogs");

    try {
        const checkResult = await db.query (
            "SELECT * FROM users WHERE email = $1",
            [email],
        );

        if (checkResult.rows.length > 0) {
            res.send("An account already exists with that email, try logging in.");
        } else {
            const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, password]
            );
            console.log(result);
            res.render('posts', { posts: posts.rows });
        }
    } catch(err) {
        console.log(err);
    }
});

/*Allows a user to inut information and checks it against the info in the database to see if the user should be authorized or not*/
site.post ('/sign-in', async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    const posts = await db.query("SELECT * FROM blogs");

    try {
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
        );
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const storedPassword = user.password;

            if (password === storedPassword) {
                res.render('posts', { posts: posts.rows });
            } else {
                res.send("Incorrect password");
            }
        } else {
            res.send("User not found");
        }
    } catch(err) {
        console.log(err);
    }
});

/*when the post form is submitted a new post is created in the database, it redirects back to posts to show the updated posts*/
site.post('/add', async (req, res) => {
    try {
        const { name, title, message, date } = req.body;

        await db.query("INSERT INTO blogs (creator_name, title, body, date_created) VALUES ($1, $2, $3, $4)", [name, title, message, date]);

        res.redirect('/posts');
    } catch (err) {
        console.log(err);
    }
});

/*when the user clicks edit, using the unique id it finds the post and renders edit.ejs passing the post data to be edited*/
site.get('/edit/:id', async (req, res) => {
    const id = req.params.id;

    const post = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
    if (post.rows.length === 0) return res.status(404).send('post not found.');
    res.render('edit', { post: post.rows[0] });
});

/*allows submission of the edited post and updates the post's values then redirects to the homepage*/
site.post('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { title, message, date, name } = req.body;

    const post = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
    if (post.rows.length > 0) {
        await db.query ('UPDATE blogs SET creator_name = $1, title = $2, body = $3, date_created = $4 WHERE blog_id = $5', [ name, title, message, date, id ]);
    }
    res.redirect('/posts');
});

/*finds the post id in the database and removes it then returns to the homepage*/
site.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
    
    const post = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);

    db.query("DELETE FROM blogs WHERE blog_id = $1", [id]);
    res.redirect('/posts');
});

/*creates a listener on port 3000*/
site.listen(3000, () => {
    console.log('server running at port 3000');
});

