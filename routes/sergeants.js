const express = require('express');
const router = express.Router();
const mysql = require('mysql');

let pool = mysql.createPool({
	connectionLimit: 10,
	host: 'classmysql.engr.oregonstate.edu',
	user: 'cs340_wellheup',
	password: 'Akirr@5t@r5und3r',
	database: 'cs340_wellheup'
});

router.get('/', function(req, res, next) {
    
	let context = {};
	
	context.jsscripts = ["sergeantFunctions.js"];
	
	let sergeantsList = "SELECT * FROM sergeants";
	
	pool.query(sergeantsList, function(err, q_sergeants_list)
	{
		if(err)
		{
			next(err);
			return;
		}
		
		context.sergeantsList = q_sergeants_list;
		
		let weapons = "SELECT equipments.id, equipments.name, equipments.is_special_weapon FROM equipments";
				
		pool.query(weapons, function(err, q_possible_equipments)
		{
			if(err)
			{
				next(err);
				return;
			}
			
			context.possible_equipments = q_possible_equipments;
		
			//Get all sergeants equipments that aren't special weapons
			let sql = "SELECT equipments.name, equipments.id FROM sergeants_equipments" + 
					   " INNER JOIN sergeants ON (sergeants_equipments.sergeantid = sergeants.id )" + 
					   " INNER JOIN equipments ON (sergeants_equipments.equipmentid = equipments.id )" + 
					   " WHERE sergeants_equipments.sergeantid = (?) AND equipments.is_special_weapon = 0";
			
			sergeantsLoaded = 0;
			
			for(let i=0; i< context.sergeantsList.length; i++)
			{
				pool.query(sql, [context.sergeantsList[i].id], function(err, q_sergeants_equipments)
				{
					if(err)
					{
						next(err);
						return;
					}
					
					//If he has no weapons, set this to false so we can display None
					if(q_sergeants_equipments.length == 0)
					{
						context.sergeantsList[i].hasEquipment = false;
					}
					else if(q_sergeants_equipments.length == 1)
					{
						context.sergeantsList[i].hasEquipment = true;
						context.sergeantsList[i].sergeants_equipments = q_sergeants_equipments;
						context.sergeantsList[i].onlyOne = true;
					}
					else
					{
						context.sergeantsList[i].hasEquipment = true;
						context.sergeantsList[i].sergeants_equipments = q_sergeants_equipments;
						context.sergeantsList[i].onlyOne = false;
					}
					
					//Get all sergeants equipments that aren't special weapons
					let sql = "SELECT equipments.id, equipments.name FROM sergeants_equipments" + 
							  " INNER JOIN sergeants ON (sergeants_equipments.sergeantid = sergeants.id )" + 
							  " INNER JOIN equipments ON (sergeants_equipments.equipmentid = equipments.id )" + 
							  " WHERE sergeants_equipments.sergeantid = (?) AND equipments.is_special_weapon = 1";

					pool.query(sql, [context.sergeantsList[i].id], function(err, q_sergeants_special_equipments)
					{
						if(err)
						{
							next(err);
							return;
						}
						
						context.sergeantsList[i].special_equipments = q_sergeants_special_equipments;
				
						sergeantsLoaded += 1;
						
						if(sergeantsLoaded >= context.sergeantsList.length)
						{
							finishedLoading(res, context);
						}
					});
				});
			}
		});
    });
});

function finishedLoading(res, context)
{
	res.render('sergeants', context);
}

//Delete sergeant
router.delete('/:id', function(req, res) {
	
	var sql = "DELETE FROM sergeants WHERE id = ?";
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

//Add sergeant
router.post('/add', function(req, res) {

	var sql = "INSERT INTO sergeants (assaultsquadid, name, base_point_cost) VALUES (?, ?, ?);";

	var inserts = [ req.body.squadID, req.body.name, req.body.cost ];
	
	sql = pool.query(sql, inserts, function(error, results, fields) {
		if(error) {
			console.log(error)
			res.write(json.stringify(error));
			res.status(400);
			res.end();
		} else {
			
			var sergeantID = results.insertId;
			
			sql = "INSERT INTO sergeants_equipments (sergeantid, equipmentid) VALUES (?, ?)";
			
			inserts = [ sergeantID, req.body.equipment1ID ];
			
			sql = pool.query(sql, inserts, function(error, results, fields) {
				if(error) {
					console.log(error)
					res.write(json.stringify(error));
					res.status(400);
					res.end();
				} else {
					
					sql = "INSERT INTO sergeants_equipments (sergeantid, equipmentid) VALUES (?, ?)";
					
					inserts = [ sergeantID, req.body.equipment2ID ];
					
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
				}
			});
		}
	});
});

//Update sergeant
router.post('/update', function(req, res) {
	
	var sql = "SELECT equipmentid FROM sergeants_equipments" + 
				" INNER JOIN sergeants ON (sergeants_equipments.sergeantid = sergeants.id )" + 
				" INNER JOIN equipments ON (sergeants_equipments.equipmentid = equipments.id )" + 
				" WHERE sergeants_equipments.sergeantid = (?) AND equipments.is_special_weapon = 0";

	var inserts = [ req.body.sergeantID ];
	
	sql = pool.query(sql, inserts, function(error, results, fields) {
		if(error) {
			console.log(error)
			res.write(json.stringify(error));
			res.status(400);
			res.end();
		} else {
			
			if(results.length == 2)
			{	
				var oldEquipment1 = results[0].equipmentid;
				
				var oldEquipment2 = results[1].equipmentid;
				
				if(oldEquipment1 != null)
				{
					sql = "UPDATE sergeants_equipments SET equipmentid=? WHERE sergeantid=? AND equipmentid=? LIMIT 1";

					inserts = [ req.body.equipment1, req.body.sergeantID, oldEquipment1 ];
				}
				else
				{
					sql = "UPDATE sergeants_equipments SET equipmentid=? WHERE sergeantid=? AND equipmentid IS NULL LIMIT 1";

					inserts = [ req.body.equipment1, req.body.sergeantID ];
				}
				
				sql = pool.query(sql, inserts, function(error, results, fields) {
					if(error) {
						console.log(error)
						res.write(json.stringify(error));
						res.status(400);
						res.end();
					} else {
						
						if(oldEquipment2 != null)
						{
							sql = "UPDATE sergeants_equipments SET equipmentid=? WHERE sergeantid=? AND equipmentid=? LIMIT 1";

							inserts = [ req.body.equipment2, req.body.sergeantID, oldEquipment2 ];
						}
						else
						{
							sql = "UPDATE sergeants_equipments SET equipmentid=? WHERE sergeantid=? AND equipmentid IS NULL LIMIT 1";

							inserts = [ req.body.equipment2, req.body.sergeantID ];
						}
						
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
					}
				});
			}
		}
	});
});

//Delete special equipment
router.post('/deleteSpecialWeapon', function(req, res) {
	
	console.log(req.body.weaponID);
	
	var sql = "DELETE FROM sergeants_equipments WHERE equipmentid = ?";
	var inserts = [ req.body.weaponID ];
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

//Add special equipment
router.post('/addSpecialWeapon', function(req, res) {

	var sql = "INSERT INTO sergeants_equipments (sergeantid, equipmentid) VALUES (?, ?)";

	var inserts = [ req.body.sergeantID, req.body.weaponID ];
	
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