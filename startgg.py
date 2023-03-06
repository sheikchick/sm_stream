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
    

#Get sets yet to happen from a given phase with 2 entrants
def get_current_sets(client, phase_id):
    result = client.execute('''
        query PhaseSets($phaseId: ID!, $page:Int!, $perPage:Int!){
          phase(id:$phaseId){
            id
            name
            sets(
              page: $page
              perPage: $perPage
              sortType: STANDARD
              filters: {
                hideEmpty: true
                state: 1
              }
            ){
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

    #pp = json_response['data']['phase']
    print(json_response)

    print(json_response['data']['phase']['name'])
    for match in json_response['data']['phase']['sets']['nodes']:
        valid = True
        for entrant in match['slots']:
            if entrant['entrant'] == None:
                valid = False
                break
        if valid:
            print(match['id'])
            print(match['slots'][0]['entrant']['name'])
            print(match['slots'][1]['entrant']['name'])
                
    '''
    CREATED: 1,
    ACTIVE: 2,
    COMPLETED: 3,
    READY: 4,
    INVALID: 5,
    CALLED: 6,
    QUEUED: 7,
    '''

if __name__ == "__main__":
    config = configparser.ConfigParser()
    config.read('config.ini')

    api_key = config['SMASHGG']['api_key']
    api_ver = config['SMASHGG']['api_ver']
    phase_id = config['SMASHGG']['phase_id']
    bracket_size = int(config['SMASHGG']['bracket_size'])

    client = GraphQLClient('https://api.start.gg/gql/' + api_ver)
    client.inject_token('Bearer ' + api_key)

    get_current_sets(client, '1238875')