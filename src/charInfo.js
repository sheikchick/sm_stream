const path = require("path");

const {charactersByName, characterRandom} = require("./slpTools.js");

const sagaDir = path.join(__dirname, '..', 'static', 'img', 'saga_icons');
const cssDir = path.join(__dirname, '..', 'static', 'img', 'css_icons');
const cspDir = path.join(__dirname, '..', 'static', 'img', 'csp_icons');
const vsDir = path.join(__dirname, '..', 'static', 'img', 'vs_icons');

const pmDir = path.join(__dirname, '..', 'static', 'img', 'pm');

const stockIcons = 'stock_icons';
const stockDir = path.join(__dirname, '..', 'static', 'img', stockIcons);
const feteStockDir = path.join(__dirname, '..', 'static', 'img', 'fete_icons');
const overlayDir = path.join(__dirname, '..', 'static', 'img', 'overlay');


const sides = ['p1', 'p2'];

const getColourSafe = (colours, colour) => colours[Math.max(0, colours.indexOf(colour))];
const _getCsp = ({character, colours}, colour) =>
    path.join(cspDir, character, `${getColourSafe(colours, colour)}.png`);

exports.getCharacterByName = (name) => charactersByName[name] || characterRandom;

exports.getSaga = (characterName) => {
    const character = this.getCharacterByName(characterName);
    return path.join(sagaDir, `${character.saga}.png`);
};

exports.getCss = (characterName) => {
    const {character, css} = this.getCharacterByName(characterName);
    return path.join(cssDir, `${css || character}.png`);
};

exports.getCsp = (characterName, colour) => _getCsp(this.getCharacterByName(characterName), colour);

exports.getStock = (characterName, colour, overlay) => {
    const {character, colours, stock} = this.getCharacterByName(characterName);
    return path.join(
        ...(overlay ? [overlayDir, overlay, stockIcons] : [stockDir]),
        `${stock || path.join(character, getColourSafe(colours, colour))}.png`
    );
};

exports.getFeteStock = (characterName, colour) => {
    const {character, colours, stock} = this.getCharacterByName(characterName);
    return path.join(
        ...([feteStockDir]),
        `${stock || path.join(character, getColourSafe(colours, colour))}.png`
    );
};

exports.getPMCss = (characterName) => {
    return path.join(pmDir, "css_icons", `${characterName}.png`);
};

exports.getPMCsp = (characterName) => {
    return path.join(pmDir, "csp_icons", `${characterName}.png`);
}

exports.getPMStock = (characterName) => {
    return path.join(pmDir, "stock_icons", `${characterName}.png`);
};

exports.getVs = (characterName, colour, side) => {
    const character = charactersByName[characterName];

    return character
        ? path.join(
            vsDir,
            character.character,
            `${getColourSafe(character.colours, colour)}-${sides[Math.max(0, sides.indexOf(side))]}.png`
        )
        : _getCsp(characterRandom, colour);
};