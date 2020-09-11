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
	renderHomeContext(res, next);
});

router.post('/', function(req, res, next) {
	console.log(req.body);
	if(req.body.updateArmylist){//update query
		updateArmylist(req, res, next);
	}
	else if(req.body.removeArmylist){//delete query
		removeArmylist(req, res, next);
	}
	else if(req.body.addArmylist){//add query
		addArmylist(req, res, next);
	}
	else if(req.body.updateAssaultSquad){
		updateAssaultSquad(req, res, next);
	}
	else if(req.body.removeAssaultSquad){
		removeAssaultSquad(req, res, next);
	}
	else if(req.body.addAssaultSquad){
		addAssaultSquad(req, res, next);
	}
	else if(req.body.updateSergeant){
		updateSergeant(req, res, next)
	}
	else if(req.body.removeSergeant){
		removeSergeant(req, res, next)
	}
	else if(req.body.addSergeant){
		addSergeant(req, res, next);
	}
	else if(req.body.updateSpecialEquipment){
		updateSpecialEquipment(req, res, next);
	}
	else if(req.body.removeSpecialEquipment){
		removeSpecialEquipment(req, res, next);
	}
	else if(req.body.addSpecialEquipment){
		addSpecialEquipment(req, res, next);
	}
	else if(req.body.updateSpaceMarine){
		updateSpaceMarine(req, res, next);
	}
	else if(req.body.removeSpaceMarine){
		removeSpaceMarine(req, res, next);
	}
	else if(req.body.addSpaceMarine){
		addSpaceMarine(req, res, next);
	}
	else{
		renderHomeContext(res, next);
	}
});

