const sqlite3 = require('sqlite3').verbose();
const logging = require("./logging.js");
const fs = require("fs");
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'data/database.db'));
db.run(`
    CREATE TABLE if NOT EXISTS players(
        slug varchar(255) PRIMARY KEY,
        name varchar(255),
        country varchar(255),
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

exports.getDBFromList = (list) => {
    this.getDB((db) => {
        return db.filter((player) => {
            list.some((slug) => {
                player.slug === slug;
            })
        });
    });

}

exports.addPlayer = (player, fn) => {
    db.all(`SELECT * FROM players WHERE slug = '${player.slug}'`,
        (err, res) => {
            let updated = 0
            if (res.length > 0) {
                updated = 1
            }
            db.run(`REPLACE INTO
                        players(slug, name, country, pronouns, character, colour)
                    VALUES  ('${player.slug}', '${player.name}', '${player.country}', '${player.pronouns}', '${player.character}', '${player.colour}')
                    `,
                (err, res) => {
                    fn(err, player.name, updated)
                })
        })

}

exports.addIfNotExists = (player, fn) => {
    db.run(`INSERT INTO
                players(slug, name, country, pronouns, character, colour)
            VALUES  ('${player.slug}', '${player.name}', '${player.country}', '${player.pronouns}', '${player.character}', '${player.colour}')
        `,
        (err, res) => {
            fn(err, player.name)
        })
}

exports.removePlayer = (slug, fn) => {
    db.all(`SELECT * FROM players WHERE slug = '${slug}'`,
        (err, res) => {
            if (err) {
                fn(true)
            }
            if (res.length > 0) {
                db.run(`DELETE FROM
                            players
                        WHERE
                            slug = '${slug}'
                `,
                    () => {
                        fn(false)
                    })
            }
        });
}