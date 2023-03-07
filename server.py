from flask import Flask, render_template, request, send_file
from flask_cors import CORS
from graphqlclient import GraphQLClient
from slippi import Game
from threading import Lock
import slp_tools
import configparser
import glob
import json
import logging
import obsws_python as obs
import os
import sys
import threading
import time
import subprocess
import math

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

mutex = Lock()

config = configparser.ConfigParser()
config.read('config.ini')

host = config['GENERAL']['host']
server_port = config['GENERAL']['server_port']

obs_host = config['GENERAL']['obs_host']
obs_port = config['GENERAL']['obs_port']
obs_pass = config['GENERAL']['password']

api_key = config['STARTGG']['api_key']
api_ver = config['STARTGG']['api_ver']
phase_id = config['STARTGG']['phase_id']
bracket_size = int(config['STARTGG']['bracket_size'])

scene_changer = config['SLIPPI']['scene_changer']
slp_folder = config['SLIPPI']['slp_folder']
capture_card = config['SLIPPI']['capture_card']

advanced_game_detection = config['DEBUG'].getboolean('advanced_game_detection')

client = GraphQLClient('https://api.start.gg/gql/' + api_ver)
client.inject_token('Bearer ' + api_key)

last_request_timestamp = 0;
last_id = '0'

match_data = []

cli = sys.modules['flask.cli']
cli.show_server_banner = lambda *x: None

app = Flask(__name__)
CORS(app)

obs_client = None

try:
    obs_client = obs.ReqClient(host=obs_host, port=int(obs_port), password=obs_pass)
except:
    print("OBS connection could not be made")

@app.route("/manual")
def manual():
    data = readJSON()
    p1_tag = data["Player1"]["name"]
    p1d_tag = data["Player1"]["dubs_name"]
    p1_char = data["Player1"]["character"]
    p1_colour = data["Player1"]["colour"]
    p1d_char = data["Player1"]["character_dubs"]
    p1d_colour = data["Player1"]["colour_dubs"]
    p1_score = data["Player1"]["score"]

    p2_tag = data["Player2"]["name"]
    p2d_tag = data["Player2"]["dubs_name"]
    p2_char = data["Player2"]["character"]
    p2_colour = data["Player2"]["colour"]
    p2d_char = data["Player2"]["character_dubs"]
    p2d_colour = data["Player2"]["colour_dubs"]
    p2_score = data["Player2"]["score"]

    tournament_round = data["round"]
    caster1 = data["caster1"]
    caster2 = data["caster2"]
    is_doubles = data["is_doubles"]
    best_of = data["best_of"]
    return render_template("manual.html", 
        p1_tag=p1_tag, 
        p1d_tag=p1d_tag, 
        p1_char=p1_char, 
        p1_colour=p1_colour, 
        p1d_char=p1d_char,
        p1d_colour=p1d_colour,
        p1_score=p1_score,

        p2_tag=p2_tag, 
        p2d_tag=p2d_tag, 
        p2_char=p2_char,
        p2_colour=p2_colour,
        p2d_char=p2d_char,
        p2d_colour=p2d_colour,
        p2_score=p2_score,

        round=tournament_round,
        caster1=caster1,
        caster2=caster2,
        is_doubles=is_doubles,
        best_of=best_of
    )

@app.route("/data.json", methods=["POST", "GET"])
def data():
    data = readJSON()
    return data

