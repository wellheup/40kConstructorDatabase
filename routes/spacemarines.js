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
    render_spacemarinesContext(res, next);
});

router.post('/', function(req, res, next) {
	if(req.body.updateSpaceMarine){
		updateSpaceMarine(req, res, next);
	}
	else if(req.body.removeSpaceMarine){
		removeSpaceMarine(req, res, next);
	}
	else if(req.body.addSpaceMarine){
		addSpaceMarine(req, res, next);
	}
	else{
		render_spacemarinesContext(res, next);
	}
	
});

function render_spacemarinesContext(res, next){
	let context = {};
    
	let promiseGetMarines = function(context){
		let sql = "SELECT * FROM spacemarines";
		//console.log("promiseGetMarines");
		return new Promise(function(resolve, reject){
			pool.query(sql, function(err, q_spacemarines){
				if(err){
					console.log("error in query to get marines for spacemarines page");
					next(err);
					return;
				}
				context.spacemarines = q_spacemarines;
					resolve(context);
			});
		});
	};

	let promiseGetMarineWeapons = function(context){
		let sql = "SELECT equipments.id, equipments.name FROM spacemarines_equipments "+
		"INNER JOIN spacemarines ON (spacemarines_equipments.spacemarineid = spacemarines.id ) " +
		"INNER JOIN equipments ON (spacemarines_equipments.equipmentid = equipments.id ) " +
		"WHERE spacemarines_equipments.spacemarineid = (?) LIMIT 2";
		return new Promise(function(resolve, reject){
			queriesToComplete = 0;
			completedQueries = 0;
			for(let k=0; k<context.spacemarines.length; k++){
				queriesToComplete +=1;
				pool.query(sql, [context.spacemarines[k].id], function(err, q_weapons){//REPLACE THE 1 WITH A QUESTION MARK FOR DYNAMIC INTERPRETATION
					if(err){
						console.log("error in query to get marine weapons");
						reject(context);
						next(err);
						return;
					}
					context.spacemarines[k].weapons = q_weapons;
					completedQueries++;
					if(completedQueries == queriesToComplete){
						resolve(context);
					}
				});
			}
		});
	};

	let promiseGetPossibleBasicWeapons = function(context){
		let sql = "SELECT equipments.id, equipments.name, equipments.point_cost FROM equipments " +
		"WHERE equipments.is_special_weapon = 0 and equipments.is_sergeant_weapon = 0";
		//console.log("promiseGetPossibleBasicWeapons");
		return new Promise(function(resolve, reject){
			pool.query(sql, function(err, q_possibleBasicWeapons){//REPLACE THE 1 WITH A QUESTION MARK FOR DYNAMIC INTERPRETATION
				if(err){
					console.log("error in promiseGetPossibleBasicWeapons");
					reject(context);
					next(err);
					return;
				}
				context.possibleBasicWeapons = q_possibleBasicWeapons;
				resolve(context);
			});
		});
	};

	promiseGetPossibleBasicWeapons(context).then(function(context){
		return promiseGetMarines(context);
	}).then(function(context){
		return promiseGetMarineWeapons(context);
	}).then(function(context){
		res.render('spacemarines', context);
	})/*.catch(function(){
		res.redirect('/home');
	});*/

}

