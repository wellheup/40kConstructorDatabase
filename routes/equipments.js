const express = require('express');
const router = express.Router();
const mysql = require('mysql');

let pool = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'root',
	//password: '',
	database: 'cs340_wellheup'
});

router.get('/', function(req, res, next) {
    let context = {};
	
	context.jsscripts = ["equipmentFunctions.js"];
    
    pool.query("SELECT * FROM equipments", function(err, q_equipments)
	{
		if(err)
		{
			next(err);
			return;
		}
        context.equipments = q_equipments;

        res.render('equipments', context);
    });
});

router.delete('/:id', function(req, res) {
	
	var sql = "DELETE FROM equipments WHERE id = ?";
	var inserts = [req.params.id];
	sql = pool.query(sql, inserts, function(error, results, fields) {
		if(error) {
			console.log(error)
			res.write(JSON.stringify(error));
			res.status(400);
			res.end();
		} else {
			res.status(202).end();
		}
	});
});

router.post('/add', function(req, res) {
	
	var sql = "INSERT INTO equipments (name, is_sergeant_weapon, is_special_weapon, point_cost) VALUES (?, ?, ?, ?)";

	var inserts = [req.body.name, req.body.sergWeapon, req.body.specEquip, req.body.cost ];
	
	sql = pool.query(sql, inserts, function(error, results, fields) {
		if(error) {
			console.log(error)
			res.write(json.stringify(error));
			res.status(400);
			res.end();
		} else {
			res.status(202).end();
		}
	});
});

module.exports = router;