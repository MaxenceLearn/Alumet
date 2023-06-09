// Import librairies
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { mongodbConnectString} = require('./config.json');
//Import middlewares
const authentication = require('./middlewares/authentication');
const alumetAuth = require('./middlewares/api/alumetAuth');
// Import routes
const dashboard = require('./routes/dashboard');
const uploader = require('./routes/uploader');
const alumet = require('./routes/alumet')
const auth = require('./routes/auth');
const portal = require('./routes/portal');
const alumetRender = require('./routes/a');
const preview = require('./routes/preview');
const DBoard = require('./routes/DBoard');

const direct_messages = require('./routes/modules/direct_messages');
const homeworks = require('./routes/modules/homeworks');
const board = require('./routes/modules/board');

const wall = require('./routes/api/wall');
const post = require('./routes/api/post');
const notifications = require('./routes/api/notifications');
// Definition des outils

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('./views'));
app.use(express.static('./cdn'));


// Connexion à la base de données
mongoose.set('strictQuery', true);
mongoose.connect(`${mongodbConnectString}`, 
{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


// Routes global
app.use(authentication);
app.get('/', (req, res) => {
    res.sendFile('main.html', {root: './views/pages'});
});
app.use('/404', (_, res) => {
    res.sendFile('404.html', {root: './views/pages'});
});

app.use('/project', (_, res) => {
    res.sendFile('project.html', {root: './views/pages'});
});

app.use('/update', (_, res) => {
    res.sendFile('update.html', {root: './views/pages'});
});

app.use('/adopter', (_, res) => {
    res.sendFile('why-adopt.html', {root: './views/pages'});
})

// Routes spécifiques
app.use('/a', alumetAuth, alumetRender)
app.use('/portal', alumetAuth, portal);
app.use('/dashboard', dashboard);
app.use('/alumet', alumet);
app.use('/auth', auth);
app.use('/board', DBoard);

// preview processing 
app.use('/preview', preview)

// content delivery network
app.use('/cdn', uploader)
app.use('/preview', preview)
// routes api
app.use('/api/wall', wall);
app.use('/api/post', post); 
app.use('/api/notifications', notifications);

// routes modules
app.use('/api/dm', direct_messages);
app.use('/api/homeworks', homeworks)
app.use('/api/board', board)
module.exports = app;

