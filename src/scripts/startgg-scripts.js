/**
 * STARTGG
 */

/* GET EVENTS IN TOURNAMENT (Melee Singles, Melee Doubles, ...) */
function getTournamentEvents() {
	tournamentSlug = $("#tournament-slug").val()
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
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
				name: tournamentSlug
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			$("#streams").hide()
			$("#events").hide()
			$("#phases").hide()
			$("#phase-groups").hide()
			$("#get-sets").hide()
			if (result["data"]["tournament"] == null) {
				$("#right-wrapper").css("display", "none")
				return
			}
			$("#events").empty()
			$("#events").append(new Option("Select...", 0));
			for (let event of result["data"]["tournament"]["events"]) {
				eventOption = new Option(event["name"], event["id"]);
				$("#events").append(eventOption);
				$("#events").show()
			}
		});
}

/* GET PHASES IN EVENT (Pools, Pro Bracket, ...) */
function getEventPhases() {
	eventId = $("#events :selected").val()

	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
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
				id: eventId
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			$("#streams").hide()
			$("#phases").hide()
			$("#phase-groups").hide()
			$("#get-sets").hide()
			if (result["data"]["event"]["phases"] == null) {
				$("#right-wrapper").css("display", "none")
				return
			}
			$("#phases").empty()
			$("#phases").append(new Option("Select...", 0));
			for (let phase of result["data"]["event"]["phases"]) {
				phaseOption = new Option(phase["name"], phase["id"]);
				$("#phases").append(phaseOption);
				$("#phases").attr("tournament-slug", tournamentSlug)
				$("#phases").show()
			}
		});
}

/* GET PHASEGROUPS IN PHASE (Pool A1, Pool A2, ...) */
function getPhaseGroups() {
	phaseId = $("#phases :selected").val()
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
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
				id: phaseId
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			$("#streams").hide()
			$("#phase-groups").hide()
			$("#get-sets").hide()
			if (result["data"]["phase"]["phaseGroups"] == null) {
				$("#right-wrapper").css("display", "none")
				return
			}
			$("#phase-groups").empty()
			if (result["data"]["phase"]["phaseGroups"]["nodes"].length > 1) {
				$("#phase-groups").append(new Option("Select...", 0));
			}
			for (let pg of result["data"]["phase"]["phaseGroups"]["nodes"]) {
				pgOption = new Option(pg["displayIdentifier"], pg["id"]);
				$("#phase-groups").append(pgOption);
				$("#phase-groups").attr("tournament-slug", tournamentSlug)
			}
			if (result["data"]["phase"]["phaseGroups"]["nodes"].length > 1) {
				$("#phase-groups").show()
			} else {
				//for overloading - select the only available option and then hide the element for clarity
				$("#phase-groups").val($("#phase-groups option:first").val());
				$("#phase-groups").hide()
				showGetSets()
			}
		});
}

