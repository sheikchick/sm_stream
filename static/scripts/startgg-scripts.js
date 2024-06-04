/**
 * STARTGG
 */

/* GET EVENTS IN TOURNAMENT (Melee Singles, Melee Doubles, ...) */
function getTournamentEvents() {
	tournament_slug = $("#tournament_slug").val()
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query TournamentEvents($name:String!){
					tournament(slug:$name){
						id
						name
						events{
							id
							name
						}
					}
				}
			`,
			variables: {
				name: tournament_slug
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			$("#events").hide()
			$("#phases").hide()
			$("#phase_groups").hide()
			$("#get_sets").hide()
			if (result["data"]["tournament"] == null) {
				$("#right_wrapper").css("display", "none")
				return
			}
			$("#events").empty()
			$("#events").append(new Option("Select...", 0));
			for (let event of result["data"]["tournament"]["events"]) {
				event_option = new Option(event["name"], event["id"]);
				$("#events").append(event_option);
				$("#events").show()
			}
		});
}

/* GET PHASES IN EVENT (Pools, Pro Bracket, ...) */
function getEventPhases() {
	event_id = $("#events :selected").val()

	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query EventPhases($id:ID!){
					event(id:$id){
						phases{
						  	id
						  	name
						  	phaseGroups{
								nodes{
									id
									displayIdentifier
								}
							}
						}
					}
				}
			`,
			variables: {
				id: event_id
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			$("#phases").hide()
			$("#phase_groups").hide()
			$("#get_sets").hide()
			if (result["data"]["event"]["phases"] == null) {
				$("#right_wrapper").css("display", "none")
				return
			}
			$("#phases").empty()
			$("#phases").append(new Option("Select...", 0));
			for (let phase of result["data"]["event"]["phases"]) {
				phase_option = new Option(phase["name"], phase["id"]);
				$("#phases").append(phase_option);
				$("#phases").attr("tournament_slug", tournament_slug)
				$("#phases").show()
			}
		});
}

