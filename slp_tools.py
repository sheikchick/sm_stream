#Returns a string of the stage name based on the ID
def print_match(match):
    p1_score = 0
    p2_score = 0
    for game in match:
        match game["winner"]:
            case 1:
                p1_score += 1
            case 2:
                p2_score += 1
            case _:
                pass
    print(game["p1"]["tag"] + " " + str(p1_score) + " - " + str(p2_score) + " " + game["p2"]["tag"])
    for game in match:
        print_game(game)
    return

def print_game(game):
    line = ""
    for x in range(0, 4-game['p1']['stocks']):
        line += "-"
    for x in range(0, game['p1']['stocks']):
        line += "O"
    line += "| " + game['stage'] + " |"
    for x in range(0, game['p2']['stocks']):
        line += "O"
    for x in range(0, 4-game['p2']['stocks']):
        line += "-"
    print(line)
    return

def match_stage(id):
    match id:
        case 2: #LEGAL
            return "Fountain of Dreams"
        case 3: #LEGAL
            return "Pokemon Stadium"
        case 4:
            return "Princess Peach's Castle"
        case 5:
            return "Kongo Jungle"
        case 6:
            return "Brinstar"
        case 7:
            return "Corneria"
        case 8: #LEGAL
            return "Yoshis Story"
        case 9:
            return "Onett"
        case 10:
            return "Mute City"
        case 11:
            return "Rainbow Cruise"
        case 12:
            return "Jungle Japes"
        case 13:
            return "Great Bay"
        case 14:
            return "Hyrule Temple"
        case 15:
            return "Brinstar Depths"
        case 16:
            return "Yoshi's Island"
        case 17:
            return "Green Greens"
        case 18:
            return "Fourside"
        case 19:
            return "Mushroom Kingdom I"
        case 20:
            return "Mushroom Kingdom II"
        case 22:
            return "Venom"
        case 23:
            return "Poke Floats"
        case 24:
            return "Big Blue"
        case 25:
            return "Icicle Mountain"
        case 27:
            return "Flat Zone"
        case 28: #LEGAL
            return "Dream Land N64"
        case 29:
            return "Yoshi's Island N64"
        case 30:
            return "Kongo Jungle N64"
        case 31: #LEGAL
            return "Battlefield"
        case 32: #LEGAL
            return "Final Destination"
        case _:
            return None

#Returns a dict of the character + color in string format
def match_chars(character, color):
    s_character = ""
    s_color = ""
    match character:
        case 0: #falcon
            s_character = "captainfalcon"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "dark"
                case 2:
                    s_color = "red"
                case 3:
                    s_color = "white"
                case 4:
                    s_color = "green"
                case 5:
                    s_color = "blue"
        case 1: #dk
            s_character = "donkeykong"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "dark"
                case 2:
                    s_color = "red"
                case 3:
                    s_color = "blue"
                case 4:
                    s_color = "green"
        case 2: #fox
            s_character = "fox"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
        case 3: #gaw
            s_character = "gameandwatch"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
        case 4: #kirby
            s_character = "kirby"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "yellow"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "red"
                case 4:
                    s_color = "green"
                case 5:
                    s_color = "white"
        case 5: #bowser
            s_character = "bowser"
            match color:
                case 0:
                    s_color = "green"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "green"
                case 3:
                    s_color = "black"
        case 6: #link
            s_character = "link"
            match color:
                case 0:
                    s_color = "green"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "black"
                case 4:
                    s_color = "white"
        case 7: #luigi
            s_character = "luigi"
            match color:
                case 0:
                    s_color = "green"
                case 1:
                    s_color = "white"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "red"
        case 8: #mario
            s_character = "mario"
            match color:
                case 0:
                    s_color = "red"
                case 1:
                    s_color = "yellow"
                case 2:
                    s_color = "black"
                case 3:
                    s_color = "blue"
                case 4:
                    s_color = "green"
        case 9: #marth
            s_character = "marth"
            match color:
                case 0:
                    s_color = "blue"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "green"
                case 3:
                    s_color = "black"
                case 4:
                    s_color = "white"
        case 10: #mewtwo
            s_character = "mewtwo"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
        case 11: #ness
            s_character = "ness"
            match color:
                case 0:
                    s_color = "red"
                case 1:
                    s_color = "yellow"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
        case 12: #peach
            s_character = "peach"
            match color:
                case 0:
                    s_color = "red"
                case 1:
                    s_color = "gold"
                case 2:
                    s_color = "white"
                case 3:
                    s_color = "blue"
                case 4:
                    s_color = "green"
        case 13: #pikachu
            s_character = "pikachu"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
        case 14: #ics
            s_character = "iceclimbers"
            match color:
                case 0:
                    s_color = "blue"
                case 1:
                    s_color = "green"
                case 2:
                    s_color = "yellow"
                case 3:
                    s_color = "red"
        case 15: #jigglypuff
            s_character = "jigglypuff"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
                case 4:
                    s_color = "gold"
        case 16: #samus
            s_character = "samus"
            match color:
                case 0:
                    s_color = "red"
                case 1:
                    s_color = "pink"
                case 2:
                    s_color = "dark"
                case 3:
                    s_color = "green"
                case 4:
                    s_color = "blue"
        case 17: #yoshi
            s_character = "yoshi"
            match color:
                case 0:
                    s_color = "green"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "yellow"
                case 4:
                    s_color = "pink"
                case 5:
                    s_color = "cyan"
        case 18: #zelda
            s_character = "sheik"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
                case 4:
                    s_color = "white"
        case 19: #sheik
            s_character = "sheik"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
                case 4:
                    s_color = "white"
        case 20: #falco
            s_character = "falco"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
        case 21: #ylink
            s_character = "younglink"
            match color:
                case 0:
                    s_color = "green"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "white"
                case 4:
                    s_color = "black"
        case 22: #doc
            s_character = "drmario"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
                case 4:
                    s_color = "black"
        case 23: #roy
            s_character = "roy"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
                case 4:
                    s_color = "gold"
        case 24: #pichu
            s_character = "pichu"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
        case 25: #ganondorf
            s_character = "ganondorf"
            match color:
                case 0:
                    s_color = "original"
                case 1:
                    s_color = "red"
                case 2:
                    s_color = "blue"
                case 3:
                    s_color = "green"
                case 4:
                    s_color = "purple"
    return {
        "character": s_character,
        "colour": s_color
    }