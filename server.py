from flask import Flask, render_template, request, send_file
from flask_cors import CORS
from graphqlclient import GraphQLClient
from slippi import Game
from threading import Lock

import slp_tools
import startgg

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

cli = sys.modules['flask.cli']
cli.show_server_banner = lambda *x: None

app = Flask(__name__)
CORS(app)

obs_client = None

try:
    obs_client = obs.ReqClient(host=obs_host, port=int(obs_port), password=obs_pass)
except:
    print("OBS connection could not be made")
#https://patorjk.com/software/taag/#p=display&h=2&v=1&f=Standar

def gameDataJSON():
    return {
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

'''
  _____ _           _    
 |  ___| | __ _ ___| | __
 | |_  | |/ _` / __| |/ /
 |  _| | | (_| \__ \   < 
 |_|   |_|\__,_|___/_|\_\               
'''

'''Data Updates'''

#Website update
@app.route("/update", methods=["POST"])
def update():
    updateJSON(request.form)
    return "OK"

#Tablet update
@app.route("/name_update", methods=["POST"])
def name_update():
    processNames(request.json)
    return "OK"

'''Config-pages'''

#Auto
@app.route("/")
def index():
    global api_key
    global obs_port
    global obs_pass
    data = readJSON()
    p1_tag = data["Player1"]["name"]
    p1_char = data["Player1"]["character"]
    p1_colour = data["Player1"]["colour"]
    p1_pronouns = data["Player1"]["pronouns"]
    
    p1d_tag = data["Player1"]["name_dubs"]
    p1d_char = data["Player1"]["character_dubs"]
    p1d_colour = data["Player1"]["colour_dubs"]
    p1d_pronouns = data["Player1"]["pronouns_dubs"]

    p1_score = data["Player1"]["score"]

    p2_tag = data["Player2"]["name"]
    p2_char = data["Player2"]["character"]
    p2_colour = data["Player2"]["colour"]
    p2_pronouns = data["Player2"]["pronouns"]

    p2d_tag = data["Player2"]["name_dubs"]
    p2d_char = data["Player2"]["character_dubs"]
    p2d_colour = data["Player2"]["colour_dubs"]
    p2d_pronouns = data["Player2"]["pronouns_dubs"]

    p2_score = data["Player2"]["score"]

    tournament_round = data["round"]
    caster1 = data["caster1"]
    caster2 = data["caster2"]
    is_doubles = data["is_doubles"]
    best_of = data["best_of"]
    return render_template("auto.html", 
        p1_tag=p1_tag, 
        p1_char=p1_char, 
        p1_colour=p1_colour, 
        p1_pronouns=p1_pronouns,
        p1d_tag=p1d_tag, 
        p1d_char=p1d_char,
        p1d_colour=p1d_colour,
        p1d_pronouns=p1d_pronouns,
        p1_score=p1_score,

        p2_tag=p2_tag, 
        p2_char=p2_char,
        p2_colour=p2_colour,
        p2_pronouns=p2_pronouns,
        p2d_tag=p2d_tag, 
        p2d_char=p2d_char,
        p2d_colour=p2d_colour,
        p2d_pronouns=p2d_pronouns,
        p2_score=p2_score,

        round=tournament_round,
        caster1=caster1,
        caster2=caster2,
        is_doubles=is_doubles,
        best_of=best_of,

        api_key = api_key,
        obs_port = obs_port,
        obs_password = obs_pass
    )
#Manual
@app.route("/manual")
def manual():
    data = readJSON()
    p1_tag = data["Player1"]["name"]
    p1d_tag = data["Player1"]["name_dubs"]
    p1_char = data["Player1"]["character"]
    p1_colour = data["Player1"]["colour"]
    p1d_char = data["Player1"]["character_dubs"]
    p1d_colour = data["Player1"]["colour_dubs"]
    p1_score = data["Player1"]["score"]

    p2_tag = data["Player2"]["name"]
    p2d_tag = data["Player2"]["name_dubs"]
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
#Old Auto
@app.route("/old_auto")
def old_auto():
    data = readJSON()
    p1_tag = data["Player1"]["name"]
    p1d_tag = data["Player1"]["name_dubs"]
    p1_char = data["Player1"]["character"]
    p1_colour = data["Player1"]["colour"]
    p1d_char = data["Player1"]["character_dubs"]
    p1d_colour = data["Player1"]["colour_dubs"]
    p1_score = data["Player1"]["score"]

    p2_tag = data["Player2"]["name"]
    p2d_tag = data["Player2"]["name_dubs"]
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

'''JSON data'''

@app.route("/data.json", methods=["POST", "GET"])
def data():
    data = readJSON()
    return data

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
    
'''
  _____ _ _       __        __    _ _   _             
 |  ___(_) | ___  \ \      / / __(_) |_(_)_ __   __ _ 
 | |_  | | |/ _ \  \ \ /\ / / '__| | __| | '_ \ / _` |
 |  _| | | |  __/   \ V  V /| |  | | |_| | | | | (_| |
 |_|   |_|_|\___|    \_/\_/ |_|  |_|\__|_|_| |_|\__, |
                                                |___/ 
'''
#Read data from info.json
def readJSON():
    data = None
    mutex.acquire()
    try:
        with open("data/json/info.json") as infile:
            data = json.load(infile)
            return data
    finally:
        mutex.release()

#Write data to info.json
def writeJSON(data):
    mutex.acquire()
    try:
        with open("data/json/info.json", "w") as outfile:
            json.dump(data, outfile)
    finally:
        mutex.release()

#Write data to info.json as perscribed by the /update endpoint
def updateJSON(information):
    try:
        data = {
            "Player1": {
                "name": information["p1_tag"],
                "character": information["p1_char"],
                "colour": information["p1_colour"],
                "pronouns": information["p1_pronouns"],
                "name_dubs": information["p1d_tag"],
                "character_dubs": information["p1d_char"],
                "colour_dubs": information["p1d_colour"],
                "pronouns_dubs": information["p1d_pronouns"],
                "score": information["p1_score"],
                "team_name": information["p1_tag"] + " & " + information["p1d_tag"]
            },
            "Player2": {
                "name": information["p2_tag"],
                "character": information["p2_char"],
                "colour": information["p2_colour"],
                "pronouns": information["p2_pronouns"],
                "name_dubs": information["p2d_tag"],
                "character_dubs": information["p2d_char"],
                "colour_dubs": information["p2d_colour"],
                "pronouns_dubs": information["p2d_pronouns"],
                "score": information["p2_score"],
                "team_name": information["p2_tag"] + " & " + information["p2d_tag"]
            },
            "round": information["round"],
            "caster1": information["caster1"],
            "caster2": information["caster2"],
            "is_doubles": information["is_doubles"],
            "best_of": information["best_of"]
        }
        writeJSON(data)
    except Exception as e:
        print("Exception in updateJSON()")
        print(e)

'''
  _____     _     _      _   
 |_   _|_ _| |__ | | ___| |_ 
   | |/ _` | '_ \| |/ _ \ __|
   | | (_| | |_) | |  __/ |_ 
   |_|\__,_|_.__/|_|\___|\__|
'''

#Write tablet data to tablet.json
def readTablet():
    with open("data/json/tablet.json") as infile:
        data = json.load(infile)
        return data

#Process names received from the tablet
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
        stream_data["Player1"]["pronouns_dubs"] = ""
        stream_data["Player1"]["name_dubs"] = information["tag 2"]
        stream_data["Player1"]["team_name"] = information["tag 1"] + " & " + information["tag 2"]

        #has potential to break everything if erroneous inputs are sent from the tablet mid-match, needs beta testing TODO
        stream_data["Player1"]["score"] = 0
        stream_data["Player2"]["score"] = 0
    elif information["device"] == tablet["device 2"]:
        stream_data["Player2"]["name"] = information["tag 1"]
        stream_data["Player2"]["pronouns"] = pronouns
        stream_data["Player2"]["pronouns_dubs"] = ""
        stream_data["Player2"]["name_dubs"] = information["tag 2"]
        stream_data["Player2"]["team_name"] = information["tag 1"] + " & " + information["tag 2"]

        #has potential to break everything if erroneous inputs are sent from the tablet mid-match, needs beta testing TODO
        stream_data["Player1"]["score"] = 0
        stream_data["Player2"]["score"] = 0
    writeJSON(stream_data)

'''
      _             _                
  ___| |_ __ _ _ __| |_   __ _  __ _ 
 / __| __/ _` | '__| __| / _` |/ _` |
 \__ \ || (_| | |  | |_ | (_| | (_| |
 |___/\__\__,_|_|   \__(_)__, |\__, |
                         |___/ |___/ 
'''

#Get set information from start.gg (not in use currently)
def startggLoop():
    last_request_timestamp = 0
    try:
        while True:
            current_time = time.perf_counter()
            if (current_time-10 > last_request_timestamp) or (last_request_timestamp == 0):
                json_out = startgg.get_top8_info(client, phase_id, bracket_size)
                with open("data/json/top8.json", "w") as outfile:
                    json.dump(json_out, outfile)
                last_request_timestamp = time.perf_counter()
            time.sleep(1)
    except:
        print("Error parsing start.gg data, perhaps bracket has no information? Stopping loop. Please restart application to resume.")
        pass

'''
  ____  _ _             _ 
 / ___|| (_)_ __  _ __ (_)
 \___ \| | | '_ \| '_ \| |
  ___) | | | |_) | |_) | |
 |____/|_|_| .__/| .__/|_|
           |_|   |_|      
'''
#Get latest file from the slippi directory
def getLatestFile(print_error):
    try:
        directory_list = glob.glob(slp_folder + '\*')
        sort_time = sorted(directory_list, key=os.path.getctime, reverse=True) #TODO: add check for .slp
        for file in sort_time:
            if file[-4:] == ".slp":
                return file
        if print_error:
            print("No .slp files in directory, awaiting files")
        return ""
    except:
        print("Error reading .slp directory")
        return ""

def showSlippi():
    global obs_client
    scene = ""
    try:
        scene = obs_client.get_current_program_scene().current_program_scene_name
    except:
        pass
    if obs_client is not None:
        if scene == 'capture_card':
            obs_client.set_current_program_scene('slippi')

def showCapture():
    global obs_client
    scene = ""
    try:
        scene = obs_client.get_current_program_scene().current_program_scene_name
    except:
        pass
    if obs_client is not None:
        if scene == 'slippi':
            obs_client.set_current_program_scene('capture_card')

def processSLP_new(match_data):
    file = getLatestFile(False)
    if file == "":
        return
    if getGameComplete(file):
        return
    #Past here game is in progress
    print("--Game in progress")
    #Reset score if game has ended
    data = readJSON()
    p1_score = int(data['Player1']['score'])
    p2_score = int(data['Player2']['score'])
    best_of = int(data['best_of'])
    if p1_score == math.ceil(best_of/2) or p2_score == math.ceil(best_of/2):
        p1_score = 0
        p2_score = 0
        data['Player1']['score'] = p1_score
        data['Player2']['score'] = p2_score
        writeJSON(data)

    while True:
        if(getGameComplete(file)):
            try:
                gameEnd = slpJS('getGameEnd', file)
                if gameEnd["lrasInitiatorIndex"] == "-1" or not advanced_game_detection:
                    print("--Game ended")
                    time.sleep(0.5)
                    showCapture()
                #on lrastart, swap instantly
                else:
                    print(" --LRAStart - will not automatically update score")
                    showCapture()
                    break
                stats = slpJS('getStats', file)
                settings = slpJS('getSettings', file)

                scoreupdate = True
                #Detect if CPU players
                for player in settings["players"]:
                    if player["type"] == 1:
                        scoreupdate = False
                        print("  --Game included CPU player")
                #If game is less than 45 seconds
                if int(stats["playableFrameCount"]) < 2700 :
                    scoreupdate = False
                    print("  --False game detected - Under 45 seconds played")
                #If neither character dealt over 120%
                if stats["overall"][0]["totalDamage"] < 120 and stats["overall"][1]["totalDamage"] < 120:
                    #Brute force game (needed for doubles)
                    if stats["overall"][0]["totalDamage"] == 0 and stats["overall"][1]["totalDamage"] < 0:
                        damage_dealt = getDamageBruteForce(file)
                        over_120 = False
                        for x in damage_dealt:
                            if x > 120:
                                over_120 = True
                        if not over_120:
                            print("  --False game detected - No character dealt over 120%")
                            scoreupdate = False
                    else:
                        print("  --False game detected - No character dealt over 120%")
                        scoreupdate = False
                #Whether or not to ignore the above
                if not advanced_game_detection:
                    print("  --Continuing anyway as 'advanced_game_detection' is disabled in the config file")
                    scoreupdate = True
                if scoreupdate:
                    if len(stats["overall"]) == 2:
                            last_frame = slpJS('getLatestFrame', file)
                            winner = slpJS('getWinners', file)

                            game_data = gameDataJSON()
                            game_data["p1"]["tag"] = data['Player1']['name']
                            game_data["p2"]["tag"] = data['Player2']['name']
                            game_data["stage"] = slp_tools.match_stage(settings["stageId"])

                            p1_char = slp_tools.match_chars(settings['players'][0]['characterId'], settings['players'][0]['characterColor'])
                            p2_char = slp_tools.match_chars(settings['players'][1]['characterId'], settings['players'][1]['characterColor'])
                            game_data["p1"]["char"] = p1_char["character"]
                            game_data["p1"]["colour"] = p1_char["colour"]
                            game_data["p2"]["char"] = p2_char["character"]
                            game_data["p2"]["colour"] = p2_char["colour"]
                            #update score
                            if len(winner) == 1:
                                if winner[0]['playerIndex'] == settings['players'][0]['port']:
                                    print("--Player 1 wins")
                                    p1_score += 1
                                    game_data["winner"] = 1
                                elif winner[0]['playerIndex'] == settings['players'][1]['port']:
                                    print("--Player 2 wins")
                                    p2_score += 1
                                    game_data["winner"] = 2
                                else:
                                    print("Error: Winner cannot be determined, winner's port is incorrect")
                                    return
                            else:
                                print("Error: Multiple winners in 2 player game?")
                                return
                            #update game data
                            game_data["p1"]["stocks"] = last_frame["players"][0]["post"]["stocksRemaining"]
                            game_data["p2"]["stocks"] = last_frame["players"][0]["post"]["stocksRemaining"]

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
                                match_data = []
                            writeJSON(data)
                    elif len(stats["overall"]) == 4:
                        winner = slpJS('getWinners', file)
                        if winner == []:
                            #should never be required but just in case, will brute force winner based off stats
                            winner = getDoublesWinner(file)
                        if len(winner) == 2:
                            team1_winner = False
                            for player in winner:
                                if player['playerIndex'] == 0:
                                    team1_winner = True
                            if team1_winner:
                                print("--Team 1 wins")
                                p1_score += 1
                            else:
                                print("--Team 2 wins")
                                p2_score += 1
                        elif len(winner) >= 2:
                            print("Error: More than 2 winners in game of doubles")
                            print(winner)
                            return
                        elif len(winner) <= 2:
                            print("Error: Fewer than 2 winners in game of doubles")
                            print(winner)
                            return
                    data = readJSON()
                    data['Player1']['score'] = p1_score
                    data['Player2']['score'] = p2_score
                    writeJSON(data)
                else:
                    print("--Game not tracked")
            finally:
                break
        else:
            settings = slpJS('getSettings', file)
            updateChars(settings)
            time.sleep(0.5)
            pass
            
#Brute force getting the damage dealt in a game
def getDamageBruteForce(file):
    p = subprocess.Popen(['node', 'node/getDoublesDamage.js', file], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out = p.stdout.read().decode("utf-8").replace("'", '"')
    err = p.stderr.read().decode("utf-8").replace("'", '"')
    if err == '':
        try:
            return json.loads(out)
        except Exception:
            raise Exception("ERROR: '" + file + "' is not a valid .slp replay")
    else:
        raise Exception("ERROR: " + file + " is not a valid .slp replay")

def getDoublesWinner(file):
    try:
        settings = slpJS('getSettings', file)
        lastFrame = slpJS('getLatestFrame', file)
        stocks = []
        percent = []
        for player in lastFrame["players"]:
            if player != None:
                stocks.append(player["post"]["stocksRemaining"])
                percent.append(player["post"]["percent"])
            else:
                stocks.append(0)
                percent.append(0)
        p1_team = settings["players"][0]["teamId"]
        settings["players"].remove(settings["players"][0])
        p1d_index = -1
        for player in settings["players"]:
            if player["teamId"] == p1_team:
                p1d_index = player["playerIndex"]
                break
        if p1d_index == -1:
            return []
        t1_stocks = stocks[0] + stocks[p1d_index]
        t1_percent = percent[0] + percent[p1d_index]
        stocks.remove(stocks[0])
        stocks.remove(stocks[p1d_index])
        percent.remove(percent[0])
        percent.remove(percent[p1d_index])
        t2_stocks = 0
        t2_percent = 0
        winner = 0
        for player_stocks in stocks:
            t2_stocks += player_stocks
        for player_percent in percent:
            t2_percent += player_percent
        if t1_stocks > t2_stocks:
            winner = 1
        elif t2_stocks > t1_stocks:
            winner = 2
        else:
            if t2_percent > t1_percent:
                winner = 1
            elif t1_percent > t2_percent:
                winner = 2
            else:
                return []
        if winner == 1:
            return [{"playerIndex":0,"position":0},{"playerIndex":p1d_index,"position":0}]
        else:
            return [{"playerIndex":settings["players"][0]["playerIndex"],"position":0},{"playerIndex":settings["players"][1]["playerIndex"],"position":0}]
    except Exception as e:
        print(e)

def getGameComplete(file):
    try:
        settings = slpJS('getStats', file)
        gameComplete = settings["gameComplete"]
        if gameComplete:
            return True
        else:
            return False
    except Exception as e:
        print(e)
        print("Exiting slippi loop")
        sys.exit()

#Process currently in-progress .slp file
def processSLP():
    #If the file loaded here is a completed game (ie: not a game in progress), return
    file = getLatestFile(False)
    #TODO: have a better way to detect in-progress games than throwing a fucking exception jesus christ
    #If game is in progress, exception will be thrown and will continue, else it will return and continually loop, lol.
    if file == "":
        return
    try:
        game = Game(file)
        return
    except:
        #game in progress
        print("--Game loaded, in progress...")
        print(slpJS('getSettings', file))
        print(slpJS('getStats', file))
        showSlippi()
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
        writeJSON(data)
    
    game_data = gameDataJSON()
    #Loop till game has ended
    running = True
    while running:
        try:
            #This will throw an exception until the game has ended
            #TODO fix this abomination
            game = Game(file)
            running = False
            #past here the game has ended
            #on normal end, pause for 0.5s
            if game.end.lras_initiator is None or not advanced_game_detection:
                print("--Game ended")
                time.sleep(0.5)
                showCapture()
            #on lrastart, swap instantly
            else:
                print(" --LRAStart - will not automatically update score")
                showCapture()
                running = False
                break
            stats = slpJS('getStats', file)
            settings = slpJS('getSettings', file)
            game_data["p1"]["tag"] = data['Player1']['name']
            game_data["p2"]["tag"] = data['Player2']['name']
            game_data["stage"] = slp_tools.match_stage(settings["stageId"])
            p1_char = ""
            p2_char = ""
            p1port = settings['players'][0]['port']
            p2port = settings['players'][1]['port']
            if p1port < p2port:
                p1_char = slp_tools.match_chars(settings['players'][0]['characterId'], settings['players'][0]['characterColor'])
                p2_char = slp_tools.match_chars(settings['players'][1]['characterId'], settings['players'][1]['characterColor'])
            else:
                p2_char = slp_tools.match_chars(settings['players'][0]['characterId'], settings['players'][0]['characterColor'])
                p1_char = slp_tools.match_chars(settings['players'][1]['characterId'], settings['players'][1]['characterColor'])
            game_data["p1"]["char"] = p1_char["character"]
            game_data["p1"]["colour"] = p1_char["colour"]
            game_data["p2"]["char"] = p2_char["character"]
            game_data["p2"]["colour"] = p2_char["colour"]
            if len(stats["overall"]) == 2:
                scoreupdate = True
                try:
                    for player in settings["players"]:
                        if player["type"] == 1:
                            scoreupdate = False
                            print("  --Game included CPU player")
                except Exception as f:
                    print("Exception trying to parse CPU players")
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
                        match_data = []
                    writeJSON(data)
                else:
                    print("--Game not tracked")
        except Exception as e:
            settings = slpJS('getSettings', file)
            updateChars(settings)
            pass

#Update characters based on what is being played in the .slp file           
def updateChars(settings):
    player_count = len(settings['players'])

    players = settings['players']

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
        writeJSON(data)
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
        players.remove(players[0])

        #player 1 doubles
        for char in players:
            if char['teamId'] == port1_team:
                p1d_char = slp_tools.match_chars(char['characterId'], char['characterColor'])
                players.remove(char)
                break
        #very likely redundant
        p2_char = slp_tools.match_chars(settings['players'][0]['characterId'], settings['players'][0]['characterColor'])
        p2d_char = slp_tools.match_chars(settings['players'][1]['characterId'], settings['players'][1]['characterColor'])
        data = readJSON()

        data['Player1']['character'] = p1_char['character']
        data['Player1']['colour'] = p1_char['colour']
        data['Player1']['character_dubs'] = p1d_char['character']
        data['Player1']['colour_dubs'] = p1d_char['colour']

        data['Player2']['character'] = p2_char['character']
        data['Player2']['colour'] = p2_char['colour']
        data['Player2']['character_dubs'] = p2d_char['character']
        data['Player2']['colour_dubs'] = p2d_char['colour']
        data['is_doubles'] = "true"
        writeJSON(data)

def slpJS(command, file):
    p = subprocess.Popen(['node', 'node/slippi.js', file, command], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out = p.stdout.read().decode("utf-8").replace("'", '"')
    err = p.stderr.read().decode("utf-8").replace("'", '"')
    if err == '':
        try:
            return json.loads(out)
        except Exception:
            raise Exception("ERROR: '" + file + "' is not a valid .slp replay")
    else:
        raise Exception("ERROR: " + file + " is not a valid .slp replay")
    
def slippiLoop():
    match_data = []
    try:
        while True:
            processSLP_new(match_data)
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    if False:#if phase_id != "0":
        print("Searching start.gg for bracket info...")
        top8 = threading.Thread(target=startggLoop, name="startgg loop")
        top8.daemon = True
        top8.start()
    else:
        print("No start.gg phase provided, top 8 data will not be updated")
    if scene_changer == "true":
        if slp_folder == "":
            print("No slippi folder provided, game data will not be tracked")
        else:
            slippi_checker = threading.Thread(target=slippiLoop, name="slippi loop")
            slippi_checker.daemon = True
            slippi_checker.start()
    print("----------\nApplication running. To access settings, go to http://127.0.0.1:" + server_port + "/\n----------")
    app.run(host=host, port=server_port)