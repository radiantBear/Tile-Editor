import { clearMapCanvas, updateMap, mCANVAS, m1CANVAS } from './map.js';


const tCANVAS = document.querySelector('#tilesetCanvas');
const Tctx = tCANVAS.getContext('2d');


export default function setup(map, spritesheet, sprite) {
    document.querySelector('#newTileset').addEventListener('click', openTilesetModal);
    document.querySelector('#fileOverlay').addEventListener('click', exitFile, true);
    document.querySelector('#fileInput').addEventListener('input', checkFileData);
    document.querySelector('#tileWidth').addEventListener('input', checkFileData);
    document.querySelector('#tileHeight').addEventListener('input', checkFileData);
    document.querySelector('#submitData').addEventListener('click', submitTileset.bind(null, map, spritesheet, sprite));
    document.querySelector('#closeFileOverlay').addEventListener('click', exitFile);
    
    tCANVAS.addEventListener('mousemove', reactMoveTilesetCvs.bind(null, spritesheet));
    tCANVAS.addEventListener('click', reactClickTilesetCvs.bind(null, spritesheet, sprite));
    tCANVAS.addEventListener('mouseout', drawTilesetCvs.bind(null, spritesheet));
}


export function drawSpritesheet(spritesheet) {
    Tctx.clearRect(0, 0, tCANVAS.width, tCANVAS.height);
        tCANVAS.width = spritesheet.image.width;
        tCANVAS.height = spritesheet.image.height;
        if(tCANVAS.width > 0 && tCANVAS.height > 0)
            tCANVAS.style.border = '';
        Tctx.drawImage(spritesheet.image, 0, 0);
}


function openTilesetModal() {
    if(document.querySelector('#fileOverlay').style.display != '')
        document.querySelector('#fileOverlay').style.display = '';
    else
        document.querySelector('#fileOverlay').style.display = 'none';
}


function exitFile(e) {
    if(e.target == e.currentTarget) {
        document.querySelector('#submitData').style.display = 'none';
        document.querySelector('#fileInput').value = '';
        document.querySelector('#fileInputLabel').innerHTML = 'Choose File';
        document.querySelector('#tileWidth').value = '';
        document.querySelector('#tileHeight').value = '';
        
        document.querySelector('#newTileset').click();
    }
}


function checkFileData(e) {
    let fileInput = document.querySelector('#fileInput');
    let tileWidth = document.querySelector('#tileWidth');
    let tileHeight = document.querySelector('#tileHeight');
    
    if(tileWidth.value!='' && tileHeight.value!='' && fileInput.files.length) {
        document.querySelector('#submitData').style.display = '';
    } else {
        document.querySelector('#submitData').style.display = 'none';
    }
    
    if(e.target == fileInput) {
        if(fileInput.files.length)
            document.querySelector('#fileInputLabel').innerHTML = fileInput.files[0].name;
        else
            document.querySelector('#fileInputLabel').innerHTML = 'Choose File';
    }
}


function submitTileset(map, spritesheet, sprite) {
    spritesheet.tileWidth = Number(document.querySelector('#tileWidth').value);
    spritesheet.tileHeight = Number(document.querySelector('#tileHeight').value);
    mCANVAS.width = map.widthInTiles * spritesheet.tileWidth;
    mCANVAS.height = map.heightInTiles * spritesheet.tileHeight;
    if(mCANVAS.width > 0 && mCANVAS.height)
        mCANVAS.style.border = '';      /* Draw border now that there's actual tiles in it */
    m1CANVAS.width = mCANVAS.width;
    m1CANVAS.height = mCANVAS.height;
    
    let filereader = new FileReader();
    filereader.readAsDataURL(document.querySelector('#fileInput').files[0]);
    filereader.onload = () => { // file is loaded
        spritesheet.image.src = filereader.result; // is the data URL because called with readAsDataURL
        spritesheet.image.onload = drawSpritesheet.bind(null, spritesheet);
    };
    
    updateMap(map, spritesheet, sprite);
    clearMapCanvas(spritesheet);
    exitFile({target: 'close', currentTarget: 'close'});
}


function reactMoveTilesetCvs(spritesheet, e) {
    if(!spritesheet.image.src)
        return;

    drawTilesetCvs(spritesheet);
    
    let width = spritesheet.tileWidth;
    let height = spritesheet.tileHeight;
    
    Tctx.fillStyle = 'rgba(187, 187, 187, 0.5)'
    Tctx.fillRect(Math.trunc(e.offsetX / width) * width, Math.trunc(e.offsetY / height) * height, width, height);
}


function reactClickTilesetCvs(spritesheet, sprite, e) {
    sprite.x = Math.trunc(e.offsetX / spritesheet.tileWidth);
    sprite.y = Math.trunc(e.offsetY / spritesheet.tileHeight);
}


function drawTilesetCvs(spritesheet) {
    Tctx.clearRect(0, 0, tCANVAS.width, tCANVAS.height);
    Tctx.drawImage(spritesheet.image, 0, 0);
}