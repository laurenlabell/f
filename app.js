const Joi = require('joi'); 
const express = require('express');
const app = express()
const mysql = require('mysql');

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://ez-recipe.herokuapp.com');
  next();
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

// edit a review

// Create connection
const db = mysql.createConnection({
  host     : 'us-cdbr-iron-east-05.cleardb.net',
  user     : 'b6c849268ba824',
  password : '844cfd2b',
  database : 'heroku_2d03395e7f80669'
});

/* Get all users */
app.get('/api/users', (req, res) => {
    const sql = 'select * from user';
    const query = db.query(sql, (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

/* Get a particular user */
app.get('/api/users/:username', (req, res) => {
    const sql = 'select * from user where username = ?';
    const query = db.query(sql, [req.params.username], (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

/* Get all recipes */
app.get('/api/recipes', (req, res) => {
    const sql = 'select * from recipe';
    const query = db.query(sql, (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

/* Get a particular recipe */
app.get('/api/recipes/:recipe_id', (req, res) => {
    const sql = 'select * from recipe where recipe_id = ?';
    const query = db.query(sql, [req.params.recipe_id], (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

/* Get the top 20 recipes i.e. recipes with the highest reviews */
app.get('/api/popular', (req, res) => {
    const sql = 'select r.recipe_id, avg(v.rating) from recipe r, review v where r.recipe_id = v.recipe_id group by r.recipe_id order by avg(v.rating) desc limit 20';
    const query = db.query(sql, (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

/* Get all reviews */
app.get('/api/reviews', (req, res) => {
    const sql = 'select * from review';
    const query = db.query(sql, (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

/* Get a particular review */
app.get('/api/reviews/:username/:recipe_id', (req, res) => {
    const sql = 'select * from review where username = ? and recipe_id = ?';
    const query = db.query(sql, [req.params.username, req.params.recipe_id], (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

/* Get all reviews for a particular recipe */
app.get('/api/reviews/:recipe_id', (req, res) => {
    const sql = 'select * from review where recipe_id = ?';
    const query = db.query(sql, [req.params.recipe_id], (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

/* Get all saves */
app.get('/api/saves', (req, res) => {
    const sql = 'select * from saved';
    const query = db.query(sql, (err, results) => {
        if (err) return res.status(400).send(err.code);
        res.send(results); 
    });
});

/* Get a particular save */
app.get('/api/saves/:username/:recipe_id', (req, res) => {
    const sql = 'select * from saved where username = ? and recipe_id = ?';
    const query = db.query(sql, [req.params.username, req.params.recipe_id], (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

/* Get all recipes a user has saved */
app.get('/api/saves/:username/', (req, res) => {
    const sql = 'select * from saved where username = ?';
    const query = db.query(sql, [req.params.username], (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

/* Insert a user */
app.post('/api/users', (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = req.body;
    console.log(req.body);
    const sql = 'insert into user set ?';
    const query = db.query(sql, user, (err, result) => {
        if (err) return res.status(400).send(err.code);
        res.send(user); /* Maybe should return the result? */
    });
});

/* Insert a recipe */
app.post('/api/recipes', (req, res) => {
    const { error } = validateRecipe(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const recipe = req.body;
    const sql = 'insert into recipe set ?';
    const query = db.query(sql, recipe, (err, result) => {
        if (err) return res.status(400).send(err.code);
        res.send(recipe);
    });
});

/* Insert a review */
app.post('/api/reviews', (req, res) => {
    const { error } = validateReview(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const review = req.body;
    const sql = 'insert into review set ?';
    const query = db.query(sql, review, (err, result) => {
        if (err) return res.status(400).send(err.code);
        res.send(review);
    });
});

/* Insert a "save" */
app.post('/api/saves', (req, res) => {
    const { error } = validateSave(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const save = req.body;
    const sql = 'insert into saved set ?';
    const query = db.query(sql, save, (err, result) => {
        if (err) return res.status(400).send(err.code);
        res.send(save);
    });
});

/* Delete a save */
app.delete('/api/saves/:username/:recipe_id', (req, res) => {
    const sql = 'delete from saved where username = ? and recipe_id = ?';
    const query = db.query(sql, [req.params.username, req.params.recipe_id], (err, results) => {
        if (err) return res.status(400).send(err.code)
        res.send(results); 
    });
});

function validateUser(user) {
    const schema = {
        username: Joi.string().required().max(255),
        firstname: Joi.string().required().max(255),
        lastname: Joi.string().required().max(255),
        password: Joi.string().required().max(255)
    };

    return Joi.validate(user, schema);
};

function validateRecipe(recipe) {
    const schema = {
        recipe_id: Joi.number().integer().required()
    };

    return Joi.validate(recipe, schema);
};

function validateReview(review) {
    const schema = {
        rating: Joi.number().integer().min(0).max(5).required(),
        upvote: Joi.boolean().required(),
        review: Joi.string().max(1500).required(),
        username: Joi.string().max(255).required(),
        recipe_id: Joi.number().integer().required()
    };

    return Joi.validate(review, schema);
};

function validateSave(save) {
    const schema = {
        username: Joi.string().max(255).required(),
        recipe_id: Joi.number().integer().required(),
    };

    return Joi.validate(save, schema);
};


//May want to use this eventually
/*app.use((req, res, next) => {
    if(req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});*/
const port = process.env.PORT || 3000
app.use(express.static("public"));
app.listen(port, () => console.log(`Listening on port ${port}`));

