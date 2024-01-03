import { clearMapCanvas, updateMap, mCANVAS, m1CANVAS } from "./map.js";
import { drawSpritesheet } from "./tilesets.js";
import { addLayer } from "./layers.js";


export default function setup(map, spritesheet, sprite) {
    document.querySelector('#settings').addEventListener('click', openSettingsModal);
    document.querySelector('#settingsOverlay').addEventListener('click', closeSettingsModal);
    document.querySelector('#updateSettings').addEventListener('click', updateSettings.bind(null, map, spritesheet, sprite));
    document.querySelector('#closeSettingsOverlay').addEventListener('click', closeSettingsModal);
    document.querySelector('#export').addEventListener('click', exportMap.bind(null, map, spritesheet));
    document.querySelector('#import').addEventListener('click', importMap.bind(null, map, spritesheet, sprite));
}


function openSettingsModal() {
    if(document.querySelector('#settingsOverlay').style.display != '')
        document.querySelector('#settingsOverlay').style.display = '';
    else
        document.querySelector('#settingsOverlay').style.display = 'none';
}


function closeSettingsModal(e) {
    if(e.target == e.currentTarget) {
        document.querySelector('#widthInTiles').value = '';
        document.querySelector('#heightInTiles').value = '';
        
        document.querySelector('#settings').click();
    }
}


function updateSettings(map, spritesheet, sprite) {
    map.widthInTiles = document.querySelector('#widthInTiles').value;
    map.heightInTiles = document.querySelector('#heightInTiles').value;
    mCANVAS.width = map.widthInTiles * spritesheet.tileWidth;
    mCANVAS.height = map.heightInTiles * spritesheet.tileHeight;
    if(mCANVAS.width > 0 && mCANVAS.height > 0)
        mCANVAS.style.border = '';      /* Draw border now that there's actual tiles in it */
    map.updateLayerLength();
    m1CANVAS.width = mCANVAS.width;
    m1CANVAS.height = mCANVAS.height;
    updateMap(map, spritesheet, sprite);
    clearMapCanvas(spritesheet);
    closeSettingsModal({target: 'close', currentTarget: 'close'});
}


function exportMap(map, spritesheet) {
    // Establish layers data (already set up - Array data, int height (same as map height), int id, String name, bool visible, int width (same as map width))
    let layerData = JSON.stringify(map.layerData);
    
    // Establish tileset data (int columns, int firstgid (gid @ 0,0), String image, int imageheight (px), int imagewidth (px), String name, int spacing (px between tiles), int tilewidth (max width of tiles), int tileheight (max height of tiles))
    let tileset = `{"columns":${spritesheet.image.width / spritesheet.tileWidth}, "firstgid": 1, "image": "${spritesheet.image.src}", "imageheight": ${spritesheet.image.height}, "imagewidth": ${spritesheet.image.width}, "spacing": 0, "tilewidth": ${spritesheet.tileWidth}, "tileheight": ${spritesheet.tileHeight}}`;
    
    // Establish map data (int height (# of tile rows), Array layers, int tileheight (px), Array tilesets, int tilewidth (px), int width (# of tile columns))
    let mapData = `{"height": ${map.heightInTiles}, "layers": ${layerData}, "tileheight": ${spritesheet.tileHeight}, "tilesets": [${tileset}], "tilewidth": ${spritesheet.tileWidth}, "width": ${map.widthInTiles}}`;
    
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(mapData));
    element.setAttribute('download', 'map.json');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


function importMap(map, spritesheet, sprite) {
    let element = document.createElement('input');
    element.setAttribute('type', 'file');
    element.setAttribute('accept', '.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    
    element.oninput = () => {
        let filereader = new FileReader();
        filereader.readAsText(element.files[0]);
        filereader.onload = () => {
            const obj = JSON.parse(filereader.result);
            
            /* Clear whatever the previously-selected tile type was */
            sprite.x = -1;
            sprite.y = 0;
            
            /* Load the new settings */
            map.layerData = [];
            map.heightInTiles = obj.height;
            map.widthInTiles = obj.width;
            spritesheet.tileHeight = obj.tileheight;
            spritesheet.tileWidth = obj.tilewidth;
            spritesheet.image.width = obj.tilesets[0].imagewidth;
            spritesheet.image.height = obj.tilesets[0].imageheight;
            spritesheet.image.src = obj.tilesets[0].image;

            /* Draw the spritesheet "palatte" */
            spritesheet.image.onload = drawSpritesheet.bind(null, spritesheet);

            /* Update the canvas size for drawing the imported map */
            m1CANVAS.width = mCANVAS.width = map.widthInTiles * spritesheet.tileWidth;
            m1CANVAS.height = mCANVAS.height = map.heightInTiles * spritesheet.tileHeight;
            
            /* Load the map layers */
            for(let i = 0; i < obj.layers.length; i++) {
                addLayer(obj.layers[i].name, map, spritesheet, sprite, obj.layers[i].visible);
            }
            /* Easiest to set map.layerData[].data is overwriting all layer data */
            map.layerData = obj.layers;


            /* Draw border now that there's actual tiles in the map */
            if(mCANVAS.width > 0 && mCANVAS.height > 0)
            mCANVAS.style.border = '';      

            /* Draw the new map */
            updateMap(map, spritesheet, sprite);
            clearMapCanvas(spritesheet);
            
            closeSettingsModal({target: 'close', currentTarget: 'close'});
        };
    };
    
    document.body.removeChild(element);
}