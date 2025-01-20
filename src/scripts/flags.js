continents = {
    "Europe": [
        {
            "country": "United Kingdom",
            "shortcode": "UK",
            "emoji": "🇬🇧"
        },
        {
            "country": "Scotland",
            "shortcode": "SC",
            "emoji": "🏴󠁧󠁢󠁳󠁣󠁴󠁿"
        },
        {
            "country": "Wales",
            "shortcode": "WA",
            "emoji": "🏴󠁧󠁢󠁷󠁬󠁳󠁿"
        },
        {
            "country": "England",
            "shortcode": "EN",
            "emoji": "🏴󠁧󠁢󠁥󠁮󠁧󠁿"
        },
        {
            "country": "Ireland",
            "shortcode": "IE",
            "emoji": "🇮🇪"
        },
        {
            "country": "Europe",
            "shortcode": "EU",
            "emoji": "🇪🇺"
        },
        {
            "country": "Austria",
            "shortcode": "AT",
            "emoji": "🇦🇹"
        },
        {
            "country": "Belgium",
            "shortcode": "BE",
            "emoji": "🇧🇪"
        },
        {
            "country": "Denmark",
            "shortcode": "DK",
            "emoji": "🇩🇰"
        },
        {
            "country": "Finland",
            "shortcode": "FI",
            "emoji": "🇫🇮"
        },
        {
            "country": "France",
            "shortcode": "FR",
            "emoji": "🇫🇷"
        },
        {
            "country": "Germany",
            "shortcode": "DE",
            "emoji": "🇩🇪"
        },
        {
            "country": "Greece",
            "shortcode": "GR",
            "emoji": "🇬🇷"
        },
        {
            "country": "Hungary",
            "shortcode": "HU",
            "emoji": "🇭🇺"
        },
        {
            "country": "Italy",
            "shortcode": "IT",
            "emoji": "🇮🇹"
        },
        {
            "country": "Jersey",
            "shortcode": "JE",
            "emoji": "🇯🇪"
        },
        {
            "country": "Netherlands",
            "shortcode": "NL",
            "emoji": "🇳🇱"
        },
        {
            "country": "Norway",
            "shortcode": "NO",
            "emoji": "🇳🇴"
        },
        {
            "country": "Poland",
            "shortcode": "PL",
            "emoji": "🇵🇱"
        },
        {
            "country": "Portugal",
            "shortcode": "PT",
            "emoji": "🇵🇹"
        },
        {
            "country": "Russia",
            "shortcode": "RU",
            "emoji": "🇷🇺"
        },
        {
            "country": "Spain",
            "shortcode": "ES",
            "emoji": "🇪🇸"
        },
        {
            "country": "Sweden",
            "shortcode": "SE",
            "emoji": "🇸🇪"
        },
        {
            "country": "Switzerland",
            "shortcode": "CH",
            "emoji": "🇨🇭"
        }
    ],
    "Americas": [
        {
            "country": "United States",
            "shortcode": "US",
            "emoji": "🇺🇸"
        },
        {
            "country": "Canada",
            "shortcode": "CA",
            "emoji": "🇨🇦"
        },
        {
            "country": "Mexico",
            "shortcode": "MX",
            "emoji": "🇲🇽"
        },
        {
            "country": "Brazil",
            "shortcode": "BR",
            "emoji": "🇧🇷"
        },{
            "country": "Argentina",
            "shortcode": "AR",
            "emoji": "🇦🇷"
        },
        {
            "country": "Peru",
            "shortcode": "PE",
            "emoji": "🇵🇪"
        },
        {
            "country": "Nicaragua",
            "shortcode": "NI",
            "emoji": "🇳🇮"
        },
    ],
    "Asia & The Middle East": [
        {
            "country": "Japan",
            "shortcode": "JP",
            "emoji": "🇯🇵"
        },
        {
            "country": "India",
            "shortcode": "IN",
            "emoji": "🇮🇳"
        },
        {
            "country": "Pakistan",
            "shortcode": "PK",
            "emoji": "🇵🇰"
        },
        {
            "country": "Indonesia",
            "shortcode": "ID",
            "emoji": "🇮🇩"
        },
        {
            "country": "China",
            "shortcode": "CN",
            "emoji": "🇨🇳"
        },
        {
            "country": "Hong Kong",
            "shortcode": "HK",
            "emoji": "🇭🇰"
        },
        {
            "country": "Iran",
            "shortcode": "IR",
            "emoji": "🇮🇷"
        },
        {
            "country": "Palestine",
            "shortcode": "PS",
            "emoji": "🇵🇸"
        }
    ],
    "Africa": [
        {
            "country": "Algeria",
            "shortcode": "DZ",
            "emoji": "🇩🇿"
        },
        {
            "country": "Morocco",
            "shortcode": "MA",
            "emoji": "🇲🇦"
        },
        {
            "country": "Egypt",
            "shortcode": "EG",
            "emoji": "🇪🇬"
        },
        {
            "country": "South Africa",
            "shortcode": "ZA",
            "emoji": "🇿🇦"
        }
    ],
    "Oceania": [
        {
            "country": "Australia",
            "shortcode": "AU",
            "emoji": "🇦🇺"
        },
        {
            "country": "New Zealand",
            "shortcode": "NZ",
            "emoji": "🇳🇿"
        }
    ]
}

function fixCountry(country) {
    console.log()
    if (!country) {
        return("United Kingdom")
    }
    console.log(country)
    switch(country) {
        case "United Kingdom":
        case "Scotland":
        case "England":
        case "Wales":
        case "Ireland":
        case "Europe":
        case "Austria":
        case "Belgium":
        case "Denmark":
        case "Italy":
        case "Finland":
        case "France":
        case "Germany":
        case "Greece":
        case "Netherlands":
        case "Norway":
        case "Portugal":
        case "Poland":
        case "Russia":
        case "Spain":
        case "Sweden":
        case "Switzerland":
        case "United States":
        case "Canada":
        case "Mexico":
        case "Brazil":
        case "Argentina":
        case "Peru":
        case "Nicaragua":
        case "Japan":
        case "India":
        case "Pakistan":
        case "Indonesia":
        case "China":
        case "Hong Kong":
        case "Iran":
        case "Palestine":
        case "Algeria":
        case "Morocco":
        case "Egypt":
        case "South Africa":
        case "Australia":
        case "New Zealand":
            return(country)
        case "Ukraine":
        case "Czechia":
        case "Czech Republic":
        case "Hungary":
        case "Belarus":
        case "Bulgaria":
        case "Serbia":
        case "Slovakia":
        case "Croatia":
        case "Bosnia and Herzegovina":
        case "Moldova":
        case "Lithuania":
        case "Albania":
        case "Slovenia":
        case "Latvia":
        case "North Macedonia":
        case "Estonia":
        case "Luxembourg":
        case "Montenegro":
        case "Malta":
        case "Iceland":
        case "Andorra":
        case "Liechtenstein":
        case "Monaco":
        case "San Marino":
            return("Europe")
        default:
            return("United Kingdom") //should represent as a generic 'World' but its funny
    }
}

/**
 * Country overrides for start.gg
 * @param {string} id 
 */
function getCountry(id) {
    switch(id) {
        case "4d748723": //Rain
        case "d631c836": //Pedlar
            return "Wales"
        case "f825129b": //TTS
        case "a6b8165f": //stylo
        case "ae822819": //Sho
        case "84930fa2": //Fenrir
        case "97843dde": //Socks
        case "b81e0517": //Pyros
        case "3e83f059": //GROM
            return "Scotland"
        default:
            return null;
    }
}