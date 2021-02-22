const cookieParser = require('cookie-parser');
//const bodyParser = require('body-parser');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
let routes = require(path.join(__dirname,'./controller/burger_controller'));
const PORT = process.env.PORT || 3000;
const app = express();

// Parse application body as JSON
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use(routes);

app.engine('hbs', exphbs({
    extname: '.hbs'
}));

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, './public')));

app.listen(PORT);
