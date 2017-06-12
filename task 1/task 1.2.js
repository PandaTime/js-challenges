var objectType   = '[object Object]',
    arrayType    = '[object Array]',
    functionType = '[object Function]';
/*
 1)Comparing sorted Object.keys;
 2)Comparing JSON.stringify objects.length;
 3)Comparing JSON.stringify objects;
 4)Comparing per elements;
 * In case of an embedded object - recursion;
 */

var api = {};
module.exports = api;

api.deepCompare = function(obj1, obj2){
    if(Object.prototype.toString.call(obj1) !== objectType || Object.prototype.toString.call(obj2) !== objectType)
        throw "One or both of elements aren't objects";
    var obj1Keys = Object.keys(obj1),
        obj2Keys = Object.keys(obj2);
    if(obj1Keys.sort().join() !== obj2Keys.sort().join())
        return false;
    var obj1str = JSON.stringify(obj1),
        obj2str = JSON.stringify(obj2);
    if(obj1str.length !== obj2str.length)
        return false;
    if(obj1str === obj2str)
        return true;
    delete obj1str, obj2str;
    return (obj1Keys.map(function(value){
        var el1 = obj1[value],
            el2 = obj2[value];
        if(el1 === el2 || (el1 !== el1 && el2 !== el2))
            return true;
        if(Object.prototype.toString.call(el1) === objectType && Object.prototype.toString.call(el2) === objectType)
            return api.compareExtend(el1, el2);
        else if(Object.prototype.toString.call(el1) === arrayType && Object.prototype.toString.call(el2) === arrayType){
            return el1.length !== el2.length ? false: !el1.filter(function(v, i){return v !== el2[i]}).join();
        }else if(Object.prototype.toString.call(el1) === functionType && Object.prototype.toString.call(el2) === functionType){
            return el1.toString() === el2.toString();
        }else
            return false;
    }).every(function(elem){return elem === true}));
};
