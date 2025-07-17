const sqlite3 = require('sqlite3').verbose();
const logging = require("./logging.js");
const fs = require("fs");
const path = require('path');

exports.FILTERSDIRECTORY = "data/database-filters/";

const db = new sqlite3.Database(path.join(__dirname, '..', 'data/database.db'));

db.run(`
    CREATE TABLE if NOT EXISTS players(
        slug varchar(255) PRIMARY KEY,
        name varchar(255),
        country varchar(255),
        prefix varchar(255),
        pronouns varchar(255),
        character varchar(255),
        colour varchar(255)
    )
`);

exports.getDB = (fn) => {
    db.all(`SELECT * FROM players ORDER BY name ASC`,
        (err, res) => {
            fn(res);
        });
};

exports.getFilteredDB = (fn) => {
    this.getFilter((err, list) => {
        this.getDB((db) => {
            if (err) {
                fn(db)
            } else {
                filtered = db.filter((player) => {
                    return list.some((slug) => {
                        return player.slug === slug;
                    })
                });
                fn(filtered)
            }
        });
    })
}


exports.getPlayer = (slug, fn) => {
    db.all(`SELECT * FROM players WHERE slug = ?`,
        slug,
        (err, res) => {
            fn(res);
        });
};

exports.addPlayer = (player, fn) => {
    db.all(`SELECT * FROM players WHERE slug = ?`,
        player.slug,
        (err, res) => {
            let updated = 0
            if (res.length > 0) {
                updated = 1
            }
            db.run(
                `REPLACE INTO players(slug, name, country, prefix, pronouns, character, colour) VALUES (?,?,?,?,?,?,?)`,
                [
                    player.slug,
                    player.name,
                    player.country,
                    player.prefix,
                    player.pronouns,
                    player.character,
                    player.colour
                ],
                (err, res) => {
                    fn(err, player.name, updated)
                }
            )
        })

}

exports.updatePlayer = (player, fn) => {
    db.all(`SELECT * FROM players WHERE slug = ?`,
        player.slug,
        (err, res) => {
            let updated = 0
            let updatedPlayer = player;
            if (res.length > 0) {
                updated = 1
                updatedPlayer = {
                    slug: player.slug,
                    name: player.name || res[0].name,
                    country: player.country || res[0].country,
                    prefix: player.prefix,
                    pronouns: player.pronouns.replace(/\b\w/g, l => l.toUpperCase()),
                    character: player.character || res[0].character,
                    colour: player.colour || res[0].colour
                }
            }
            db.run(
                `REPLACE INTO players(slug, name, country, prefix, pronouns, character, colour) VALUES (?,?,?,?,?,?,?)`,
                [
                    updatedPlayer.slug,
                    updatedPlayer.name,
                    updatedPlayer.country,
                    updatedPlayer.prefix,
                    updatedPlayer.pronouns,
                    updatedPlayer.character,
                    updatedPlayer.colour
                ],
                (err, res) => {
                    fn(err, updatedPlayer.name, updated)
                }
            )
        })

}

exports.addIfNotExists = (player, fn) => {
    db.run(
        `INSERT INTO players(slug, name, country, prefix, pronouns, character, colour) VALUES (?,?,?,?,?,?,?)`,
        [
            player.slug,
            player.name,
            player.country,
            player.prefix,
            player.pronouns,
            player.character,
            player.colour
        ],
        (err, res) => {
            fn(err, player.name)
        }
    )
}

exports.removePlayer = (slug, fn) => {
    db.all(`SELECT * FROM players WHERE slug = ?`,
        slug,
        (err, res) => {
            if (err) {
                fn(true)
            }
            if (res.length > 0) {
                db.run(`DELETE FROM players WHERE slug = ?`,
                    { slug: slug },
                    () => {
                        fn(false)
                    })
            }
        });
}

exports.getFilter = (fn) => {
    try {
        slug = config["start.gg"]["Database filter"]
        if (!!slug) {
            const filter = JSON.parse(fs.readFileSync(this.FILTERSDIRECTORY + slug + ".json"))
            fn(false, filter)
        } else {
            fn(true)
        }
    } catch (e) {
        fn(e)
    }

}

exports.createFilter = (players, slug, fn) => {
    try {
        fs.writeFileSync(this.FILTERSDIRECTORY + slug + ".json", JSON.stringify(players));
        fn(false)
    } catch (e) {
        fn(e)
    }
}