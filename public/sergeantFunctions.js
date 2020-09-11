function deleteSergeant(sergeantID)
{
	$.ajax({
		url: '/sergeants/' + sergeantID,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		},
		error: function(result, textStatus) {
			alert(textStatus);
		}
	})
}

function addSergeant(sergeantID)
{
	var squadID = document.getElementById("addSergeantSquadID").value;
	var name = document.getElementById("addSergeantName").value;
	var equipment1ID = document.getElementById("addSergeantWeapon1").value;
	var equipment2ID = document.getElementById("addSergeantWeapon2").value;
	var cost = document.getElementById("addSergeantCostCost").value;
	
	$.ajax({
		url: '/sergeants/add',
		type: 'POST',
		data: { squadID: squadID, name: name, equipment1ID: equipment1ID, equipment2ID: equipment2ID, cost: cost },
		success: function(result){
			window.location.reload(true);
		},
		error: function(result, textStatus) {
			alert(textStatus);
		}
	})
}

function updateSergeant(sergeantID, index)
{
	var equipment1 = document.getElementById("weapon0" + index).value;
	var equipment2 = document.getElementById("weapon1" + index).value;
	
	$.ajax({
		url: '/sergeants/update',
		type: 'POST',
		data: { sergeantID: sergeantID, equipment1: equipment1, equipment2: equipment2 },
		success: function(result){
			window.location.reload(true);
		},
		error: function(result, textStatus) {
			alert(textStatus);
		}
	})
}

function deleteSpecialWeapon(weaponID)
{
	$.ajax({
		url: '/sergeants/deleteSpecialWeapon',
		type: 'POST',
		data: { weaponID: weaponID },
		success: function(result){
			window.location.reload(true);
		},
		error: function(result, textStatus) {
			alert(textStatus);
		}
	})
}

function addSpecialWeapon(sergeantID)
{
	var tmpString = "addSpecialWeapon";
	
	tmpString = tmpString.concat(sergeantID);
	
	var weaponID = document.getElementById(tmpString).value;
	
	$.ajax({
		url: '/sergeants/addSpecialWeapon',
		type: 'POST',
		data: { sergeantID: sergeantID, weaponID: weaponID },
		success: function(result){
			window.location.reload(true);
		},
		error: function(result, textStatus) {
			alert(textStatus);
		}
	})
}