@app.route("/")
def index():
    data = readJSON()
    p1_tag = data["Player1"]["name"]
    p1d_tag = data["Player1"]["dubs_name"]
    p1_char = data["Player1"]["character"]
    p1_colour = data["Player1"]["colour"]
    p1d_char = data["Player1"]["character_dubs"]
    p1d_colour = data["Player1"]["colour_dubs"]
    p1_score = data["Player1"]["score"]

    p2_tag = data["Player2"]["name"]
    p2d_tag = data["Player2"]["dubs_name"]
    p2_char = data["Player2"]["character"]
    p2_colour = data["Player2"]["colour"]
    p2d_char = data["Player2"]["character_dubs"]
    p2d_colour = data["Player2"]["colour_dubs"]
    p2_score = data["Player2"]["score"]

    tournament_round = data["round"]
    caster1 = data["caster1"]
    caster2 = data["caster2"]
    is_doubles = data["is_doubles"]
    best_of = data["best_of"]
    return render_template("auto.html", 
        p1_tag=p1_tag, 
        p1d_tag=p1d_tag, 
        p1_char=p1_char, 
        p1_colour=p1_colour, 
        p1d_char=p1d_char,
        p1d_colour=p1d_colour,
        p1_score=p1_score,

        p2_tag=p2_tag, 
        p2d_tag=p2d_tag, 
        p2_char=p2_char,
        p2_colour=p2_colour,
        p2d_char=p2d_char,
        p2d_colour=p2d_colour,
        p2_score=p2_score,

        round=tournament_round,
        caster1=caster1,
        caster2=caster2,
        is_doubles=is_doubles,
        best_of=best_of
    )

@app.route("/old_auto")
def old_auto():
    data = readJSON()
    p1_tag = data["Player1"]["name"]
    p1d_tag = data["Player1"]["dubs_name"]
    p1_char = data["Player1"]["character"]
    p1_colour = data["Player1"]["colour"]
    p1d_char = data["Player1"]["character_dubs"]
    p1d_colour = data["Player1"]["colour_dubs"]
    p1_score = data["Player1"]["score"]

    p2_tag = data["Player2"]["name"]
    p2d_tag = data["Player2"]["dubs_name"]
    p2_char = data["Player2"]["character"]
    p2_colour = data["Player2"]["colour"]
    p2d_char = data["Player2"]["character_dubs"]
    p2d_colour = data["Player2"]["colour_dubs"]
    p2_score = data["Player2"]["score"]

    tournament_round = data["round"]
    caster1 = data["caster1"]
    caster2 = data["caster2"]
    is_doubles = data["is_doubles"]
    best_of = data["best_of"]
    return render_template("old_auto.html", 
        p1_tag=p1_tag, 
        p1d_tag=p1d_tag, 
        p1_char=p1_char, 
        p1_colour=p1_colour, 
        p1d_char=p1d_char,
        p1d_colour=p1d_colour,
        p1_score=p1_score,

        p2_tag=p2_tag, 
        p2d_tag=p2d_tag, 
        p2_char=p2_char,
        p2_colour=p2_colour,
        p2d_char=p2d_char,
        p2d_colour=p2d_colour,
        p2_score=p2_score,

        round=tournament_round,
        caster1=caster1,
        caster2=caster2,
        is_doubles=is_doubles,
        best_of=best_of
    )

@app.route("/update", methods=["POST"])
def update():
    writeJSON(request.form)
    return "OK"
    
@app.route("/name_update", methods=["POST"])
def name_update():
    processNames(request.json)
    return "OK"

@app.route("/database.json", methods=["POST", "GET"])
def databaseJSON():
    try:
        return send_file('data/json/database.json', as_attachment=True)
    except Exception as e:
        return str(e)
    
@app.route("/match_result.json", methods=["POST", "GET"])
def matchJSON():
    try:
        return send_file('data/json/match_result.json', as_attachment=True)
    except Exception as e:
        return str(e)

@app.route("/information.json", methods=["POST", "GET"])
def infoJSON():
    mutex.acquire()
    try:
        return send_file('data/json/info.json', as_attachment=True)
    except Exception as e:
        return str(e)
    finally:
        mutex.release()

@app.route("/top8.json", methods=["POST", "GET"])
def top8JSON():
    try:
        return send_file('data/json/top8.json', as_attachment=True)
    except Exception as e:
        return str(e)

@app.route("/favicon.ico")
def favicon():
    try:
        return send_file('static/favicon.ico')
    except Exception as e:
        return str(e)
    
@app.route("/slippi.svg")
def slippi_svg():
    try:
        return send_file('static/slippi.svg')
    except Exception as e:
        return str(e)
        
def readTablet():
    with open("data/json/tablet.json") as infile:
        data = json.load(infile)
        return data

