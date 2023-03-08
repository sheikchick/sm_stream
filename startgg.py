from graphqlclient import GraphQLClient
import configparser
import json
import os
import sys
import threading
import time
import subprocess
import math


def get_events(client, tournament):
    return none

# Sort by ID


def sort_id(json):
    return (int(json["id"]))


def get_top8_info(client, phase_id, bracket_size):
    # Get response from smash.gg
    result = client.execute('''
        query PhaseSets($phaseId: ID!, $page:Int!, $perPage:Int!){
            phase(id:$phaseId){
                id
                name
                sets(
                    page: $page
                    perPage: $perPage
                    sortType: STANDARD
                ){
                    pageInfo{
                        total
                    }
                    nodes{
                        id
                        slots{
                            id
                            entrant{
                                id
                                name
                            }
                        }
                    }
                }
            }
        }
        ''',
        {
            "phaseId": phase_id,
            "page": 1,
            "perPage": 100
        })
    json_response = json.loads(result)

    # Extract and sort the bracket
    bracket = json_response['data']['phase']['sets']['nodes']
    bracket.sort(key=sort_id, reverse=False)

    json_out = {
        "winners": [],
        "losers": []
    }

    skip_set2 = False

    last_id = '0'
    # Winners Bracket
    for x in range(bracket_size-4, bracket_size+1):
        json_out['winners'].append(get_set_object(
            client, x, bracket, last_id, skip_set2))
        last_id = bracket[x]['id']

    last_id = '0'

    for x in range(len(bracket)-6, len(bracket)):
        json_out['losers'].append(get_set_object(
            client, x, bracket, last_id, skip_set2))
        bracket[x]['id']

    return json_out


def get_set_object(client, x, bracket, last_id, skip_set2):
    try:
        # just in case of overflow
        if len(bracket) <= (x):
            return

        # if grand finals set 2 wasn't played
        if last_id != '0':
            if int(bracket[x]['id']) != int(last_id)+1:
                skip_set2 = True
                return {
                    "p1": {
                        "tag": '',
                        "score": ''
                    },
                    "p2": {
                        "tag": '',
                        "score": ''
                    }
                }
        last_id = bracket[x]['id']

        name1 = ''
        name2 = ''

        scores = get_score(client, bracket[x]['id'])
        score1 = scores['p1']
        score2 = scores['p2']

        entrant1 = bracket[x]['slots'][0]['entrant']
        entrant2 = bracket[x]['slots'][1]['entrant']

        if entrant1 is not None:
            name1_split = entrant1['name'].split("|")
            name1 = name1_split[len(name1_split)-1].strip()

        if entrant2 is not None:
            name2_split = entrant2['name'].split("|")
            name2 = name2_split[len(name2_split)-1].strip()

        return {
            "p1": {
                "tag": name1,
                "score": score1
            },
            "p2": {
                "tag": name2,
                "score": score2
            }
        }
    except Exception as e:
        print(e)


def get_score(client, id):
    result = client.execute('''
    query set($setId: ID!){
        set(id:$setId){
            id
            slots{
                standing{
                    placement
                    stats{
                        score {
                            label
                            value
                        }
                    }
                }
            }
        }
    }
    ''',
    {
        "setId": id
    })
    response = json.loads(result)

    p1info = response['data']['set']['slots'][0]['standing']
    p2info = response['data']['set']['slots'][1]['standing']

    p1 = ''
    p2 = ''

    if p1info is not None:
        p1 = p1info['stats']['score']['value']

    if p2info is not None:
        p2 = p2info['stats']['score']['value']

    return {
        "p1": p1,
        "p2": p2
    }


if __name__ == "__main__":
    config = configparser.ConfigParser()
    config.read('config.ini')

    api_key = config['STARTGG']['api_key']
    api_ver = config['STARTGG']['api_ver']
    phase_id = config['STARTGG']['phase_id']
    bracket_size = int(config['STARTGG']['bracket_size'])

    client = GraphQLClient('https://api.start.gg/gql/' + api_ver)
    client.inject_token('Bearer ' + api_key)

    get_tournament(client, 'stg3-test-3')
    # get_current_sets(client, '1238875')
