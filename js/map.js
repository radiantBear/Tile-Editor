export const mCANVAS = document.querySelector('#mapCanvas');       /* Shows the hidden canvas' content + the currently-selected tile at the current cursor position */
export const m1CANVAS = document.querySelector('#mapHidden1');     /* Hidden canvas stores the current image from the overlayed layers */
const Mctx = mCANVAS.getContext('2d');


let mousedown = false;
let tool = 'pen';


export default function setup(map, spritesheet, sprite) {
    mCANVAS.addEventListener('mousemove', reactMoveMapCvs.bind(null, map, spritesheet, sprite));
    mCANVAS.addEventListener('mousedown', reactClickMapCvs.bind(null, map, spritesheet, sprite));
    mCANVAS.addEventListener('mouseup', () => mousedown = false);
    mCANVAS.addEventListener('mouseout', () => { mousedown = false; clearMapCanvas(spritesheet)});

    document.querySelector('#penTool').addEventListener('click', e => {
        tool = 'pen';
        e.currentTarget.src = 'img/greenPen.png';
        document.querySelector('#eraserTool').src = 'img/eraser.png';
    });
    document.querySelector('#eraserTool').addEventListener('click', e => {
        tool = 'eraser';
        e.currentTarget.src = 'img/greenEraser.png';
        document.querySelector('#penTool').src = 'img/pen.png';
    });
}


export function clearMapCanvas(spritesheet) {
    if(!spritesheet.image.src)
        return;
        
    Mctx.clearRect(0, 0, mCANVAS.width, mCANVAS.height);
    Mctx.drawImage(m1CANVAS, 0, 0);
}


/* Update the hidden canvas with the current display */
export function updateMap(map, spritesheet, sprite) {
    let M1ctx = m1CANVAS.getContext('2d');
    M1ctx.clearRect(0, 0, m1CANVAS.width, m1CANVAS.height);
    M1ctx.strokeStyle = '#bbb';
    if(!spritesheet.tileWidth)
        return;
    for(let i = 0; i < m1CANVAS.width; i += spritesheet.tileWidth) {
        M1ctx.beginPath();
        M1ctx.moveTo(i, 0);
        M1ctx.lineTo(i, m1CANVAS.height);
        M1ctx.stroke();
        M1ctx.closePath();
    }
    for(let i = 0; i < m1CANVAS.height; i += spritesheet.tileHeight) {
        M1ctx.beginPath();
        M1ctx.moveTo(0, i);
        M1ctx.lineTo(m1CANVAS.width, i);
        M1ctx.stroke();
        M1ctx.closePath();
    }
    for(let i = 0; i < map.layerData.length; i++) {
        if(!map.layerData[i].visible)
            continue;
        for(let j = 0; j < map.layerData[i].data.length; j++) {
            let [sx, sy] = sprite.getXY(map.layerData[i].data[j]);
            sx *= spritesheet.tileWidth;
            sy *= spritesheet.tileHeight;
            if(Math.min(sx, sy) < 0)
                continue;
            let dx = j % map.widthInTiles * spritesheet.tileWidth;
            let dy = Math.trunc(j / map.widthInTiles) * spritesheet.tileHeight;
            M1ctx.drawImage(spritesheet.image, sx, sy, spritesheet.tileWidth, spritesheet.tileHeight, dx, dy, spritesheet.tileWidth, spritesheet.tileHeight);
        }
    }
}


function reactMoveMapCvs(map, spritesheet, sprite, e) {
    if(!spritesheet.image.src)
        return;
    
    clearMapCanvas(spritesheet);
    
    if(!mousedown) {
    Mctx.drawImage(spritesheet.image,                                                         // img
                   sprite.x * spritesheet.tileWidth,                                          // sx
                   sprite.y * spritesheet.tileHeight,                                         // sy
                   spritesheet.tileWidth,                                                     // swidth
                   spritesheet.tileHeight,                                                    // sheight
                   Math.trunc(e.offsetX / spritesheet.tileWidth) * spritesheet.tileWidth,     // dx
                   Math.trunc(e.offsetY / spritesheet.tileHeight) * spritesheet.tileHeight,   // dy
                   spritesheet.tileWidth,                                                     // dwidth
                   spritesheet.tileHeight)                                                    // dheight
    Mctx.strokeStyle = '#111'
    Mctx.strokeRect(Math.trunc(e.offsetX / spritesheet.tileWidth) * spritesheet.tileWidth,     // dx
                    Math.trunc(e.offsetY / spritesheet.tileHeight) * spritesheet.tileHeight,   // dy
                    spritesheet.tileWidth,                                                     // dwidth
                    spritesheet.tileHeight)                                                    // dheight
    } else {
        reactClickMapCvs(map, spritesheet, sprite, {offsetX: e.offsetX, offsetY: e.offsetY})
    } //Show where drawing tile or draw tile if pressing mouse
}


function reactClickMapCvs(map, spritesheet, sprite, e) {
    mousedown = true;
    let layerId = -1;
    
    for(let i = 0; i < map.layerData.length; i++) {
        if(map.layerData[i].name == map.currentLayer) {
            layerId = i;
            break;
        }
    }
    if(layerId == -1)
        return;
    
    let x = Math.trunc(e.offsetX / spritesheet.tileWidth);
    let y = Math.trunc(e.offsetY / spritesheet.tileHeight);
    let location = y * map.widthInTiles + x;
    
    if(tool == 'pen')
        map.layerData[layerId].data[location] = sprite.gid;
    if(tool == 'eraser')
        map.layerData[layerId].data[location] = 0;
    
    updateMap(map, spritesheet, sprite);
}