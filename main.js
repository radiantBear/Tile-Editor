import setupMap      from './js/map.js';
import setupTilesets from './js/tilesets.js';
import setupLayers   from './js/layers.js';
import setupSettings from './js/settings.js';


/* Define spritesheet object for use throughout */
/* TODO: relocate to tilesets.js with getter/setter methods? */
const spritesheet = {};
spritesheet.image = new Image();


/* Define object to represent the currently-selected sprite for placing on the map */
/* TODO: relocate to tilesets.js with getter/setter methods? */
const sprite = {
    x: -1,
    y: 0,
    get gid() {
        return (this.y * (spritesheet.image.width / spritesheet.tileWidth)) + this.x + 1
    },
    
    getXY: function(gid) {
        let y = Math.trunc((gid-1) / (spritesheet.image.width / spritesheet.tileWidth));
        let x = (gid-1) % (spritesheet.image.width / spritesheet.tileWidth);
        return [x, y];
    }
};


/* Define map object representing all data for the map, with helper functions for import/export */
/* TODO: refactor into other files - mainly layers.js? */
const map = {
    layerData : [],
    currentLayer : '',
    widthInTiles : 6,
    heightInTiles : 6,
    
    createLayer : function(name) {
        let data = new Array(this.widthInTiles * this.heightInTiles);
        data.fill(0);
        this.layerData.push({name: name, data:data, visible: true});
    },
    
    updateLayerLength : function() {
        // TODO: Redo with splice() to maintain position of tiles in x-y plane
        
        let fullArray = new Array(this.widthInTiles * this.heightInTiles);
        fullArray.fill(0);
        for(let i = 0; i < this.layerData.length; i++) {
            this.layerData[i].data = this.layerData[i].data.concat(fullArray).splice(0, this.widthInTiles * this.heightInTiles);
        }
    }
}


/* Attach event listeners to components in each section of the page */
setupMap(map, spritesheet, sprite);
setupTilesets(map, spritesheet, sprite);
setupLayers(map, spritesheet, sprite);
setupSettings(map, spritesheet, sprite);


/* Define keyboard shortcuts */
/* TODO: Refactor into other files? ie `KeyE` to map.js? */
function reactToKeys(e) {
    if(e.code == 'Enter') {
        if(document.querySelector('#fileOverlay').style.display!='none' && document.querySelector('#submitData').style.display!='none')
            document.querySelector('#submitData').click();
        if(document.querySelector('#layerOverlay').style.display!='none')
            document.querySelector('#submitLayer').click();
        if(document.querySelector('#settingsOverlay').style.display!='none')
            document.querySelector('#updateSettings').click();
    }
    if(e.code == 'KeyE' && e.target.tagName.toLowerCase() != 'input')
        document.querySelector('#eraserTool').click();
    if(e.code == 'KeyP' && e.target.tagName.toLowerCase() != 'input')
        document.querySelector('#penTool').click();;
}
document.addEventListener('keydown', reactToKeys, true);


/* Require confirmation before leaving page so unsaved changes aren't lost */
addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});