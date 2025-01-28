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
						images {
							id
							height
							ratio
							type
							url
							width
						}
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
			//clear up
			$("#streams").hide()
			$("#events").hide()
			$("#phases").hide()
			$("#phase-groups").hide()
			$("#get-sets").hide()
			if (result["data"]["tournament"] == null) {
				
				return
			}
			//proceed
			//set image
			image = result.data.tournament.images.find((el) => {
				return el.type === "profile";
			})
			$("#tournament-image").attr("src", image.url)
			//set up autocomplete
			getDBAutocompleteSlug(tournamentSlug)
			//add new events
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
			}, getSets
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
				phaseOption = `<option value="${phase.id}" disabled>${phase.name}</option>`;
				$("#phases").append(phaseOption);
				console.log(phase)
				for (let phaseGroup of phase.phaseGroups.nodes) {
					phaseGroupOption = `<option value="${phaseGroup.id}">${phase.name} ${phaseGroup.displayIdentifier}</option>`;
					$("#phases").append(phaseGroupOption);
				}
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
			if (streamQueue.length === 1) {
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
	phaseGroup = $("#phases :selected").val();
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
				set = constructSetObject(set, matchRound)
				if (set !== null) {
					sets.push(set)
				}
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

		setIsDoubles = team1["entrant"]["participants"].length > 1

		//team1
		p1Entrant = team1["entrant"]["id"]

		p1Slug = team1.entrant.participants[0].user?.discriminator || ""
		p1Name = team1.entrant.participants[0].gamerTag || ""
		p1Pronouns = team1.entrant.participants[0].user?.genderPronoun || ""
		p1Country = team1.entrant.participants[0].user?.location?.country || team1.entrant.participants[0].contactInfo?.country || ""

		//player 1 doubles
		p1dSlug = setIsDoubles ? team1.entrant.participants[1].user?.discriminator || "" : ""
		p1dName = setIsDoubles ? team1.entrant.participants[1].gamerTag || "" : ""
		p1dPronouns = setIsDoubles ? team1.entrant.participants[1].user?.genderPronoun || "" : ""
		p1dCountry = setIsDoubles ? team1.entrant.participants[1].user?.location?.country || team1.entrant.participants[1].contactInfo?.country || "" || "" : ""

		//team2
		p2Entrant = team2["entrant"]["id"]

		p2Slug = team2.entrant.participants[0].user?.discriminator || ""
		p2Name = team2.entrant.participants[0].gamerTag || ""
		p2Pronouns = team2.entrant.participants[0].user?.genderPronoun || ""
		p2Country = team2.entrant.participants[0].user?.location?.country || team2.entrant.participants[0].contactInfo?.country || ""

		//player 1 doubles
		p2dSlug = setIsDoubles ? team2.entrant.participants[1].user?.discriminator || "" : ""
		p2dName = setIsDoubles ? team2.entrant.participants[1].gamerTag || "" : ""
		p2dPronouns = setIsDoubles ? team2.entrant.participants[1].user?.genderPronoun || "" : ""
		p2dCountry = setIsDoubles ? team2.entrant.participants[1].user?.location?.country || team2.entrant.participants[1].contactInfo?.country || "" || "" : ""

		matchData = {
			"id": set["id"],
			"round": matchRound,
			"player1": {
				"entrantId": p1Entrant,
				"data": [
					{
						"slug": p1Slug,
						"name": p1Name,
						"pronouns": p1Pronouns,
						"country": p1Country
					},
					{
						"slug": p1dSlug,
						"name": p1dName,
						"pronouns": p1dPronouns,
						"country": p1dCountry
					}
				]
			},
			"player2": {
				"entrantId": p2Entrant,
				"data": [
					{
						"slug": p2Slug,
						"name": p2Name,
						"pronouns": p2Pronouns,
						"country": p2Country
					},
					{
						"slug": p2dSlug,
						"name": p2dName,
						"pronouns": p2dPronouns,
						"country": p2dCountry
					}
				]
			}
		}
		return (matchData)
	}
	return null;
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
			if (typeof result.errors !== "undefined") {
				console.error(result.errors[0].message)
				console.error({ setId, winnerId, gameData })
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
			if (typeof result.errors !== "undefined") {
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

//database
//misc

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
			for (let participant of result.data.tournament.participants.nodes) {
				country = participant.contactInfo.country || participant.user.location.country;
				value = countries.has(country) ? countries.get(country) + 1 : 1;
				countries.set(country, value)
			}
			console.log(countries)
		});
}