function deleteEquipment(equipmentID)
{
	$.ajax({
		url: '/equipments/' + equipmentID,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		},
		error: function(result, textStatus) {
			alert(textStatus);
		}
	})
}

function addEquipment()
{
	var name = document.getElementById("equipmentName").value;
	var cost = document.getElementById("equipmentCost").value;
	var sergWeapon = document.getElementById("isSergeantWeaponAdd").checked;
	var specEquip = document.getElementById("isSpecialEquipmentAdd").checked;
	
	if(sergWeapon == true)
	{
		sergWeapon = 1;
	}
	
	if(specEquip == true)
	{
		specEquip = 1;
	}
	
	$.ajax({
		url: '/equipments/add',
		type: 'POST',
		data: { name: name, cost: cost, sergWeapon: sergWeapon, specEquip: specEquip },
		success: function(result){
			window.location.reload(true);
		},
		error: function(result, textStatus) {
			alert(textStatus);
		}
	})	
}