function renderHomeContext(res, next){
	let context = {};
	context.subtitle = "If there are no armies, the system hangs";
	// FIND ALL ARMYLISTS
	let promiseGetArmylists = function(context){
		let sql = "SELECT * FROM armylists";
		//console.log("promiseGetArmyLists");
		return new Promise(function(resolve, reject){
			pool.query(sql, function(err, q_armylists){
				if(err){
					reject(context);
					next(err);
					return;
				}
				context.armylists = q_armylists;
				if(context.armylists.length != 0){
					resolve(context);
				}
				else{ 
					reject(context);
				}
			});
		});
	};

	let promiseGetSquads = function(context){
		let sql = "SELECT * FROM armylists_assaultsquads "+
		"INNER JOIN assaultsquads ON (armylists_assaultsquads.assaultsquadid = assaultsquads.id) " +
		"WHERE armylists_assaultsquads.armylistid = (?)";
		//console.log("promiseGetSquads");
		return new Promise(function(resolve, reject){
			queriesToComplete = 0;
			completedQueries = 0;
			for(let i=0; i< context.armylists.length; i++){
				queriesToComplete +=1;
				pool.query(sql, [context.armylists[i].id], function(err, q_assaultsquads){ 
					if(err){
						console.log("error in query to get assault squads");
						next(err);
						reject(context);
						return;
					}
					context.armylists[i].assaultsquads = q_assaultsquads;
					context.armylists[i].numAssaultSquads = context.armylists[i].assaultsquads.length;
					completedQueries++;
					if(completedQueries == queriesToComplete ){
						if(context.armylists[i].assaultsquads!=0){
							resolve(context);
						}
						else{
							reject(context);
						}
					}
					
				});
			}
		});
	};

	let promiseGetMarines = function(context){
		let sql = "SELECT * FROM assaultsquads_spacemarines "+
		"INNER JOIN spacemarines ON (assaultsquads_spacemarines.spacemarineid = spacemarines.id ) " +
		"WHERE assaultsquads_spacemarines.assaultsquadid = (?)";
		//console.log("promiseGetMarines");
		return new Promise(function(resolve, reject){
			queriesToComplete = 0;
			completedQueries = 0;

			for(let i=0; i< context.armylists.length; i++){
				for(let j=0; j<context.armylists[i].assaultsquads.length; j++){
					queriesToComplete +=1;
					pool.query(sql, [context.armylists[i].assaultsquads[j].assaultsquadid], function(err, q_spacemarines){
						if(err){
							console.log("error in query to get marines in assault squads");
							reject(context);
							next(err);
							return;
						}
						context.armylists[i].assaultsquads[j].spacemarines = q_spacemarines;
						// COUNT UP POINT COST HERE
						completedQueries++;
						if(completedQueries == queriesToComplete){
							resolve(context);
						}
					});
				}
			}
		});
	};

	let promiseGetMarineWeapons = function(context){
		let sql = "SELECT equipments.id, equipments.name, equipments.point_cost FROM spacemarines_equipments "+
		"INNER JOIN spacemarines ON (spacemarines_equipments.spacemarineid = spacemarines.id ) " +
		"INNER JOIN equipments ON (spacemarines_equipments.equipmentid = equipments.id ) " +
		"WHERE spacemarines_equipments.spacemarineid = (?) LIMIT 2";
		//console.log("promiseGetMarineWeapons");
		return new Promise(function(resolve, reject){
			queriesToComplete = 0;
			completedQueries = 0;
			for(let i=0; i< context.armylists.length; i++){
				for(let j=0; j<context.armylists[i].assaultsquads.length; j++){
					for(let k=0; k<context.armylists[i].assaultsquads[j].spacemarines.length; k++){
						queriesToComplete +=1;
						pool.query(sql, [context.armylists[i].assaultsquads[j].spacemarines[k].id], function(err, q_weapons){
							if(err){
								console.log("error in query to get marine weapons");
								reject(context);
								next(err);
								return;
							}
							context.armylists[i].assaultsquads[j].spacemarines[k].weapons = q_weapons;
							completedQueries++;
							if(completedQueries == queriesToComplete){
								resolve(context);
							}
						});
					}
				}
			}
		});
	};

	let promiseGetSergeants = function(context){
		let sql = "SELECT * FROM sergeants WHERE sergeants.assaultsquadid = (?)";
		//console.log("promiseGetSergeants");
		return new Promise(function(resolve, reject){
			queriesToComplete = 0;
			completedQueries = 0;
			for(let i=0; i< context.armylists.length; i++){
				for(let j=0; j<context.armylists[i].assaultsquads.length; j++){
					queriesToComplete +=1;
					pool.query(sql, [context.armylists[i].assaultsquads[j].id], function(err, q_sergeants){
						if(err){
							console.log("error in query to get sergeants in assault squads");
							reject(context);
							next(err);
							return;
						}
						context.armylists[i].assaultsquads[j].sergeants = q_sergeants;
						completedQueries++;
						if(completedQueries == queriesToComplete){
							resolve(context);
						}
					});
				}
			}
		});
	};

	let promiseGetSergeantWeapons = function(context){
		let sql = "SELECT equipments.id, equipments.name, equipments.point_cost FROM sergeants_equipments "+
		"INNER JOIN sergeants ON (sergeants_equipments.sergeantid = sergeants.id ) " +
		"INNER JOIN equipments ON (sergeants_equipments.equipmentid = equipments.id ) " +
		"WHERE sergeants_equipments.sergeantid = (?) AND NOT (equipments.is_sergeant_weapon = 0 AND equipments.is_special_weapon = 1) LIMIT 2";
		//console.log("promiseGetSergeantWeapons");
		return new Promise(function(resolve, reject){
			queriesToComplete = 0;
			completedQueries = 0;
			for(let i=0; i< context.armylists.length; i++){
				for(let j=0; j<context.armylists[i].assaultsquads.length; j++){
					for(let k=0; k<context.armylists[i].assaultsquads[j].sergeants.length; k++){
						queriesToComplete +=1;
						pool.query(sql, [context.armylists[i].assaultsquads[j].sergeants[k].id], function(err, q_weapons){
							if(err){
								console.log("error in query to get sergeant weapons");
								reject(context);
								next(err);
								return;
							}
							context.armylists[i].assaultsquads[j].sergeants[k].weapons = q_weapons;
							// TOTAL THIS SERGEANT'S POINT COST HERE
							completedQueries++;
							if(completedQueries == queriesToComplete){
								resolve(context);
							}
						});
					}
				}
			}
		});
	};

	let promiseGetSergeantSpecialEquipments = function(context){
		let sql = "SELECT equipments.id, equipments.name, equipments.point_cost FROM sergeants_equipments "+
		"INNER JOIN sergeants ON (sergeants_equipments.sergeantid = sergeants.id ) " +
		"INNER JOIN equipments ON (sergeants_equipments.equipmentid = equipments.id) " +
		"WHERE equipments.is_special_weapon = 1 AND equipments.is_sergeant_weapon = 0 AND sergeants_equipments.sergeantid = (?)";
		//console.log("promiseGetSergeantSpecialEquipments");
		return new Promise(function(resolve, reject){
			queriesToComplete = 0;
			completedQueries = 0;
			for(let i=0; i< context.armylists.length; i++){
				for(let j=0; j<context.armylists[i].assaultsquads.length; j++){
					for(let k=0; k<context.armylists[i].assaultsquads[j].sergeants.length; k++){
						queriesToComplete +=1;
						pool.query(sql, [context.armylists[i].assaultsquads[j].sergeants[k].id], function(err, q_specials){
							if(err){
								console.log("error in query to get special weapons");
								reject(context);
								next(err);
								return;
							}
							context.armylists[i].assaultsquads[j].sergeants[k].specials = q_specials;
							completedQueries++;
							if(completedQueries == queriesToComplete){
								resolve(context);
							}
						});
					}
				}
			}
		});
	};

	let promiseGetPossibleSergeantWeapons = function(){
		let sql = "SELECT equipments.id, equipments.name, equipments.point_cost FROM equipments " +
		"WHERE equipments.is_special_weapon = 0";
		//console.log("promiseGetPossibleSergeantWeapons");
		return new Promise(function(resolve, reject){
			queriesToComplete = 1;
			completedQueries = 0;
			pool.query(sql, function(err, q_possibleSergeantWeapons){
				if(err){
					console.log("error in promiseGetPossibleSergeantWeapons");
					reject(context);
					next(err);
					return;
				}
				context.possibleSergeantWeapons = q_possibleSergeantWeapons;
				completedQueries++;
				if(completedQueries == queriesToComplete){
					resolve(context);
				}
			});
		});
	};

	let promiseGetPossibleBasicWeapons = function(context){
		let sql = "SELECT equipments.id, equipments.name, equipments.point_cost FROM equipments " +
		"WHERE equipments.is_special_weapon = 0 and equipments.is_sergeant_weapon = 0";
		//console.log("promiseGetPossibleBasicWeapons");
		return new Promise(function(resolve, reject){
			pool.query(sql, function(err, q_possibleBasicWeapons){
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

	let promiseGetPossibleSpecialWeapons = function(context){
		let sql = "SELECT equipments.id, equipments.name, equipments.point_cost FROM equipments " +
		"WHERE equipments.is_special_weapon = 1 and equipments.is_sergeant_weapon = 0";
		//console.log("promiseGetPossibleSpecialWeapons");
		return new Promise(function(resolve, reject){
			pool.query(sql, function(err, q_possibleSpecialWeapons){
				if(err){
					console.log("error in promiseGetPossibleSpecialWeapons");
					reject(context);
					next(err);
					return;
				}
				context.possibleSpecialWeapons = q_possibleSpecialWeapons;
				resolve(context);
			});
		});
	};

	let promiseGetPoints = function(context){
		return new Promise(function(resolve, reject){
			queriesToComplete = 0;
			completedQueries = 0
			for(let i=0; i< context.armylists.length; i++){//for each armylist
				context.armylists[i].point_cost=0;
				for(let j=0; j<context.armylists[i].assaultsquads.length; j++){//for each squad
					context.armylists[i].assaultsquads[j].point_cost =0;
					for(let k=0; k<context.armylists[i].assaultsquads[j].sergeants.length; k++){//for each sergeant
						context.armylists[i].assaultsquads[j].sergeants[k].point_cost=0;
						for(let m=0; m<context.armylists[i].assaultsquads[j].sergeants[k].weapons.length; m++){//fore each sergeant weapon
							context.armylists[i].assaultsquads[j].sergeants[k].point_cost += context.armylists[i].assaultsquads[j].sergeants[k].weapons[m].point_cost;//add weapon cost to sergeant cost
						}
						for(let n=0; n<context.armylists[i].assaultsquads[j].sergeants[k].specials.length; n++){//for each sergeant special weapon
							context.armylists[i].assaultsquads[j].sergeants[k].point_cost += context.armylists[i].assaultsquads[j].sergeants[k].specials[n].point_cost;//add weapon cost to sergeant cost
						}
						context.armylists[i].assaultsquads[j].sergeants[k].point_cost += context.armylists[i].assaultsquads[j].sergeants[k].base_point_cost;//add sergeant base point cost to point cost
						context.armylists[i].assaultsquads[j].point_cost += context.armylists[i].assaultsquads[j].sergeants[k].point_cost; //add sergeant point cost to squad point cost
					}
					for(let p=0; p<context.armylists[i].assaultsquads[j].spacemarines.length; p++){//for each spacemarine
						context.armylists[i].assaultsquads[j].spacemarines[p].point_cost=0;
						for(let q=0; q<context.armylists[i].assaultsquads[j].spacemarines[p].weapons.length; q++){//for each space marine weapon
							context.armylists[i].assaultsquads[j].spacemarines[p].point_cost += context.armylists[i].assaultsquads[j].spacemarines[p].weapons[q].point_cost;//add weapon cost to marine cost
						}
						context.armylists[i].assaultsquads[j].spacemarines[p].point_cost += context.armylists[i].assaultsquads[j].spacemarines[p].base_point_cost;//add marine point cost to base point cost
						context.armylists[i].assaultsquads[j].point_cost += context.armylists[i].assaultsquads[j].spacemarines[p].point_cost;//add marine point cost to squad point cost
					}
					
					if(context.armylists[i].assaultsquads[j].has_jumppacks){
						context.armylists[i].assaultsquads[j].point_cost += 100;
					}
					context.armylists[i].point_cost += context.armylists[i].assaultsquads[j].point_cost;
				}

				queriesToComplete++;
				pool.query("SELECT * FROM armylists WHERE id=?", [context.armylists[i].id], function(err, result){
					if(err){
						next(err);
						return;
					}
					if(result.length == 1){
						let curVals = result[0];
						pool.query("UPDATE armylists SET point_total=? WHERE id=?",
							[context.armylists[i].point_cost || curVals.point_total, context.armylists[i].id],
							function(err, result){
							if(err){
								reject(context);
								next(err);
								return;
							}
							completedQueries++;
							if(completedQueries == queriesToComplete){
								resolve(context);
							}
						});
					}
				});
			}
		});
	}

	promiseGetPossibleSergeantWeapons().then(function(context){
		return promiseGetPossibleBasicWeapons(context);	
	}).then(function(context){
		return promiseGetPossibleSpecialWeapons(context);	
	}).then(function(context){
		return promiseGetArmylists(context);
	}).then(function(context){
		return promiseGetSquads(context);		
	}).then(function(context){
		return promiseGetMarines(context);	
	}).then(function(context){
		return promiseGetMarineWeapons(context);	
	}).then(function(context){
		return promiseGetSergeants(context);	
	}).then(function(context){
		return promiseGetSergeantWeapons(context);	
	}).then(function(context){
		return promiseGetSergeantSpecialEquipments(context);	
	}).then(function(context){
		return promiseGetPoints(context);
	}).then(function(context){
		res.render('home', context);
	}).catch(function(context){
		res.render('home', context);
	});
}

function updateArmylist(req, res, next){
	pool.query("SELECT * FROM armylists WHERE id=?", [req.body.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		if(result.length == 1){
			let curVals = result[0];
			pool.query("UPDATE armylists SET name=? WHERE id=?",
				[req.body.armyName || curVals.name, req.body.id],
				function(err, result){
				if(err){
					next(err);
					return;
				}
				renderHomeContext(res, next);
			});
		}
	});
}

function removeArmylist(req, res, next){
	pool.query("SELECT * FROM armylists WHERE armylists.id=?", [req.body.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		if(result.length == 1){
			let curVals = result[0];
			pool.query("DELETE FROM armylists WHERE armylists.id=?",	[req.body.id], function(err, result){
				if(err){
					next(err);
					return;
				}
				renderHomeContext(res, next);
			});
		}
	});
}

function addArmylist(req, res, next){
	pool.query("INSERT INTO armylists (armylists.name) VALUES (?)",
		[req.body.armyName],
		function(err, result){
		if(err){
			next(err);
			return;
		}
		renderHomeContext(res, next);
	});
}

function updateAssaultSquad(req, res, next){
	pool.query("SELECT * FROM assaultsquads WHERE id=?", [req.body.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		if(result.length == 1){
			let curVals = result[0];
			if(req.body.hasjumppacks == 'on'){
				req.body.hasjumppacks = 1;
			}
			else{
				req.body.hasjumppacks = 0;
			}
			pool.query("UPDATE assaultsquads SET name=?, has_jumppacks=? WHERE id=?",
				[req.body.squadName || curVals.name, req.body.hasjumppacks, req.body.id],
				function(err, result){
				if(err){
					next(err);
					return;
				}
				renderHomeContext(res, next);
			});
		}
	});
}

function removeAssaultSquad(req, res, next){
	pool.query("SELECT * FROM assaultsquads WHERE assaultsquads.id=?", [req.body.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		if(result.length == 1){
			let curVals = result[0];
			pool.query("DELETE FROM assaultsquads WHERE assaultsquads.id=?",	[req.body.id], function(err, result){
				if(err){
					next(err);
					return;
				}
				renderHomeContext(res, next);
			});
		}
	});
}

function addAssaultSquad(req, res, next){
	if(req.body.hasjumppacks == 'on'){
		req.body.hasjumppacks = 1;
	}
	else{
		req.body.hasjumppacks = 0;
	}
	pool.query("INSERT INTO assaultsquads (assaultsquads.name, assaultsquads.has_jumppacks) VALUES (?, ?)",
		[req.body.squadName, req.body.hasjumppacks],
		function(err, result){
		if(err){
			next(err);
			return;
		}
		pool.query("INSERT INTO armylists_assaultsquads (armylistid, assaultsquadid) VALUES (?, ?)",
			[req.body.armylistid, result.insertId],
			function(err, result){
			if(err){
				next(err);
				return;
			}
			renderHomeContext(res, next);
		});
	});
}

function updateSergeant(req, res, next){
	//find the sergeant to update
	pool.query("SELECT * FROM sergeants WHERE id=?", [req.body.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		if(result.length == 1){
			let curVals = result[0];
			//update the sergeant's name
			pool.query("UPDATE sergeants SET name=? WHERE id=?",
				[req.body.sergeantName || curVals.name, req.body.id],
				function(err, result){
				if(err){
					next(err);
					return;
				}
				if(req.body.currentWeapon0 != req.body.newWeapon0 || req.body.currentWeapon1 != req.body.newWeapon1){
					//find an equipment associated with the sergeant that matches weapon0 by id
					pool.query("SELECT * FROM sergeants_equipments WHERE sergeantid=? AND equipmentid=?", [req.body.id, req.body.currentWeapon0], function(err, result){
						if(err){
							next(err);
							return;
						}
						if(result.length == 1 || result.length==2){
							//update equipment associated with the sergeant that matches weapon0 by id
							let curVals = result[0];
							pool.query("UPDATE sergeants_equipments SET equipmentid=? WHERE sergeantid=? AND equipmentid=? LIMIT 1",
								[req.body.newWeapon0 || curVals.equipmentid, curVals.sergeantid, curVals.equipmentid],
								function(err, result){
								if(err){
									next(err);
									return;
								}
								if(req.body.currentWeapon1 != req.body.newWeapon1){
									//find an equipment associated with the sergeant that matches weapon1 by id
									pool.query("SELECT * FROM sergeants_equipments WHERE sergeantid=? AND equipmentid=?", [req.body.id, req.body.currentWeapon1], function(err, result){
										if(err){
											next(err);
											return;
										}
										if(result.length == 1 || result.length==2){
											let curVals = result[0];
											//update equipment associated with the sergeant that matches weapon1 by id
											pool.query("UPDATE sergeants_equipments SET equipmentid=? WHERE sergeantid=? AND equipmentid=? LIMIT 1",
												[req.body.newWeapon1 || curVals.equipmentid, curVals.sergeantid, curVals.equipmentid],
												function(err, result){
												if(err){
													next(err);
													return;
												}
												renderHomeContext(res, next);
											});
										}
										else{
											renderHomeContext(res, next);
										}
									});
								}
								else{
									renderHomeContext(res, next);
								}
							});
						}
						else{
							console.logconsole.log("error in updating sergeant");
							renderHomeContext(res, next);
						}
					});
				}
				else{
					renderHomeContext(res, next);
				}
			});
		}
		else{
			console.log("error in updating sergeant");
			renderHomeContext(res, next);
		}
	});
}

function removeSergeant(req, res, next){
	pool.query("SELECT * FROM sergeants WHERE sergeants.id=?", [req.body.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		if(result.length == 1){
			let curVals = result[0];
			pool.query("DELETE FROM sergeants WHERE sergeants.id=?", [req.body.id], function(err, result){
				if(err){
					next(err);
					return;
				}
				renderHomeContext(res, next);
			});
		}
	});
}

function addSergeant(req, res, next){
	pool.query("INSERT INTO sergeants (sergeants.name, sergeants.assaultsquadid) VALUES (?, ?)",
		[req.body.sergeantName, req.body.assaultsquadid],
		function(err, result){
		if(err){
			next(err);
			return;
		}
		newSergent = result;
		pool.query("INSERT INTO sergeants_equipments (sergeantid, equipmentid) VALUES (?, ?)",
			[newSergent.insertId, req.body.weapon0 || 1],
			function(err, result){
			if(err){
				next(err);
				return;
			}
			pool.query("INSERT INTO sergeants_equipments (sergeantid, equipmentid) VALUES (?, ?)",
				[newSergent.insertId, req.body.weapon1 || 2],
				function(err, result){
				if(err){
					next(err);
					return;
				}
				renderHomeContext(res, next);
			});
		});
	});
}

function updateSpecialEquipment(req, res, next){
	pool.query("SELECT * FROM sergeants_equipments WHERE sergeantid=? AND equipmentid=?", [req.body.id, req.body.currentWeapon], function(err, result){
		if(err){
			next(err);
			return;
		}
		console.log("found special equipment");
		if(result.length >= 1){
			let curVals = result[0];
			//update equipment associated with the sergeant that matches weapon1 by id
			pool.query("UPDATE sergeants_equipments SET equipmentid=? WHERE sergeantid=? AND equipmentid=? LIMIT 1",
				[req.body.newWeapon || curVals.equipmentid, curVals.sergeantid, curVals.equipmentid],
				function(err, result){
				if(err){
					next(err);
					return;
				}
				console.log("updated special equipment");
				renderHomeContext(res, next);
			});
		}
		else{
			renderHomeContext(res, next);
		}
	});
}

function removeSpecialEquipment(req, res, next){
	pool.query("SELECT * FROM sergeants_equipments WHERE sergeantid=? AND equipmentid=?", [req.body.id, req.body.currentWeapon], function(err, result){
		if(err){
			next(err);
			return;
		}
		if(result.length == 1){
			let curVals = result[0];
			pool.query("DELETE FROM sergeants_equipments WHERE sergeantid=? AND equipmentid=? LIMIT 1",	[req.body.id, req.body.currentWeapon], function(err, result){
				if(err){
					next(err);
					return;
				}
				renderHomeContext(res, next);
			});
		}
	});
}

function addSpecialEquipment(req, res, next){
	pool.query("INSERT INTO sergeants_equipments (sergeantid, equipmentid) VALUES (?, ?)",
		[req.body.id, req.body.newWeapon],
		function(err, result){
		if(err){
			next(err);
			return;
		}
		renderHomeContext(res, next);
	});
}

function updateSpaceMarine(req, res, next){
	//find the marine to update
	pool.query("SELECT * FROM spacemarines WHERE id=?", [req.body.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		if(result.length == 1){
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
							console.log('updated weapon 1');
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
											renderHomeContext(res, next);
										});
									}
									else{
										renderHomeContext(res, next);
									}
								});
							}
							else{
								renderHomeContext(res, next);
							}
						});
					}
					else{
						console.log("error in updating marine: finding marine equipment");
						renderHomeContext(res, next);
					}
				});
			}
			else{
				renderHomeContext(res, next);
			}
		}
		else{
			console.log("error in updating marine: finding marine");
			renderHomeContext(res, next);
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
				renderHomeContext(res, next);
			});
		}
		else{
			console.log("error finding spacemarine to delete");
			renderHomeContext(res, next);
		}
	});
}

function addSpaceMarine(req, res, next){
	pool.query("INSERT INTO spacemarines (spacemarines.name, spacemarines.assaultsquadid) VALUES (?, ?)",
		['Marine', req.body.assaultsquadid],
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
				pool.query("INSERT INTO assaultsquads_spacemarines (assaultsquadid, spacemarineid) VALUES (?, ?)",
				[req.body.assaultsquadid, newMarine.insertId],
				function(err, result){
				if(err){
					next(err);
					return;
				}
				console.log("marine added " + newMarine.insertId);
				renderHomeContext(res, next);
			});
			});
		});
	});
}

module.exports = router;