def writeJSON(information):
    try:
        pronoun_lookup = json.load(open("data/json/pronouns.json"))
        p1pro = ""
        p2pro = ""
        if information["p1_tag"] in pronoun_lookup:
            p1pro = pronoun_lookup[information["p1_tag"]]
        if information["p2_tag"] in pronoun_lookup:
            p2pro = pronoun_lookup[information["p2_tag"]]
        data = {
            "Player1": {
                "name": information["p1_tag"],
                "dubs_name": information["p1d_tag"],
                "character": information["p1_char"],
                "colour": information["p1_colour"],
                "character_dubs": information["p1d_char"],
                "colour_dubs": information["p1d_colour"],
                "pronouns": p1pro,
                "score": information["p1_score"],
                "team_name": information["p1_tag"] + " & " + information["p1d_tag"]
            },
            "Player2": {
                "name": information["p2_tag"],
                "dubs_name": information["p2d_tag"],
                "character": information["p2_char"],
                "colour": information["p2_colour"],
                "character_dubs": information["p2d_char"],
                "colour_dubs": information["p2d_colour"],
                "pronouns": p2pro,
                "score": information["p2_score"],
                "team_name": information["p2_tag"] + " & " + information["p2d_tag"]
            },
            "round": information["round"],
            "caster1": information["caster1"],
            "caster2": information["caster2"],
            "is_doubles": information["is_doubles"],
            "best_of": information["best_of"]
        }
        mutex.acquire()
        try:
            with open("data/json/info.json", "w") as outfile:
                json.dump(data, outfile)
        finally:
            mutex.release()
    except Exception as e:
        print(e)

        
def processNames(information):
    pronoun_lookup = json.load(open("data/json/pronouns.json"))
    pronouns = ""
    tablet = readTablet()
    stream_data = readJSON()

    if information["tag 1"] in pronoun_lookup:
        pronouns = pronoun_lookup[information["tag 1"]]

        

    if information["device"] == tablet["device 1"]:
        stream_data["Player1"]["name"] = information["tag 1"]
        stream_data["Player1"]["pronouns"] = pronouns
        stream_data["Player1"]["dubs_name"] = information["tag 2"]
        stream_data["Player1"]["team_name"] = information["tag 1"] + " & " + information["tag 2"]

        #has potential to break everything if erroneous inputs are sent from the tablet mid-match, needs beta testing TODO
        stream_data["Player1"]["score"] = 0
        stream_data["Player2"]["score"] = 0
    elif information["device"] == tablet["device 2"]:
        stream_data["Player2"]["name"] = information["tag 1"]
        stream_data["Player2"]["pronouns"] = pronouns
        stream_data["Player2"]["dubs_name"] = information["tag 2"]
        stream_data["Player2"]["team_name"] = information["tag 1"] + " & " + information["tag 2"]

        #has potential to break everything if erroneous inputs are sent from the tablet mid-match, needs beta testing TODO
        stream_data["Player1"]["score"] = 0
        stream_data["Player2"]["score"] = 0
    mutex.acquire()
    try:
        with open("data/json/info.json", "w") as outfile:
            json.dump(stream_data, outfile)
    finally:
        mutex.release()

def readJSON():
    data = None
    mutex.acquire()
    try:
        with open("data/json/info.json") as infile:
            data = json.load(infile)
            return data
    finally:
        mutex.release()

# __    _  __    __ __
#(_ |V||_|(_ |_|/__/__
#__)| || |__)| |\_|\_|
#

def get_score(id):
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

#Get set information
def get_set_object(x, bracket):
    global last_id
    global skip_set2
    
    #just in case of overflow
    if len(bracket) <= (x):
        return

    #if grand finals set 2 wasn't played
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

    scores = get_score(bracket[x]['id'])
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

#Sort by ID
def sort_id(json):
    return(int(json['id']))

def startgg_loop():
    global last_request_timestamp
    try:
        while True:
            current_time = time.perf_counter()
            if (current_time-10 > last_request_timestamp) or (last_request_timestamp == 0):
                json_out = get_top8_info();
                with open("data/json/top8.json", "w") as outfile:
                    json.dump(json_out, outfile)
                last_request_timestamp = time.perf_counter()
            time.sleep(1)
    except:
        print("Error parsing start.gg data, perhaps bracket has no information? Stopping loop. Please restart application to resume.")
        pass