/* GET AND LOAD SETS FROM THE STREAMQUEUE */
function getStreamQueues() {
	tournamentSlug = $("#tournament-slug").val()
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
            query StreamQueueOnTournament($tourneySlug: String!) {
                tournament(slug: $tourneySlug) {
                    id
                    name
                    streamQueue {
                        stream {
                            streamSource
                            streamName
                        }
                    }
                }
            }
			`,
			variables: {
				tourneySlug: tournamentSlug
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		$("#streams").hide()
		$("#events").hide()
		$("#phases").hide()
		$("#phase-groups").hide()
		$("#get-sets").hide()
		$("#streams").empty()
		streamQueue = result.data.tournament.streamQueue
		if(streamQueue.length === 1) {
			getStreamQueue(tournamentSlug, streamQueue[0].stream.streamName)
		} else {
			for (let stream of streamQueue) {
				streamOption = new Option(stream.stream["streamName"], stream.stream["streamName"], false, false);
				$("#streams").append(streamOption);
				$("#streams").attr("tournament-slug", tournamentSlug)
				$("#streams").show()
			}
		}
	});
}

/* GET AND LOAD SETS FROM THE STREAMQUEUE */
function getStreamQueue(tournamentSlug, streamName) {
	console.log("getStreamQueue")
	tournamentSlug ? "" : tournamentSlug = $("#streams").attr("tournament-slug")
	streamName ? "" : streamName = $("#streams :selected").val()
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
            query StreamQueueOnTournament($tourneySlug: String!) {
                tournament(slug: $tourneySlug) {
                    id
                    name
                    streamQueue {
                        stream {
                            streamSource
                            streamName
                        }
                        sets {
                            id
                            fullRoundText
							phaseGroup {
								bracketType
								displayIdentifier
								phase {
									name
								}
							}
                            slots {
                                entrant {
                                    id
                                    participants {
                                        gamerTag
                                        user {
											discriminator
                                            genderPronoun
											location {
													country
												}
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
				tourneySlug: tournamentSlug
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		console.log(result.data.tournament.streamQueue)
		sets = []
		streamQueue = result.data.tournament.streamQueue.find((element) => (element))
		for (let set of streamQueue.sets) {
			matchRound = set.phaseGroup["bracketType"] == "ROUND_ROBIN"
							? set.phaseGroup["phase"]["name"] + " " + set.phaseGroup["displayIdentifier"]
							: set["fullRoundText"]
			sets.push(constructSetObject(set, matchRound))
		}
		setPage = 0;
		showSets(true, false);
	});
}


/* GET AND LOAD SETS FOR A GIVEN PHASEGROUP */
function getSets(stateArray, hideEmpty, showButtons) {
	phaseGroup = $("#phase-groups :selected").val();
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
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
								hideEmpty: ${hideEmpty}
								state: ${stateArray}
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
											contactInfo{
												country
											}
											user {
												discriminator
												genderPronoun
												location {
													country
												}
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
				pgID: phaseGroup,	//phasegroupID
				page: 1,
				perPage: 80
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		sets = []
		phaseGroup = result["data"]["phaseGroup"]
		for (let set of phaseGroup["sets"]["nodes"]) {
			matchRound = phaseGroup["bracketType"] == "ROUND_ROBIN"
							? phaseGroup["phase"]["name"] + " " + phaseGroup["displayIdentifier"]
							: set["fullRoundText"]
			sets.push(constructSetObject(set, matchRound))
		}
		setPage = 0;
		showSets(true, showButtons);
	});
}

function constructSetObject(set, matchRound) {
	valid = true
	for (let entrant of set["slots"]) {
		if (!(entrant["entrant"])) {
			valid = false
		}
	}
	if (valid) {
		//match details
		matchId = set["id"]
		//players
		team1 = set["slots"][0]
		team2 = set["slots"][1]

		//player 1
		p1Entrant = team1["entrant"]["id"]
		p1UserId = ""
		p1Pronouns = ""
		p1Country = ""
		if (team1["entrant"]["participants"][0]["user"] != null) {
			p1UserId = team1["entrant"]["participants"][0]["user"]["discriminator"]
			p1Pronouns = team1["entrant"]["participants"][0]["user"]["genderPronoun"]
			p1Country = getCountry(p1UserId) || 
				(team1["entrant"]["participants"][0]["user"]["location"]["country"] || team1["entrant"]["participants"][0]["contactInfo"]["country"])
		}
		p1Name = team1["entrant"]["participants"][0]["gamerTag"]

		//player 1 doubles
		p1DoublesUserId = ""
		p1DoublesPronouns = ""
		p1DoublesName = ""
		p1DoublesCountry = ""
		if (team1["entrant"]["participants"].length > 1) {
			if (team1["entrant"]["participants"][1]["user"] != null) {
				p1DoublesUserId = team1["entrant"]["participants"][1]["user"]["discriminator"]
				p1DoublesPronouns = team1["entrant"]["participants"][1]["user"]["genderPronoun"]
				p1DoublesCountry = getCountry(p1DoublesUserId) || 
					(team1["entrant"]["participants"][1]["user"]["location"]["country"] || team1["entrant"]["participants"][1]["contactInfo"]["country"])
			}
			p1DoublesName = team1["entrant"]["participants"][1]["gamerTag"]
		}

		//player 2
		p2Entrant = team2["entrant"]["id"]
		p2UserId = ""
		p2Pronouns = ""
		p2Country = ""
		if (team2["entrant"]["participants"][0]["user"] != null) {
			p2UserId = team2["entrant"]["participants"][0]["user"]["discriminator"]
			p2Pronouns = team2["entrant"]["participants"][0]["user"]["genderPronoun"]
			p2Country = getCountry(p2UserId) || 
				(team2["entrant"]["participants"][0]["user"]["location"]["country"] || team2["entrant"]["participants"][0]["contactInfo"]["country"])
		}
		p2Name = team2["entrant"]["participants"][0]["gamerTag"]

		//player 2 doubles
		p2DoublesUserId = ""
		p2DoublesPronouns = ""
		p2DoublesName = ""
		p2DoublesCountry = ""
		if (team2["entrant"]["participants"].length > 1) {
			if (team2["entrant"]["participants"][1]["user"] != null) {
				p2DoublesUserId = team2["entrant"]["participants"][1]["user"]["discriminator"]
				p2DoublesPronouns = team2["entrant"]["participants"][1]["user"]["genderPronoun"]
				p2DoublesCountry = getCountry(p2DoublesUserId) || 
					(team2["entrant"]["participants"][1]["user"]["location"]["country"] || team2["entrant"]["participants"][1]["contactInfo"]["country"])
			}
			p2DoublesName = team2["entrant"]["participants"][1]["gamerTag"]
		}

		matchData = {
			"id": set["id"],
			"round": matchRound,
			"player1": {
				"entrantId": p1Entrant,
				"data": [
					{
						"id": p1UserId,
						"name": p1Name,
						"pronouns": p1Pronouns,
						"country": p1Country
					},
					{
						"id": p1DoublesUserId,
						"name": p1DoublesName,
						"pronouns": p1DoublesPronouns,
						"country": p1DoublesCountry
					}
				]
			},
			"player2": {
				"entrantId": p2Entrant,
				"data": [
					{
						"id": p2UserId,
						"name": p2Name,
						"pronouns": p2Pronouns,
						"country": p2Country
					},
					{
						"id": p2DoublesUserId,
						"name": p2DoublesName,
						"pronouns": p2DoublesPronouns,
						"country": p2DoublesCountry
					}
				]
			}
		}
		console.log(`${p1Country}`)
		console.log(`${p2Country}`)
		return(matchData)
	}
}

/* Submit first, if error try to update, if error give up */
function submitStartggSet(setId, winnerId, gameData) {
	const submitController = new AbortController()
	const submitTimeout = setTimeout(() => {
		submitController.abort()
		$("#submit-startgg-set").css("background-color", "#F56262");
		$("#submit-startgg-set").css("border-bottom", "3px solid #F53535");
		$("#submit-startgg-set").text("Error ");
		$("#submit-startgg-set").append('<i class="fa-solid fa-triangle-exclamation"></i>')
		setTimeout(function () {
			$("#submit-startgg-set").css("background-color", "#FFF");
			$("#submit-startgg-set").css("border-bottom", "3px solid #AAA");
			$("#submit-startgg-set").text("Submit start.gg");
		}, 2000);
	}, 5000);
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
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
		signal: submitController.signal,
	}).then((res) => res.json())
		.then((result) => {
			clearTimeout(submitTimeout)
			if(typeof result.errors !== "undefined") {
				console.error(result.errors[0].message)
				console.error({setId, winnerId, gameData})
				updateStartggSet(setId, winnerId, gameData)
			} else {
				$("#submit-startgg-set").css("background-color", "#55F76B");
				$("#submit-startgg-set").css("border-bottom", "3px solid #349641");
				$("#submit-startgg-set").text("Submitted ");
				$("#submit-startgg-set").append('<i class="fa-solid fa-thumbs-up"></i>')
				setTimeout(function () {
					$("#submit-startgg-set").css("background-color", "#FFF");
					$("#submit-startgg-set").css("border-bottom", "3px solid #AAA");
					$("#submit-startgg-set").text("Submit start.gg");
				}, 2000);
			}
			
		})
}

/* Definitely dont need 2 of these but im lazy and in a rush at the point of writing this */
function updateStartggSet(setId, winnerId, gameData) {
	const submitController = new AbortController()
	const submitTimeout = setTimeout(() => {
		submitController.abort()
		$("#submit-startgg-set").css("background-color", "#F56262");
		$("#submit-startgg-set").css("border-bottom", "3px solid #F53535");
		$("#submit-startgg-set").text("Error ");
		$("#submit-startgg-set").append('<i class="fa-solid fa-triangle-exclamation"></i>')
		setTimeout(function () {
			$("#submit-startgg-set").css("background-color", "#FFF");
			$("#submit-startgg-set").css("border-bottom", "3px solid #AAA");
			$("#submit-startgg-set").text("Submit start.gg");
		}, 2000);
	}, 5000);
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				mutation updateSet($setId: ID!, $winnerId: ID!, $gameData: [BracketSetGameDataInput]) {
					updateBracketSet(setId: $setId, winnerId: $winnerId, gameData: $gameData) {
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
		signal: submitController.signal,
	}).then((res) => res.json())
		.then((result) => {
			clearTimeout(submitTimeout)
			if(typeof result.errors !== "undefined") {
				console.error(result.errors[0].message)
				$("#submit-startgg-set").css("background-color", "#F56262");
				$("#submit-startgg-set").css("border-bottom", "3px solid #F53535");
				$("#submit-startgg-set").text("Error ");
				$("#submit-startgg-set").append('<i class="fa-solid fa-triangle-exclamation"></i>')
				setTimeout(function () {
					$("#submit-startgg-set").css("background-color", "#FFF");
					$("#submit-startgg-set").css("border-bottom", "3px solid #AAA");
					$("#submit-startgg-set").text("Submit start.gg");
				}, 2000);
			} else {
				$("#submit-startgg-set").css("background-color", "#55F76B");
				$("#submit-startgg-set").css("border-bottom", "3px solid #349641");
				$("#submit-startgg-set").text("Submitted ");
				$("#submit-startgg-set").append('<i class="fa-solid fa-thumbs-up"></i>')
				setTimeout(function () {
					$("#submit-startgg-set").css("background-color", "#FFF");
					$("#submit-startgg-set").css("border-bottom", "3px solid #AAA");
					$("#submit-startgg-set").text("Submit start.gg");
				}, 2000);
			}
			
		})
}

//misc
function getCountryInformation(tournamentSlug) {
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query tournamentCountry($name:String!){
					tournament(slug: $name){
						participants(
							query:{
								page: 1,
								perPage: 500
							}
						){
							nodes {
								gamerTag
								contactInfo{
									country
								}
								user {
									location {
										country
									}
										
								}
							}
						}
					}
				}
			`,
			variables: {
				name: tournamentSlug
			},
		}),
	})
	.then((res) => res.json())
	.then((result) => {
		let countries = new Map()
		for(let participant of result.data.tournament.participants.nodes) {
			country = participant.contactInfo.country || participant.user.location.country;
			value = countries.has(country) ? countries.get(country)+1 : 1;
			countries.set(country, value)
		}
		console.log(countries)
	});
}