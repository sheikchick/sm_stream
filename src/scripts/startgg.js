/**
 * STARTGG
 */

/* GET EVENTS IN TOURNAMENT (Melee Singles, Melee Doubles, ...) */
const getTournamentEvents = (tournamentSlug = "") => new Promise((resolve, reject) => {
	if (!tournamentSlug)
		tournamentSlug = extractSlug($("#tournament-slug").val())
	eventId = ""
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
							type
							url
						}
						events{
							id
							name
						}
						streams {
							enabled
							id
							streamName
							streamSource
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
			$("#tournament-image").attr("src", image?.url || "static/img/startgg.png")
			tournamentName = result.data.tournament.name
			//set up autocomplete
			//getDBAutocompleteSlug(tournamentSlug)
			//add new events
			$("#events").empty()
			$("#events").append(new Option("Select...", 0));
			for (let event of result["data"]["tournament"]["events"]) {
				eventOption = new Option(event["name"], event["id"]);
				$("#events").append(eventOption);
			}
			$("#events").show()
			//set up live streams
			$("#startgg-streams").empty()
			$("#startgg-streams").append(new Option("Select stream...", 0));
			for (let livestream of result["data"]["tournament"]["streams"]) {
				livestreamOption = new Option(`${livestream["streamSource"].toLowerCase()}/${livestream["streamName"]}`, livestream["id"]);
				$("#startgg-streams").append(livestreamOption);
			}
			$("#startgg-streams").show()
			resolve()
		});
})

/* GET PHASES IN EVENT (Pools, Pro Bracket, ...) */
const getEventPhases = (eventId = "") => new Promise((resolve, reject) => {
	if (!eventId)
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
						tournament {
							slug
						}
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
				for (let phaseGroup of phase.phaseGroups.nodes) {
					let phaseName = phase.name
					if (phase.phaseGroups.nodes.length > 1)
						phaseName += ` ${phaseGroup.displayIdentifier}`
					phaseGroupOption = `<option value="${phaseGroup.id}">&nbsp;&nbsp;${phaseName}</option>`;
					$("#phases").append(phaseGroupOption);
				}
				$("#phases").attr("tournament-slug", result["data"]["event"]["tournament"]["slug"])
				$("#phases").show()
			}
			resolve()
		});
})

/* GET PHASEGROUPS IN PHASE (Pool A1, Pool A2, ...) */
const getPhaseGroups = (phaseId = "") => new Promise((resolve, reject) => {
	if (!phaseId)
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
			resolve()
		});
})

