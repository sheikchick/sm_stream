/* GET AND LOAD SEEDS FOR A GIVEN PHASE */
const SEED_UP = 0;
const SEED_DOWN = 1;

function getSeeds() {
	phaseId = $("#phases :selected").val();
	fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				query GetPhaseSeeds($id: ID) {
					phase(id: $id) {
						seeds(query : {
								page : 1,
								perPage : 500,
								sortBy : "seedNum ASC"
							}) {
							nodes {
								players {
									gamerTag
								}
								phaseGroup {
									id
								}
								seedNum
								id
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
			let nodes = result.data.phase.seeds.nodes;
            $("#right_wrapper").empty()
			for (let node of nodes) {
                let seedDiv = $('<div />')
                    .attr('class', 'seed')
                seedDiv.append($('<span />')
                    .attr('class', 'seed-index')
                    .text(node.seedNum))
                seedDiv.append($('<span />')
                    .attr('data-seedNum', node.seedNum)
                    .attr('data-seedID', node.id)
                    .attr('data-pgID', node.phaseGroup.id)
                    .attr('class', 'seed-name')
                    .attr('id', `seed${node.seedNum}`)
                    .text(node.players[0].gamerTag))
                if(node.seedNum != 1) {
                    seedDiv.append($('<button />')
                        .attr('onclick', `swapSeed(${node.seedNum}, -1)`)
                        .attr('class', 'seedswap')
                        .append('<i class="fa-solid fa-arrow-up"></i>'))
                }
                if(node.seedNum != nodes.length) {
                    seedDiv.append($('<button />')
                        .attr('onclick', `swapSeed(${node.seedNum}, 1)`)
                        .attr('class', 'seedswap')
                        .append('<i class="fa-solid fa-arrow-down"></i>'))
                }
                $("#right_wrapper").append(seedDiv)
			}
            $("#right_wrapper").append($('<button />')
                        .attr('onclick', `submitSeeds()`)
                        .attr('class', 'submit-seeds')
                        .text('Submit seed'))
        });
}

function swapSeed(index, offset) {
    element = $(`#seed${index}`)
    element_swap = $(`#seed${index+offset}`)

    seedID = element.attr('data-seedID')
    playerName = element.text()

    element
        .attr('data-seedID', element_swap.attr('data-seedID'))
        .text(element_swap.text())

    element_swap
        .attr('data-seedID', seedID)
        .text(playerName)
}

function submitSeeds() {
    seedMapping = []
    $("#right_wrapper").children('div').each((index, item) => {
        seedSpan = $(item).find(".seed-name")
        seedMapping.push({
            seedID: seedSpan.attr('data-seedID'),
            seedNum: seedSpan.attr('data-seedNum'),
            phaseGroupId: seedSpan.attr('data-pgID')
        })
    })

    console.log(seedMapping)

    fetch('https://api.start.gg/gql/alpha', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + api_key,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `
				mutation updatePhaseSeeding($phaseId: ID!, $seedMapping: [UpdatePhaseSeedInfo]!, $options: UpdatePhaseSeedingOptions) {
					updatePhaseSeeding(phaseId: $phaseId, seedMapping: $seedMapping, options: $options) {
                        id
                        state
					}
				}
			`,
			variables: {
				"phaseId": $("#phases :selected").val(),
                "seedMapping": seedMapping,
                "options" : {
                    "strictMode": true
                }
			},
		}),
	})
		.then((res) => res.json())
		.then((result) => {console.log(result)});
}