##MAIN METHOD
def get_top8_info():
    global last_id
    #Get response from smash.gg
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
            "phaseId": l,
            "page": 1,
            "perPage": 100
        })
    json_response = json.loads(result)

    #Extract and sort the bracket
    bracket = json_response['data']['phase']['sets']['nodes']
    bracket.sort(key=sort_id, reverse=False)

    json_out = {
        "winners": [],
        "losers": []
    }

    skip_set2 = False

    #Winners Bracket
    for x in range (bracket_size-4, bracket_size+1):
        json_out['winners'].append(get_set_object(x, bracket))

    last_id = '0'

    for x in range (len(bracket)-6, len(bracket)):
        json_out['losers'].append(get_set_object(x, bracket))

    last_id = '0'

    return json_out

# __   ___ _  _ ___
#(_ |   | |_)|_) | 
#__)|___|_|  |  _|_
#
def get_latest_file():
    #Get latest file
    try:
        directory_list = glob.glob(slp_folder + '\*')
        latest_file = max(directory_list, key=os.path.getctime)
        return latest_file
    except:
        print("Error reading .slp directory")
        exit()

def show_slippi():
    global obs_client
    scene = ""
    try:
        scene = obs_client.get_current_program_scene().current_program_scene_name
    except:
        pass
    if obs_client is not None:
        if scene == 'capture_card':
            obs_client.set_current_program_scene('slippi')

def show_capture():
    global obs_client
    scene = ""
    try:
        scene = obs_client.get_current_program_scene().current_program_scene_name
    except:
        pass
    if obs_client is not None:
        if scene == 'slippi':
            obs_client.set_current_program_scene('capture_card')