/* GET PHASEGROUPS IN PHASE (Pool A1, Pool A2, ...) */
function getPhaseGroups() {
	phase_id = $("#phases :selected").val()
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query PhaseGroups($id:ID!){
					phase(id:$id){
				  		name
				  		phaseGroups{
							nodes{
					  			id
					  			displayIdentifier
							}
				  		}
					}
			  	}
			`,
			variables: {
				id: phase_id
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			$("#phase_groups").hide()
			$("#get_sets").hide()
			if (result["data"]["phase"]["phaseGroups"] == null) {
				$("#right_wrapper").css("display", "none")
				return
			}
			$("#phase_groups").empty()
			if (result["data"]["phase"]["phaseGroups"]["nodes"].length > 1) {
				$("#phase_groups").append(new Option("Select...", 0));
			}
			for (let pg of result["data"]["phase"]["phaseGroups"]["nodes"]) {
				pg_option = new Option(pg["displayIdentifier"], pg["id"]);
				$("#phase_groups").append(pg_option);
				$("#phase_groups").attr("tournament_slug", tournament_slug)
			}
			if (result["data"]["phase"]["phaseGroups"]["nodes"].length > 1) {
				$("#phase_groups").show()
			} else {
				//for overloading - select the only available option and then hide the element for clarity
				$("#phase_groups").val($("#phase_groups option:first").val());
				$("#phase_groups").hide()
				$("#get_sets").show()
			}
		});
}


/* GET AND LOAD SETS FOR A GIVEN PHASEGROUP */
function getSets() {
	phase_group = $("#phase_groups :selected").val();
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query GetSets($pgID:ID!, $page:Int!, $perPage:Int!){
					phaseGroup(id:$pgID){
						bracketType
						displayIdentifier
						phase {
							name
						}
						sets(
							page: $page
							perPage: $perPage
							sortType: STANDARD
							filters: {
								hideEmpty: false
								state: [1,2,3,4,5,6,7]
							}
						){
							nodes{
								id
								fullRoundText
								slots{
									entrant{
                                        id
										participants{
											gamerTag
											user{
												discriminator
												genderPronoun
											}
										}
									}
								}
							}
						}
					}
				}
			`,
			variables: {
				pgID: phase_group,
				page: 1,
				perPage: 80
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			sets = []
			phase_group = result["data"]["phaseGroup"]
			for (let set of phase_group["sets"]["nodes"]) {
				valid = true
				for (let entrant of set["slots"]) {
					if (!(entrant["entrant"])) {
						valid = false
					}
				}
				if (valid) {
					//match details
					match_id = set["id"]
					if (phase_group["bracketType"] == "ROUND_ROBIN") {
						match_round = phase_group["phase"]["name"] + " " + phase_group["displayIdentifier"]
					} else {
						match_round = set["fullRoundText"]
					}
					//players
					team1 = set["slots"][0]
					team2 = set["slots"][1]
					//player 1
					p1_entrant = team1["entrant"]["id"]
					p1_user_id = ""
					p1_pronouns = ""
					if (team1["entrant"]["participants"][0]["user"] != null) {
						p1_user_id = team1["entrant"]["participants"][0]["user"]["discriminator"]
						p1_pronouns = team1["entrant"]["participants"][0]["user"]["genderPronoun"]
					}
					p1_name = team1["entrant"]["participants"][0]["gamerTag"]
					//player 1 doubles
					p1_doubles_user_id = ""
					p1_doubles_pronouns = ""
					p1_doubles_name = ""
					if (team1["entrant"]["participants"].length > 1) {
						if (team1["entrant"]["participants"][1]["user"] != null) {
							p1_doubles_user_id = team1["entrant"]["participants"][1]["user"]["discriminator"]
							p1_doubles_pronouns = team1["entrant"]["participants"][1]["user"]["genderPronoun"]
						}
						p1_doubles_name = team1["entrant"]["participants"][1]["gamerTag"]
					}

					//player 2
					p2_entrant = team2["entrant"]["id"]
					p2_user_id = ""
					p2_pronouns = ""
					if (team2["entrant"]["participants"][0]["user"] != null) {
						p2_user_id = team2["entrant"]["participants"][0]["user"]["discriminator"]
						p2_pronouns = team2["entrant"]["participants"][0]["user"]["genderPronoun"]
					}
					p2_name = team2["entrant"]["participants"][0]["gamerTag"]
					//player 2 doubles
					p2_doubles_user_id = ""
					p2_doubles_pronouns = ""
					p2_doubles_name = ""
					if (team2["entrant"]["participants"].length > 1) {
						if (team2["entrant"]["participants"][1]["user"] != null) {
							p2_doubles_user_id = team2["entrant"]["participants"][1]["user"]["discriminator"]
							p2_doubles_pronouns = team2["entrant"]["participants"][1]["user"]["genderPronoun"]
						}
						p2_doubles_name = team2["entrant"]["participants"][1]["gamerTag"]
					}

					match_data = {
						"id": set["id"],
						"round": match_round,
						"player1": {
							"entrant_id": p1_entrant,
							"data": [
								{
									"id": p1_user_id,
									"name": p1_name,
									"pronouns": p1_pronouns
								},
								{
									"id": p1_doubles_user_id,
									"name": p1_doubles_name,
									"pronouns": p1_doubles_pronouns
								}
							]
						},
						"player2": {
							"entrant_id": p2_entrant,
							"data": [
								{
									"id": p2_user_id,
									"name": p2_name,
									"pronouns": p2_pronouns
								},
								{
									"id": p2_doubles_user_id,
									"name": p2_doubles_name,
									"pronouns": p2_doubles_pronouns
								}
							]
						}
					}
					sets.push(match_data)
				}
			}
			set_page = 0;
			showSets(true);
		});
}


function submitSet(setId, winnerId, gameData) {
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				mutation reportSet($setId: ID!, $winnerId: ID!, $gameData: [BracketSetGameDataInput]) {
					reportBracketSet(setId: $setId, winnerId: $winnerId, gameData: $gameData) {
						id
						state
					}
				}
			`,
			variables: {
				"setId": setId,
				"winnerId": winnerId,
				"gameData": gameData
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => { })
}

function showGetSeeds() {
	$('#getSeeds').show();
}