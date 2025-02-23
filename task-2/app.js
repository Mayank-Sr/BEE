const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/posts', (req, res) => {
    fs.readFile(path.join(__dirname, 'posts.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading posts.');
        }
        const posts = JSON.parse(data);
        res.render('home', { posts });
    });
});

app.get('/post', (req, res) => {
    const postId = parseInt(req.query.id);
    fs.readFile(path.join(__dirname, 'posts.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading posts.');
        }
        const posts = JSON.parse(data);
        const post = posts.find(p => p.id === postId);
        if (!post) {
            return res.status(404).send('Post not found.');
        }
        res.render('post', { post });
    });
});

app.post('/add-post', (req, res) => {
    const { title, content } = req.body;
    fs.readFile(path.join(__dirname, 'posts.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading posts.');
        }
        const posts = JSON.parse(data);
        const newPost = {
            id: posts.length + 1,
            title,
            content,
            date: new Date().toISOString()
        };
        posts.push(newPost);
        fs.writeFile(path.join(__dirname, 'posts.json'), JSON.stringify(posts, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving post.');
            }
            res.redirect('/posts');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});