def get_game_finished():
    global match_data

    #Check if game in progress
    #If the file loaded here is a completed game (ie: not a game in progress), return
    file = get_latest_file()
    try:
        game = Game(file)
        return
    except:
        #game in progress
        print("--Game loaded, in progress...")
        show_slippi()
        pass

    data = readJSON()
    p1_score = int(data['Player1']['score'])
    p2_score = int(data['Player2']['score'])
    best_of = int(data['best_of'])

    #Reset score if game has ended
    if p1_score == math.ceil(best_of/2) or p2_score == math.ceil(best_of/2):
        p1_score = 0
        p2_score = 0
        data['Player1']['score'] = p1_score
        data['Player2']['score'] = p2_score
        mutex.acquire()
        try:
            with open("data/json/info.json", "w") as outfile:
                json.dump(data, outfile)
        finally:
            mutex.release()
    
    game_data = {
        "stage" : "",
        "winner" : 0,
        "p1" : {
            "tag" : "",
            "char" : "",
            "colour" : "",
            "stocks" : 4,
        },
        "p2" : {
            "tag" : "",
            "char" : "",
            "colour" : "",
            "stocks" : 4,
        }
    }

    #Loop till game has ended
    running = True
    while running:
        try:
            #This will throw an exception until the game has ended
            game = Game(file)
            running = False
            #past here the game has ended
            #on normal end, pause for 0.5s
            if game.end.lras_initiator is None or not advanced_game_detection:
                print("--Game ended")
                time.sleep(0.5)
                show_capture()
            #on lrastart, swap instantly
            else:
                print(" --LRAStart - will not automatically update score")
                show_capture()
                running = False
                break
            p = subprocess.Popen(['node', 'node/stats.js', file], stdout=subprocess.PIPE)
            out = p.stdout.read()
            stats = json.loads(out)

            info = json.loads(read_game(file))
            game_data["p1"]["tag"] = data['Player1']['name']
            game_data["p2"]["tag"] = data['Player2']['name']
            game_data["stage"] = slp_tools.match_stage(info["stageId"])
            p1_char = ""
            p2_char = ""
            p1port = info['players'][0]['port']
            p2port = info['players'][1]['port']
            if p1port < p2port:
                p1_char = slp_tools.match_chars(info['players'][0]['characterId'], info['players'][0]['characterColor'])
                p2_char = slp_tools.match_chars(info['players'][1]['characterId'], info['players'][1]['characterColor'])
            else:
                p2_char = slp_tools.match_chars(info['players'][0]['characterId'], info['players'][0]['characterColor'])
                p1_char = slp_tools.match_chars(info['players'][1]['characterId'], info['players'][1]['characterColor'])
            game_data["p1"]["char"] = p1_char["character"]
            game_data["p1"]["colour"] = p1_char["colour"]
            game_data["p2"]["char"] = p2_char["character"]
            game_data["p2"]["colour"] = p2_char["colour"]
            if len(stats["overall"]) == 2:
                scoreupdate = True
                try:
                    for player in info["players"]:
                        if player["type"] == 1:
                            scoreupdate = False
                            print("  --Game included CPU player")
                except Exception as f:
                    print(f)
                if int(stats["playableFrameCount"]) < 2700 :
                    scoreupdate = False
                    print("  --False game detected - Under 45 seconds played")
                if stats["overall"][0]["totalDamage"] < 120 and stats["overall"][1]["totalDamage"] < 120:
                    print("  --False game detected - No character dealt over 120%")
                    scoreupdate = False
                if not advanced_game_detection:
                    print("  --Continuing anyway as 'advanced_game_detection' is disabled in the config file")
                    scoreupdate = True
                if scoreupdate:
                    p1_id = stats["stocks"][0]["playerIndex"]
                    p2_id = stats["stocks"][1]["playerIndex"]
                    p1 = 0
                    p2 = 0
                    for stock in stats["stocks"]:
                        if stock["playerIndex"] == p1_id:
                            if stock["endFrame"] != None:
                                p1+=1
                        elif stock["playerIndex"] == p2_id:
                            if stock["endFrame"] != None:
                                p2+=1
                    #update stock count
                    game_data["p1"]["stocks"] = 4 - p1
                    game_data["p2"]["stocks"] = 4 - p2
                    if p1 < p2:
                        print("--Player 1 wins - " + str(game_data["p1"]["stocks"]) + " stocks to " + str(game_data["p2"]["stocks"]) + " stocks")
                        game_data["winner"] = 1
                        p1_score += 1
                    elif p2 < p1:
                        print("--Player 2 wins - " + str(game_data["p2"]["stocks"]) + " stocks to " + str(game_data["p1"]["stocks"]) + " stocks")
                        game_data["winner"] = 2
                        p2_score += 1
                    elif p1 == p2:
                        length = len(stats["stocks"])
                        #probably redundant to check playerIndex but for safety
                        if stats["stocks"][length-2]['playerIndex'] < stats["stocks"][length-1]['playerIndex']:
                            p1_dmg = stats["stocks"][length-2]["currentPercent"]
                            p2_dmg = stats["stocks"][length-1]["currentPercent"]
                        else:
                            p1_dmg = stats["stocks"][length-1]["currentPercent"]
                            p2_dmg = stats["stocks"][length-2]["currentPercent"]
                        if p1_dmg < p2_dmg:
                            print("--Player 1 wins - " + str(p1_dmg) + "% to " + str(p2_dmg) + "%")
                            game_data["winner"] = 1
                            p1_score += 1
                        elif p2_dmg > p1_dmg:
                            print(" --Player 2 wins - " + str(p2_dmg) + "% to " + str(p1_dmg) + "%")
                            game_data["winner"] = 2
                            p2_score += 1
                        else:
                            print("--Match ended but could not determine winner. Draw?")
                    data = readJSON()
                    data['Player1']['score'] = p1_score
                    data['Player2']['score'] = p2_score
                    #if a tie
                    if game_data["winner"] != 0:
                        match_data.append(game_data)
                    #If game finished, do something with the stats
                    if p1_score >= math.ceil(best_of/2) or p2_score >= math.ceil(best_of/2):
                        #shitty system but it works lol
                        for game in match_data:
                            game['p1']['tag'] = game_data['p1']['tag']
                            game['p2']['tag'] = game_data['p2']['tag']
                        with open("data/json/match_result.json", "w") as outfile:
                            json.dump(match_data, outfile)
                        slp_tools.print_match(match_data)
                        match_data = []
                    mutex.acquire()
                    try:
                        with open("data/json/info.json", "w") as outfile:
                            json.dump(data, outfile)
                    finally:
                        mutex.release()
                else:
                    print("--Game not tracked")

        except Exception as e:
            out = read_game(file)
            update_chars(out)
            pass
            
