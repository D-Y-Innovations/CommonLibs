var Const = require("constellation");

var checkPoint = function(point_in_const, corner1, corner2){
    var corner1_in_const = new Const.Point( corner1[0], corner1[1]);
    var corner2_in_const = new Const.Point( corner2[0], corner2[1]);
    return Const.intersect( point_in_const, new Const.Point(999, 999), corner1_in_const, corner2_in_const);
};

module.exports = function(point, polygon){
    console.assert(point.length == 2 && polygon.length > 2);
    polygon.forEach(function(corner){
        console.assert(corner.length == 2);
    });
    
    var point_in_const = new Const.Point( point[0], point[1] );
    var cross_count = 0;
    for(var i = 0; i < polygon.length - 1; i++) {
        if(checkPoint(point_in_const, polygon[i], polygon[i+1])) {
            cross_count++;
        }
    }
    if(checkPoint(point_in_const, polygon[0], polygon[polygon.length-1])) {
        cross_count++;
    }
    
    return cross_count % 2 == 1;
};