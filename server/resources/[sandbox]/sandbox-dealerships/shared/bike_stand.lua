-- Bike stand catalogue and locations. Loaded on both sides so the server
-- resolves prices, models and spawn points itself instead of trusting the client.
BikeStandLocations = {
	{
		coords = vector3(-1107.018, -1694.860, 3.4),
		blip = {
			sprite = 106,
			color = 17,
			scale = 0.5,
		},
		interactionPed = {
			model = `a_m_m_fatlatin_01`,
			heading = 335.0,
			scenario = "WORLD_HUMAN_TENNIS_PLAYER",
			range = 45.0,
		},
		vehicleSpawn = vector4(-1104.368, -1695.073, 4.360, 216.545),
	},
	{
		coords = vector3(-275.791, -916.864, 30.216),
		blip = {
			sprite = 106,
			color = 17,
			scale = 0.5,
		},
		interactionPed = {
			model = `a_f_y_fitness_01`,
			heading = 72.833,
			scenario = "WORLD_HUMAN_MUSCLE_FLEX",
			range = 60.0,
		},
		vehicleSpawn = vector4(-277.524, -914.589, 31.216, 85.471),
	},
	{
		coords = vector3(-1290.215, 300.094, 63.945),
		blip = false,
		interactionPed = {
			model = `a_f_y_fitness_01`,
			heading = 160.833,
			scenario = "WORLD_HUMAN_MUSCLE_FLEX",
			range = 40.0,
		},
		vehicleSpawn = vector4(-1292.238, 300.571, 64.945, 86.851),
	},
}

BikeStandBikes = {
	{
		name = "Beach Cruiser",
		model = `cruiser`,
		price = 300,
	},
	{
		name = "BMX",
		model = `bmx`,
		price = 500,
	},
	{
		name = "Mountain Bike",
		model = `scorcher`,
		price = 800,
	},
	{
		name = "Endurex Race Bike",
		model = `tribike2`,
		price = 1000,
	},
}