def update_chars(out):
    slpj = json.loads(out)

    player_count = len(slpj['players'])

    players = slpj['players']

    #singles
    if player_count <= 2:
        p1_char = ""
        p2_char = ""
        p1port = players[0]['port']
        p2port = players[1]['port']
        if p1port < p2port:
            p1_char = slp_tools.match_chars(players[0]['characterId'], players[0]['characterColor'])
            p2_char = slp_tools.match_chars(players[1]['characterId'], players[1]['characterColor'])
        else:
            p2_char = slp_tools.match_chars(players[0]['characterId'], players[0]['characterColor'])
            p1_char = slp_tools.match_chars(players[1]['characterId'], players[1]['characterColor'])

        data = readJSON()
        data['Player1']['character'] = p1_char['character']
        data['Player1']['colour'] = p1_char['colour']
        data['Player2']['character'] = p2_char['character']
        data['Player2']['colour'] = p2_char['colour']
        data['is_doubles'] = "false"
        mutex.acquire()
        try:
            with open("data/json/info.json", "w") as outfile:
                json.dump(data, outfile)
        finally:
            mutex.release()
    #doubles
    elif player_count == 4:
        p1_char = ""
        p1d_char = ""
        p2_char = ""
        p2d_char = ""

        port1_team = 0
        #player 1
        p1_char = players[0]
        port1_team = p1_char['teamId']
        p1_char = slp_tools.match_chars(p1_char['characterId'], p1_char['characterColor'])
        players.remove(p1_char)

        #player 1 doubles
        for char in players:
            if char['teamId'] == port1_team:
                p1d_char = slp_tools.match_chars(char['characterId'], char['characterColor'])
                players.remove(char)
                break
        #very likely redundant
        p2_char = slp_tools.match_chars(slpj['players'][0]['characterId'], slpj['players'][0]['characterColor'])
        p2d_char = slp_tools.match_chars(slpj['players'][1]['characterId'], slpj['players'][1]['characterColor'])
        data = readJSON()

        data['Player1']['character'] = p1_char['character']
        data['Player1']['colour'] = p1_char['character']
        data['Player1']['character_dubs'] = p1d_char['character']
        data['Player1']['colour_dubs'] = p1d_char['character']

        data['Player2']['character'] = p2_char['character']
        data['Player2']['colour'] = p2_char['character']
        data['Player2']['character_dubs'] = p2d_char['character']
        data['Player2']['colour_dubs'] = p2d_char['character']
        data['is_doubles'] = "true"
        mutex.acquire()
        try:
            with open("data/json/info.json", "w") as outfile:
                json.dump(data, outfile)
        finally:
            mutex.release()

    
def read_game(file):
    p = subprocess.Popen(['node', 'node/slippi.js', file], stdout=subprocess.PIPE)
    out = p.stdout.read()
    out = out.decode("utf-8").replace("'", '"')
    return out
    
def slippi_loop():
    try:
        while True:
            get_game_finished()
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass



if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    if phase_id != "0":
        print("Searching start.gg for bracket info...")
        top8 = threading.Thread(target=startgg_loop, name="startgg loop")
        top8.daemon = True
        top8.start()
    else:
        print("No start.gg phase provided, top 8 data will not be updated")
    if scene_changer == "true":
        slippi_checker = threading.Thread(target=slippi_loop, name="slippi loop")
        slippi_checker.daemon = True
        slippi_checker.start()
    print("----------\nApplication running. To access settings, go to http://127.0.0.1:" + server_port + "/\n----------")
    app.run(host=host, port=server_port)