function updateSpaceMarine(req, res, next){
	//find the marine to update
	pool.query("SELECT * FROM spacemarines WHERE id=?", [req.body.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		if(result.length == 1){
			let curVals = result[0];
			//update the marine
			pool.query("UPDATE spacemarines SET assaultsquadid=?, name=?, base_point_cost=? WHERE id=?", 
				[req.body.assaultsquadid || curVals.assaultsquadid, req.body.name || curVals.name, req.body.base_point_cost || curVals.base_point_cost, req.body.id], function(err, result){
				if(err){
					next(err);
					return;
				}
				if(req.body.currentWeapon0 != req.body.newWeapon0 || req.body.currentWeapon1 != req.body.newWeapon1){
					//find an equipment associated with the marine that matches weapon0 by id
					pool.query("SELECT * FROM spacemarines_equipments WHERE spacemarineid=? AND equipmentid=?", [req.body.id, req.body.currentWeapon0], function(err, result){
						if(err){
							next(err);
							return;
						}
						if(result.length == 1 || result.length==2){
							//update equipment associated with the marine that matches weapon0 by id
							let curVals = result[0];
							pool.query("UPDATE spacemarines_equipments SET equipmentid=? WHERE spacemarineid=? AND equipmentid=? LIMIT 1",
								[req.body.newWeapon0 || curVals.equipmentid, curVals.spacemarineid, curVals.equipmentid],
								function(err, result){
								if(err){
									next(err);
									return;
								}
								if(req.body.currentWeapon1 != req.body.newWeapon1){
									//find an equipment associated with the marine that matches weapon1 by id
									pool.query("SELECT * FROM spacemarines_equipments WHERE spacemarineid=? AND equipmentid=?", [req.body.id, req.body.currentWeapon1], function(err, result){
										if(err){
											next(err);
											return;
										}
										if(result.length == 1 || result.length==2){
											let curVals = result[0];
											//update equipment associated with the marine that matches weapon1 by id
											pool.query("UPDATE spacemarines_equipments SET equipmentid=? WHERE spacemarineid=? AND equipmentid=? LIMIT 1",
												[req.body.newWeapon1 || curVals.equipmentid, curVals.spacemarineid, curVals.equipmentid],
												function(err, result){
												if(err){
													next(err);
													return;
												}
												render_spacemarinesContext(res, next);
											});
										}
										else{
											render_spacemarinesContext(res, next);
										}
									});
								}
								else{
									render_spacemarinesContext(res, next);
								}
							});
						}
						else{
							console.log("error in updating marine: finding marine equipment");
							render_spacemarinesContext(res, next);
						}
					});
				}
				else{
					render_spacemarinesContext(res, next);
				}
			});
		}
		else{
			console.log("error in updating marine: finding marine");
			render_spacemarinesContext(res, next);
		}
	});
}

function removeSpaceMarine(req, res, next){
	console.log('removing marine');
	pool.query("SELECT * FROM spacemarines WHERE spacemarines.id=?", [req.body.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		if(result.length == 1){
			let curVals = result[0];
			pool.query("DELETE FROM spacemarines WHERE spacemarines.id=?", [req.body.id], function(err, result){
				if(err){
					next(err);
					return;
				}
				render_spacemarinesContext(res, next);
			});
		}
		else{
			console.log("error finding spacemarine to delete");
			render_spacemarinesContext(res, next);
		}
	});
}

function addSpaceMarine(req, res, next){
	pool.query("INSERT INTO spacemarines (assaultsquadid, name, base_point_cost) VALUES (?, ?, ?)",
		[req.body.assaultsquadid, req.body.name, req.body.base_point_cost],
		function(err, result){
		if(err){
			next(err);
			return;
		}
		newMarine = result;
		pool.query("INSERT INTO spacemarines_equipments (spacemarineid, equipmentid) VALUES (?, ?)",
			[newMarine.insertId, req.body.weapon0 || 1],
			function(err, result){
			if(err){
				next(err);
				return;
			}
			pool.query("INSERT INTO spacemarines_equipments (spacemarineid, equipmentid) VALUES (?, ?)",
				[newMarine.insertId, req.body.weapon1 || 2],
				function(err, result){
				if(err){
					next(err);
					return;
				}
				if(req.body.assaultsquadid!=0){
					pool.query("INSERT INTO assaultsquads_spacemarines (assaultsquadid, spacemarineid) VALUES (?, ?)",
						[req.body.assaultsquadid, newMarine.insertId],
						function(err, result){
						if(err){
							next(err);
							return;
						}
						render_spacemarinesContext(res, next);
					});
				}
				else{
					render_spacemarinesContext(res, next);
				}
			});
		});
	});
}

module.exports = router;