/* GET AND LOAD SETS FROM THE STREAMQUEUE */
function getStreamQueues() {
	tournamentSlug = extractSlug($("#tournament-slug").val())
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
					images {
						type
						url
					}
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
			//set image
			image = result.data.tournament.images.find((el) => {
				return el.type === "profile";
			})
			$("#tournament-image").attr("src", image?.url || "static/img/startgg.png")
			tournamentName = result.data.tournament.name
			streamQueue = result.data.tournament.streamQueue
			if (streamQueue.length === 1) {
				getStreamQueue(tournamentSlug, streamQueue[0].stream.streamName)
			} else {
				$("#streams").append(new Option("Select...", 0));
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
									name
									team {
										members {
											isAlternate
											participant {
												gamerTag
												user {
													discriminator
												}
											}
										}
									}
                                    participants {
										prefix
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
			sets = []
			streamQueue = result.data.tournament.streamQueue.find((element) => (element.stream.streamName === streamName))
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
	console.log(phaseGroup)
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query GetSets($pgID:ID!, $page:Int!, $perPage:Int!) {
					phaseGroup(id:$pgID) {
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
						) {
							nodes {
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
										name
										team {
											members {
												isAlternate
												participant {
													gamerTag
													user {
														discriminator
													}
												}
											}
										}
										participants {
											prefix
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
				pgID: phaseGroup,	//phasegroupID
				page: 1,
				perPage: 80
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			console.log(result)
			sets = []
			phaseGroup = result["data"]["phaseGroup"]
			for (let set of phaseGroup["sets"]["nodes"]) {
				matchRound = phaseGroup["bracketType"] == "ROUND_ROBIN"
					? phaseGroup["phase"]["name"] + " " + phaseGroup["displayIdentifier"]
					: set["fullRoundText"]
				let newSet = constructSetObject(set, matchRound)
				if (newSet !== null) {
					sets.push(newSet)
				}
			}
			setPage = 0;
			showSets(true, showButtons);
		});
}

function constructPlayer(participant) {
	return ({
		"slug": participant.user?.discriminator || "",
		"prefix": participant.prefix || "",
		"name": participant.gamerTag || "",
		"pronouns": participant.user?.genderPronoun || "",
		"country": participant.user?.location?.country || participant.contactInfo?.country || ""
	})
}

function constructSetObject(set, matchRound) {
	console.log(set)
	let valid = !set["slots"].some((slot) => {
		return !slot["entrant"]
	})
	if (valid) {
		//players
		let team1 = set["slots"][0]
		let team2 = set["slots"][1]

		//TEAM 1
		let p1Data = []
		for (let participant of team1.entrant.participants) {
			let isAlternate = team1.entrant.team?.members?.find((e) => {
				return e.isAlternate && (e.participant.user.discriminator === participant.user.discriminator)
			})
			isAlternate || p1Data.push(constructPlayer(participant))
		}

		//TEAM 2
		let p2Data = []
		for (let participant of team2.entrant.participants) {
			let isAlternate = team2.entrant.team?.members?.find((e) => {
				return e.isAlternate && (e.participant.user.discriminator === participant.user.discriminator)
			})
			isAlternate || p2Data.push(constructPlayer(participant))
		}

		let matchData = {
			"id": set["id"],
			"tournament": tournamentName,
			"round": matchRound,
			"player1": {
				"entrantId": team1["entrant"]["id"],
				"teamName": team1["entrant"]["name"],
				"data": p1Data
			},
			"player2": {
				"entrantId": team2["entrant"]["id"],
				"teamName": team2["entrant"]["name"],
				"data": p2Data
			}
		}
		console.log(matchData)
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

/**
 * Find a start.gg set for the currently active players
 * @param {*} fullRoundTextFilter Optional filter for fiding 'Grand Final Reset'
 * @returns 
 */
function findStartGGSet(fullRoundTextFilter = "") {
	eventId = $("#events :selected").val()
	if (eventId === undefined) {
		console.log("Empty events - please select an event on start.gg (e.g. Melee Singles)")
		$("#startgg-find-set").css("background-color", "#f5da62");
		$("#startgg-find-set").css("border-bottom", "3px solid #f5cf35");
		$("#startgg-find-set").text("No event");
		setTimeout(function () {
			$("#startgg-find-set").css("background-color", "#FFF");
			$("#startgg-find-set").css("border-bottom", "3px solid #AAA");
			$("#startgg-find-set").text("Find set");
		}, 2000);
		return
	}
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query EventSets($eventId:ID!){
					event(id:$eventId){
						sets( 
							page: 1,
							perPage: 500,
							filters: {
								hideEmpty: true,
								state: [1,2,4,5,6,7]
							} 
						) {
							nodes{
								id
								fullRoundText
								stream {
									enabled
									id
									shortName
									streamName
									streamSource
									streamType
								}
								slots{
									entrant{
                                        id
										participants{
											prefix
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
				eventId: eventId
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			console.log(result)
			playerSlugs = [$("#p1-slug").val(), $("#p2-slug").val()]
			if (isDoubles) {
				playerSlugs.push($("#p1d-slug").val())
				playerSlugs.push($("#p2d-slug").val())
			}
			let foundSet = result?.data?.event?.sets?.nodes?.find((set) => {
				if (fullRoundTextFilter) {
					if (fullRoundTextFilter !== set.fullRoundText) {
						return false;
					}
				}
				return playerSlugs.every((slug) => {
					return set.slots.some((slot) => {
						return slot.entrant?.participants?.some((participant) => {
							return slug === participant.user?.discriminator
						})
					})
				})
			})
			//check every slug requested matches the player for a given set

			if (foundSet) {
				console.log("Set found")
				console.log(foundSet)
				//if #p2-slug is in slot[0], mark it as swapped for startgg (no need to check for doubles or other slots as should not be needed)
				startggSwapped = foundSet.slots[0].entrant.participants.some((participant) => {
					return playerSlugs[1] === participant.user.discriminator
				})
				$("#startgg-p1-entrant").text(foundSet.slots[0].entrant.id)
				$("#startgg-p2-entrant").text(foundSet.slots[1].entrant.id)
				$("#startgg-set-id").text(foundSet.id)

				let p1Name = foundSet.slots[0].entrant.participants.length > 1
					? foundSet.slots[0].entrant.participants[0].gamerTag + " / " + foundSet.slots[0].entrant.participants[1].gamerTag
					: foundSet.slots[0].entrant.participants[0].gamerTag

				let p2Name = foundSet.slots[1].entrant.participants.length > 1
					? foundSet.slots[1].entrant.participants[0].gamerTag + " / " + foundSet.slots[1].entrant.participants[1].gamerTag
					: foundSet.slots[1].entrant.participants[0].gamerTag

				$("#startgg-p1-name").text(p1Name)
				$("#startgg-p2-name").text(p2Name)
				$("#startgg-set-round").text(foundSet.fullRoundText)
				$("#round-change").val(foundSet.fullRoundText)

				$(".no-set").hide()
				$("#current-set-wrapper-info>.wrapper").show()

				$("#startgg-find-set").css("background-color", "#55F76B");
				$("#startgg-find-set").css("border-bottom", "3px solid #349641");
				$("#startgg-find-set").text("Set found");
				setTimeout(function () {
					$("#startgg-find-set").css("background-color", "#FFF");
					$("#startgg-find-set").css("border-bottom", "3px solid #AAA");
					$("#startgg-find-set").text("Find set");
				}, 2000);
				// Fix " (L)"
				fixLosers(foundSet.fullRoundText)
			} else {
				console.log("No set found")
				$("#startgg-find-set").css("background-color", "#F56262");
				$("#startgg-find-set").css("border-bottom", "3px solid #F53535");
				$("#startgg-find-set").text("Not found");
				setTimeout(function () {
					$("#startgg-find-set").css("background-color", "#FFF");
					$("#startgg-find-set").css("border-bottom", "3px solid #AAA");
					$("#startgg-find-set").text("Find set");
				}, 2000);
			}
		})
}

function clearStartGGSet() {
	$("#startgg-p1-entrant").text("")
	$("#startgg-p1-name").text("")
	$("#startgg-p2-entrant").text("")
	$("#startgg-p2-name").text("")
	$("#startgg-set-round").text("")
	$("#startgg-set-id").text("")
	$("#current-set-wrapper-info>.wrapper").hide()
	$(".no-set").show()
}

function getSetProgress(setID) {
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query GetSet($setID:ID!) {
					set(id:$setID) {
						state
						stream {
							enabled
							id
							streamName
							streamSource
						}
					}
				}
			`,
			variables: {
				setID: setID
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			switch (result.data.set.state) {
				case 1:
					//NOT STARTED - 1
					$("#startgg-status").text("Not started")
					$("#current-set-wrapper-status").css({ "background-color": "#68717a" })
					break
				case 2:
					//IN PROGRESS - 2
					$("#startgg-status").text("In progress")
					$("#current-set-wrapper-status").css({ "background-color": "#ff9900" })
					break
				case 3:
					//COMPLETED - 3
					$("#startgg-status").text("Completed")
					$("#current-set-wrapper-status").css({ "background-color": "#0d8225" })
					break
				case 6:
					//CALLED - 6
					$("#startgg-status").text("Called")
					$("#current-set-wrapper-status").css({ "background-color": "#b1a418" })
					break;
				default:
					$("#startgg-status").text(`Unk: ${result.data.set.state}`)
					$("#current-set-wrapper-status").css({ "background-color": "#68717a" })
			}
		});

}

async function loadInitialStartGG(info) {
	let setId = info.startgg.setId
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query GetSet($setId: ID!) {
					set(id:$setId) {
						state
						stream {
							enabled
							id
							streamName
							streamSource
						}
						event {
							id
							tournament {
								slug
							}
						}
						phaseGroup {
							id
							phase {
								id
							}
						}
					}
				}
			`,
			variables: {
				setId: setId
			},
		}),
	})
		.then((res) => res.json())
		.then(async (result) => {
			$("#tournament-slug").val(result.data.set.event.tournament.slug.replace("tournament/", ""))
			await getTournamentEvents(result.data.set.event.tournament.slug.replace("tournament/", ""))
			$("#events").val(result.data.set.event.id)
			await getEventPhases(result.data.set.event.id)
			$("#phases").val(result.data.set.phaseGroup.id).change()
		});
}

/* MISC */

function getCountryInformation() {
	let tournamentSlug = $("#country-tournament").val()
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
			console.log(result)
			let countries = new Map()
			for (let participant of result.data.tournament.participants.nodes) {
				country = participant?.contactInfo?.country || participant?.user?.location?.country || "";
				if (!country) {
					console.log(participant)
				}
				value = countries.has(country) ? countries.get(country) + 1 : 1;
				countries.set(country, value)
			}
			var countriesSorted = new Map([...countries.entries()].sort((a, b) => b[1] - a[1]));
			console.log(countriesSorted)
			$("#country-info").text("")
			for (let [country, amount] of countriesSorted) {
				$("#country-info").append(`${amount} - ${country}<br>`)
			}
		});
}