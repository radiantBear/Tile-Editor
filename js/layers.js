import { clearMapCanvas, updateMap } from "./map.js";

export default function setup(map, spritesheet, sprite) {
    document.querySelector('#newLayer').addEventListener('click', openLayerModal);
    document.querySelector('#submitLayer').addEventListener('click', submitLayer.bind(null, map, spritesheet, sprite));
    document.querySelector('#layerOverlay').addEventListener('click', closeLayerModal);
    document.querySelector('#closeLayerOverlay').addEventListener('click', closeLayerModal);
}


export function addLayer(title, map, spritesheet, sprite, visibile = true) {
    let layer = document.querySelector('#layerTemplate').content.cloneNode(true);
    
    let elmt = layer.querySelector('.layer');
    elmt.querySelector('.lname').innerHTML = title;
    elmt.querySelector('.ltrash').addEventListener('click', removeLayer.bind(null, map));
    elmt.querySelector('.lvisible').addEventListener('click', hideLayer.bind(null, map, spritesheet, sprite));
    elmt.addEventListener('click', layerSelect.bind(null, map));
    
    map.createLayer(title);
    
    document.querySelector('#layers').insertBefore(layer, document.querySelector('#newLayer'));
    elmt.click();

    if(!visibile)
        elmt.querySelector('.lvisible').click();
}


function openLayerModal() {
    if(document.querySelector('#layerOverlay').style.display != '')
        document.querySelector('#layerOverlay').style.display = '';
    else
        document.querySelector('#layerOverlay').style.display = 'none';
}


function closeLayerModal(e) {
    if(e.target == e.currentTarget) {
        document.querySelector('#name').value = '';
        document.querySelector('#newLayer').click();
    }
}


function submitLayer(map, spritesheet, sprite) {
    let title = document.querySelector('#name').value;
    if(!title)
        return;
    
    for(let i = 0; i < map.layerData.length; i++) {
        if(map.layerData[i].name == title)
            return;
    }
    
    addLayer(title, map, spritesheet, sprite);
    
    closeLayerModal({target: 'close', currentTarget: 'close'});
}


function removeLayer(map, e) {
    let layer = e.currentTarget.parentNode;
    let layerName = layer.querySelector('.lname').innerHTML;
    if(!confirm('Delete ' + layerName + ' layer?'))
        return;
    
    for(let i = 0; i < map.layerData.length; i++) {
        if(map.layerData[i].name == layerName) {
            map.layerData.splice(i, 1);
        }
    }
    layer.remove();
}


function hideLayer(map, spritesheet, sprite, e) {
    let layer = e.currentTarget.parentNode.querySelector('.lname');
    for(let i = 0; i < map.layerData.length; i++) {
        if(map.layerData[i].name == layer.innerHTML) {
            map.layerData[i].visible = !map.layerData[i].visible;
            updateMap(map, spritesheet, sprite);
            clearMapCanvas(spritesheet);
            
            let img = layer.parentNode.querySelector('.lvisible');
            let filePath = img.src.slice(0, img.src.lastIndexOf('/')+1);
            if(img.src == filePath + 'eye.png')
                img.src = filePath + 'noEye.png';
            else
                img.src = filePath + 'eye.png';
            
            return;
        }
    }
    
}


function layerSelect(map, e) {
    let target = e.target;
    if(!target.classList.contains('layer'))
        target = target.parentNode;
    let current = document.querySelector('.layer.current');
    target.classList.add('current');
    map.currentLayer = target.querySelector('.lname').innerHTML;
    
    if(target==current || !current)
        return;
    current.classList.remove('current');
}
